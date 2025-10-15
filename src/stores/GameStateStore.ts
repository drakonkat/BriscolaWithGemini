/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from '.';
import type { Card, Player, Suit, GamePhase, GameEmotionalState, Waifu, TrickHistoryEntry, HistoryEntry, CardDeckStyle } from '../core/types';
import { translations } from '../core/translations';
import { getLocalAIMove, getFallbackWaifuMessage } from '../core/localAI';
import { getAIWaifuTrickMessage, getAIGenericTeasingMessage, QuotaExceededError } from '../core/gemini';
import { playSound } from '../core/soundManager';
import { WAIFUS } from '../core/waifus';

export abstract class GameStateStore {
    rootStore: RootStore;

    // Game State
    phase: GamePhase = 'menu';
    turn: Player = 'human';
    trickStarter: Player = 'human';
    humanHand: Card[] = [];
    aiHand: Card[] = [];
    deck: Card[] = [];
    cardsOnTable: Card[] = [];
    briscolaCard: Card | null = null;
    briscolaSuit: Suit | null = null;
    humanScore = 0;
    aiScore = 0;
    trickHistory: HistoryEntry[] = [];
    lastTrick: TrickHistoryEntry | null = null;
    trickCounter = 0;
    isTutorialGame = false;

    // UI & Waifu State
    currentWaifu: Waifu | null = null;
    message = '';
    aiEmotionalState: GameEmotionalState = 'neutral';
    backgroundUrl = '';
    
    // Technical State
    isProcessing = false; // A general flag for when the game is thinking (AI move, resolving trick, etc.)
    isResolvingTrick = false;
    lastResolvedTrick: string[] = [];
    gameResult: 'human' | 'ai' | 'tie' | null = null;
    lastGameWinnings = 0;
    gameMode: 'online' | 'fallback' = 'online';
    isQuotaExceeded = false;
    isAiGeneratingMessage = false;

    // Drag and Drop state
    draggingCardInfo: { card: Card; element: HTMLElement } | null = null;
    clonePosition: { x: number; y: number } | null = null;
    currentDropZone: 'normal' | 'power' | 'cancel' | null = null;

    usedFallbackMessages: string[] = [];

    constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    get T() {
        return translations[this.rootStore.gameSettingsStore.language];
    }

    // Abstract methods to be implemented by subclasses
    abstract startGame(param: Waifu | null | 'R' | 'SR' | 'SSR'): void;
    abstract resolveTrick(): void;
    abstract drawCards(): void;
    abstract handleEndOfGame(): void;
    abstract getCardPoints(card: Card): number;

    // --- Common Game Actions ---
    goToMenu = () => {
        this.phase = 'menu';
        this.clearSavedGame();
    }

    confirmLeaveGame = () => {
        if (this.phase === 'playing') {
            this.rootStore.posthog?.capture('game_left', {
                gameplay_mode: this.rootStore.gameSettingsStore.gameplayMode,
                turn_number: this.trickCounter,
            });
        }
        this.goToMenu();
    }

    continueFromQuotaModal = () => {
        this.gameMode = 'fallback';
        this.rootStore.uiStore.setIsQuotaExceededModalOpen(false);
    }
    
    handleQuotaExceeded = () => {
        this.isQuotaExceeded = true;
        this.rootStore.uiStore.setIsQuotaExceededModalOpen(true);
    }

    // --- Player Actions ---
    selectCardForPlay = (card: Card, activatePower?: boolean) => {
        if (this.turn !== 'human' || this.isProcessing || this.rootStore.uiStore.isTutorialActive && this.rootStore.uiStore.tutorialStep === 'promptPlayCard' && card.value !== 'Asso') return;
        
        if (this.isTutorialGame) {
             this.rootStore.uiStore.nextTutorialStep();
        }

        this.playCard(card, 'human');
    }

    playCard = (card: Card, player: Player) => {
        if (player === 'human') {
            this.humanHand = this.humanHand.filter(c => c.id !== card.id);
        } else {
            this.aiHand = this.aiHand.filter(c => c.id !== card.id);
        }
        this.cardsOnTable.push(card);
        this.rootStore.uiStore.setAnimatingCard({ card, player });
        playSound('card-place');

        setTimeout(() => {
            runInAction(() => {
                this.rootStore.uiStore.setAnimatingCard(null);
                if (this.cardsOnTable.length === 1) {
                    this.turn = player === 'human' ? 'ai' : 'human';
                    if (this.turn === 'ai' && this.currentWaifu) {
                         this.message = this.T.aiPlayedYourTurn(this.currentWaifu.name);
                    }
                }
            });
        }, 300);
    }

    // --- AI Logic ---
    handleAiTurn = async () => {
        if (this.phase !== 'playing' || this.turn !== 'ai' || this.isProcessing || this.cardsOnTable.length === 2) return;

        this.isProcessing = true;
        
        // Wait for player animation to finish
        await new Promise(resolve => setTimeout(resolve, 500));

        const aiCard = getLocalAIMove(
            this.aiHand,
            this.briscolaSuit!,
            this.cardsOnTable,
            this.rootStore.gameSettingsStore.difficulty
        );
        
        this.playCard(aiCard, 'ai');
        
        if (this.isTutorialGame) {
            this.rootStore.uiStore.onTutorialGameEvent('aiResponded');
        }

        this.isProcessing = false;
    }

