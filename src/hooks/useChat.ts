/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { usePostHog } from 'posthog-js/react';

import type { ChatMessage, GameEmotionalState, Language, Waifu, GamePhase } from '../core/types';
import { ai } from '../core/gemini';
import { translations } from '../core/translations';
import { playSound } from '../core/soundManager';

type useChatProps = {
    isChatEnabled: boolean;
    currentWaifu: Waifu | null;
    emotionalState: GameEmotionalState;
    language: Language;
    isChatModalOpen: boolean;
    showWaifuBubble: (message: string) => void;
    setUnreadMessageCount: React.Dispatch<React.SetStateAction<number>>;
    isQuotaExceeded: boolean;
    onQuotaExceeded: () => void;
    phase: GamePhase;
};

export const useChat = ({
    isChatEnabled,
    currentWaifu,
    emotionalState,
    language,
    isChatModalOpen,
    showWaifuBubble,
    setUnreadMessageCount,
    isQuotaExceeded,
    onQuotaExceeded,
    phase,
}: useChatProps) => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [isAiChatting, setIsAiChatting] = useState(false);
    const [hasChattedThisTurn, setHasChattedThisTurn] = useState(false);
    const [tokenCount, setTokenCount] = useState(0);

    const posthog = usePostHog();
    const T = translations[language];

    const resetChat = useCallback((waifu: Waifu) => {
        if (!isChatEnabled) {
            setChatHistory([]);
            setChatSession(null);
            return;
        }
        const initialAiMessage: ChatMessage = { sender: 'ai', text: waifu.initialChatMessage[language] };
        setChatHistory([initialAiMessage]);
        showWaifuBubble(initialAiMessage.text);
    }, [isChatEnabled, language, showWaifuBubble]);

    // FIX: Explicitly initialize useRef with undefined to satisfy rules requiring an argument.
    const prevPhaseRef = useRef<GamePhase | undefined>(undefined);
    useEffect(() => {
        prevPhaseRef.current = phase;
    });
    const prevPhase = prevPhaseRef.current;

    useEffect(() => {
        if ((prevPhase === 'menu' || prevPhase === 'roguelike-map') && phase === 'playing' && currentWaifu) {
            resetChat(currentWaifu);
        }
    // FIX: Removed `prevPhase` from the dependency array as it's a derived value from a ref and not a state or prop.
    }, [phase, currentWaifu, resetChat]);


    const updateChatSession = useCallback(() => {
        if (!isChatEnabled || !currentWaifu) return;

        const systemInstruction = currentWaifu.systemInstructions[language][emotionalState];
        const apiHistory: ChatMessage[] = [...chatHistory];
        
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
        
        // FIX: The `ai.chats.create` method expects a configuration object as its argument.
        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
            history: cleanedHistoryForApi,
        });
        setChatSession(newChat);
    }, [isChatEnabled, currentWaifu, language, emotionalState, chatHistory]);

    useEffect(() => {
        if (currentWaifu) {
            updateChatSession();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emotionalState, chatHistory, currentWaifu]);

    const handleSendChatMessage = async (userMessage: string) => {
        if (isQuotaExceeded || !chatSession || !isChatEnabled) return;
        
        posthog.capture('chat_message_sent', { message_length: userMessage.length });
        const humanMessage: ChatMessage = { sender: 'human', text: userMessage };
        setChatHistory(prev => [...prev, humanMessage]);
        setIsAiChatting(true);
        setHasChattedThisTurn(true);
    
        try {
            // FIX: The chat.sendMessage method in the Gemini SDK expects an object with a 'message' property.
            const response = await chatSession.sendMessage({ message: userMessage });
            const aiMessage: ChatMessage = { sender: 'ai', text: response.text };
            const tokensUsed = response.usageMetadata?.totalTokenCount ?? 0;
            setTokenCount(prev => prev + tokensUsed);
            
            posthog.capture('gemini_request_completed', { source: 'chat_message', tokens_used: tokensUsed });
            setChatHistory(prev => [...prev, aiMessage]);
            if (!isChatModalOpen) {
                showWaifuBubble(aiMessage.text);
                setUnreadMessageCount(prev => prev + 1);
            }
            playSound('chat-notify');
        } catch (error: any) {
            if (error.toString().includes('RESOURCE_EXHAUSTED')) {
                posthog.capture('api_quota_exceeded', { source: 'chat_message' });
                onQuotaExceeded();
            } else {
                console.error("Error sending chat message:", error);
                const fallbackMessage: ChatMessage = { sender: 'ai', text: T.chatFallback };
                setChatHistory(prev => [...prev, fallbackMessage]);
            }
        } finally {
            setIsAiChatting(false);
        }
    };
    
    const addMessageToChat = useCallback((message: string, sender: 'ai' | 'human') => {
        if(isChatEnabled) {
            setChatHistory(prev => [...prev, { sender, text: message }]);
        }
    }, [isChatEnabled]);

    return {
        chatState: {
            chatHistory,
            isAiChatting,
            hasChattedThisTurn,
            tokenCount,
        },
        chatActions: {
            handleSendChatMessage,
            setHasChattedThisTurn,
            resetChat,
            addMessageToChat,
            setTokenCount,
        }
    };
};