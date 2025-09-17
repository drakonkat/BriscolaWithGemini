/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import type { Chat } from '@google/genai';
import type { RootStore } from '.';
import type { ChatMessage, GameEmotionalState, Waifu } from '../core/types';
import { ai } from '../core/gemini';
import { translations } from '../core/translations';
import { playSound } from '../core/soundManager';

export class ChatStore {
    rootStore: RootStore;
    chatHistory: ChatMessage[] = [];
    chatSession: Chat | null = null;
    isAiChatting = false;
    hasChattedThisTurn = false;
    tokenCount = 0;

    constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;

        reaction(
            () => ({
                phase: this.rootStore.gameStateStore.phase,
                waifu: this.rootStore.gameStateStore.currentWaifu
            }),
            ({ phase, waifu }) => {
                if ((this.prevPhase === 'menu' || this.prevPhase === 'power-selection') && phase === 'playing' && waifu) {
                    this.resetChat(waifu);
                }
                this.prevPhase = phase;
            }
        );

        reaction(
            () => ({
                emotionalState: this.rootStore.gameStateStore.aiEmotionalState,
                chatHistory: this.chatHistory.length,
                currentWaifu: this.rootStore.gameStateStore.currentWaifu,
            }),
            () => {
                if (this.rootStore.gameStateStore.currentWaifu) {
                    this.updateChatSession();
                }
            }
        );
    }
    
    prevPhase = 'menu';

    get T() {
        return translations[this.rootStore.gameSettingsStore.language];
    }
    
    resetChat = (waifu: Waifu) => {
        if (!this.rootStore.gameSettingsStore.isChatEnabled) {
            this.chatHistory = [];
            this.chatSession = null;
            return;
        }
        const initialAiMessage: ChatMessage = { sender: 'ai', text: waifu.initialChatMessage[this.rootStore.gameSettingsStore.language] };
        this.chatHistory = [initialAiMessage];
        this.rootStore.uiStore.showWaifuBubble(initialAiMessage.text);
    }

    updateChatSession = () => {
        const { isChatEnabled, language } = this.rootStore.gameSettingsStore;
        const { currentWaifu, aiEmotionalState } = this.rootStore.gameStateStore;
        if (!isChatEnabled || !currentWaifu) return;

        const systemInstruction = currentWaifu.systemInstructions[language][aiEmotionalState];
        const apiHistory: ChatMessage[] = [...this.chatHistory];
        
        if (apiHistory.length === 0 || apiHistory[0].sender === 'ai') {
            apiHistory.unshift({ sender: 'human', text: language === 'it' ? 'Ciao!' : 'Hi!' });
        }

        const cleanedHistoryForApi: { role: string; parts: { text: string }[] }[] = [];
        if (apiHistory.length > 0) {
            cleanedHistoryForApi.push({ role: 'user', parts: [{ text: apiHistory[0].text }] });
            for (let i = 1; i < apiHistory.length; i++) {
                const currentMsg = apiHistory[i];
                const lastCleanedMsg = cleanedHistoryForApi[cleanedHistoryForApi.length - 1];
                const currentRole = currentMsg.sender === 'human' ? 'user' : 'model';

                if (currentRole === lastCleanedMsg.role) {
                    lastCleanedMsg.parts[0].text += `\n\n${currentMsg.text}`;
                } else {
                    cleanedHistoryForApi.push({ role: currentRole, parts: [{ text: currentMsg.text }] });
                }
            }
        }
        
        this.chatSession = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
            history: cleanedHistoryForApi,
        });
    }

    handleSendChatMessage = async (userMessage: string) => {
        const { gameStateStore, gameSettingsStore, uiStore } = this.rootStore;
        if (gameStateStore.isQuotaExceeded || !this.chatSession || !gameSettingsStore.isChatEnabled) return;
        
        this.rootStore.posthog?.capture('chat_message_sent', { message_length: userMessage.length });
        const humanMessage: ChatMessage = { sender: 'human', text: userMessage };
        this.addMessageToChat(humanMessage.text, 'human');
        this.isAiChatting = true;
        this.hasChattedThisTurn = true;
    
        try {
            const response = await this.chatSession.sendMessage({ message: userMessage });
            const aiMessage: ChatMessage = { sender: 'ai', text: response.text };
            const tokensUsed = response.usageMetadata?.totalTokenCount ?? 0;
            this.tokenCount += tokensUsed;
            
            this.rootStore.posthog?.capture('gemini_request_completed', { source: 'chat_message', tokens_used: tokensUsed });
            
            runInAction(() => {
                this.chatHistory.push(aiMessage);
                if (!uiStore.isChatModalOpen) {
                    uiStore.showWaifuBubble(aiMessage.text);
                    uiStore.setUnreadMessageCount(prev => prev + 1);
                }
                playSound('chat-notify');
            });

        } catch (error: any) {
            if (error.toString().includes('RESOURCE_EXHAUSTED')) {
                this.rootStore.posthog?.capture('api_quota_exceeded', { source: 'chat_message' });
                gameStateStore.handleQuotaExceeded();
            } else {
                console.error("Error sending chat message:", error);
                const fallbackMessage: ChatMessage = { sender: 'ai', text: this.T.chatFallback };
                runInAction(() => this.chatHistory.push(fallbackMessage));
            }
        } finally {
            runInAction(() => this.isAiChatting = false);
        }
    }
    
    addMessageToChat = (message: string, sender: 'ai' | 'human') => {
        if (this.rootStore.gameSettingsStore.isChatEnabled) {
            this.chatHistory.push({ sender, text: message });
        }
    }
    
    setHasChattedThisTurn = (hasChatted: boolean) => {
        this.hasChattedThisTurn = hasChatted;
    }

    setTokenCount = (count: number) => {
        this.tokenCount = count;
    }
}