    // --- Waifu Interaction Logic ---
    updateEmotionalState = () => {
        const scoreDiff = this.aiScore - this.humanScore;
        if (scoreDiff > 15) this.aiEmotionalState = 'winning';
        else if (scoreDiff < -15) this.aiEmotionalState = 'losing';
        else this.aiEmotionalState = 'neutral';
    }

    getWaifuMessage = async (humanCard: Card, aiCard: Card, points: number, winner: Player) => {
        if (this.gameMode === 'fallback' || !this.currentWaifu || !this.rootStore.gameSettingsStore.isChatEnabled) {
            const fallbackMessage = getFallbackWaifuMessage(
                this.currentWaifu!, 
                this.aiEmotionalState, 
                this.rootStore.gameSettingsStore.language, 
                this.usedFallbackMessages
            );
            this.usedFallbackMessages.push(fallbackMessage);
            this.rootStore.chatStore.addMessageToChat(fallbackMessage, 'ai');
            return;
        }

        try {
            this.isAiGeneratingMessage = true;
            let result: { message: string, tokens: number };
            if (winner === 'ai') {
                 result = await getAIWaifuTrickMessage(
                    this.currentWaifu,
                    this.aiEmotionalState,
                    humanCard,
                    aiCard,
                    points,
                    this.rootStore.gameSettingsStore.language
                );
            } else {
                result = await getAIGenericTeasingMessage(
                    this.currentWaifu,
                    this.aiEmotionalState,
                    this.aiScore,
                    this.humanScore,
                    this.rootStore.gameSettingsStore.language
                );
            }
            this.rootStore.chatStore.addMessageToChat(result.message, 'ai');
            this.rootStore.chatStore.setTokenCount(this.rootStore.chatStore.tokenCount + result.tokens);
            
            if (!this.rootStore.uiStore.isChatModalOpen) {
                this.rootStore.uiStore.showWaifuBubble(result.message);
                this.rootStore.uiStore.setUnreadMessageCount(c => c + 1);
            }

            this.rootStore.posthog?.capture('gemini_request_completed', { 
                source: 'waifu_message', 
                tokens_used: result.tokens,
                emotional_state: this.aiEmotionalState,
            });

        } catch (error) {
            if (error instanceof QuotaExceededError) {
                this.rootStore.posthog?.capture('api_quota_exceeded', { source: 'waifu_message' });
                this.handleQuotaExceeded();
            } else {
                console.error("Error getting waifu message:", error);
                this.rootStore.chatStore.addMessageToChat(this.T.chatFallback, 'ai');
            }
        } finally {
            runInAction(() => this.isAiGeneratingMessage = false);
        }
    }

    // --- Drag and Drop Methods (to be overridden in Roguelike) ---
    handleDragStart(card: Card, e: React.MouseEvent | React.TouchEvent) { /* no-op */ }
    handleDragMove(e: MouseEvent | TouchEvent, zones: Record<string, HTMLElement | null>) { /* no-op */ }
    handleDragEnd() { /* no-op */ }

    // --- Save/Load Game State ---
    saveGame() { /* no-op in base, override if needed */ }
    loadGame() { /* no-op in base, override if needed */ }
    clearSavedGame() { /* no-op in base, override if needed */ }
    resumeGame() { /* no-op in base, override if needed */ }
    get hasSavedGame(): boolean { return false; }
    
    // --- Tutorial-specific Methods ---
    startTutorialGame() {
        this.isTutorialGame = true;
        this.startGame(WAIFUS.find(w => w.name === 'Sakura')!);
        this.humanHand = [
            { id: 't-1', suit: 'Bastoni', value: 'Asso' },
            { id: 't-2', suit: 'Coppe', value: '7' },
            { id: 't-3', suit: 'denara', value: '4' },
        ];
        this.aiHand = [
            { id: 't-4', suit: 'Bastoni', value: '3' },
            { id: 't-5', suit: 'Spade', value: 'Re' },
            { id: 't-6', suit: 'denara', value: 'Fante' },
        ];
        this.briscolaCard = { id: 't-b', suit: 'Spade', value: '5' };
        this.briscolaSuit = 'Spade';
        this.rootStore.uiStore.switchToInGameTutorial();
    }
    
    resolveTrickForTutorial() {
        if (!this.isTutorialGame) return;
        this.lastTrick = {
            trickNumber: 1,
            humanCard: this.cardsOnTable[0],
            aiCard: this.cardsOnTable[1],
            winner: 'human',
            points: 21,
            basePoints: 21,
            bonusPoints: 0,
            bonusPointsReason: '',
        };
        this.humanScore = 21;
        this.cardsOnTable = [];
        this.rootStore.uiStore.onTutorialGameEvent('trickResolved');
        
        setTimeout(() => {
            this.rootStore.uiStore.onTutorialGameEvent('cardsDrawn');
        }, 1000);
    }
}
