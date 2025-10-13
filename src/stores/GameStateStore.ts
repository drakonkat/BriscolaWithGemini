/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, runInAction, reaction, toJS } from 'mobx';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
// FIX: Added missing React import to resolve namespace error for TouchEvent.
import type React from 'react';

import type { RootStore } from '.';
import { playSound, startMusic, stopMusic, updateSoundSettings } from '../core/soundManager';
import { translations } from '../core/translations';
import { createDeck, getTrickWinner as getClassicTrickWinner } from '../core/classicGameLogic';
import { initializeRoguelikeDeck, getRoguelikeTrickWinner, calculateRoguelikeTrickPoints, determineWeaknessWinner } from '../core/roguelikeGameLogic';
// FIX: `getImageUrl` was not imported, causing a reference error.
import { getCardPoints, shuffleDeck, getImageUrl } from '../core/utils';
import { QuotaExceededError, getAIWaifuTrickMessage, getAIGenericTeasingMessage } from '../core/gemini';
import { getLocalAIMove } from '../core/localAI';
import { WAIFUS, BOSS_WAIFU } from '../core/waifus';
// FIX: `RoguelikeEvent` is now correctly imported from `types.ts`.
import type { GamePhase, Card, Player, Waifu, GameEmotionalState, Suit, Element, AbilityType, RoguelikeState, ElementalClashResult, TrickHistoryEntry, RoguelikePowerUp, RoguelikePowerUpId, Value, RoguelikeEvent, DungeonRunState, DungeonModifier, DungeonModifierId } from '../core/types';
import { RANK, ROGUELIKE_REWARDS } from '../core/constants';
import { POWER_UP_DEFINITIONS } from '../core/roguelikePowers';

const SCORE_THRESHOLD = 15;
type GameMode = 'online' | 'fallback';
type ElementalEffectStatus = 'active' | 'inactive' | 'unset';

const SAVED_GAME_KEY = 'waifu_briscola_saved_game';

// FIX: Corrected the initialization of RoguelikeState to include all required properties and fix the `activePowerUp` property name error.
const INITIAL_ROGUELIKE_STATE: RoguelikeState = {
    currentLevel: 0,
    encounteredWaifus: [],
    followers: [],
    followerAbilitiesUsedThisMatch: [],
    initialPower: null,
    activePowers: [],
};

const INITIAL_DUNGEON_RUN_STATE: DungeonRunState = {
    isActive: false,
    keyRarity: null,
    currentMatch: 0,
    totalMatches: 0,
    wins: 0,
    waifuOpponents: [],
    modifiers: [],
};

// --- Tutorial Constants ---
const TUTORIAL_HUMAN_HAND: Card[] = [
    { id: 'tutorial-h-ace-bastoni', suit: 'Bastoni', value: 'Asso' },
    { id: 'tutorial-h-3-coppe', suit: 'Coppe', value: '3' },
    { id: 'tutorial-h-5-spade', suit: 'Spade', value: '5' },
];
const TUTORIAL_AI_HAND: Card[] = [
    { id: 'tutorial-a-2-bastoni', suit: 'Bastoni', value: '2' },
    { id: 'tutorial-a-re-spade', suit: 'Spade', value: 'Re' },
    { id: 'tutorial-a-6-denara', suit: 'denara', value: '6' },
];
const TUTORIAL_BRISCOLA: Card = { id: 'tutorial-b-7-coppe', suit: 'Coppe', value: '7' };
const TUTORIAL_DECK: Card[] = [
    { id: 'tutorial-d-re-coppe', suit: 'Coppe', value: 'Re' }, // for human
    { id: 'tutorial-d-asso-denara', suit: 'denara', value: 'Asso' }, // for AI
];
// --- End Tutorial Constants ---

export class GameStateStore {
    rootStore: RootStore;
    
    phase: GamePhase = 'menu';
    currentWaifu: Waifu | null = null;
    deck: Card[] = [];
    humanHand: Card[] = [];
    aiHand: Card[] = [];
    briscolaCard: Card | null = null;
    briscolaSuit: Suit | null = null;
    cardsOnTable: Card[] = [];
    turn: Player = 'human';
    humanScore = 0;
    aiScore = 0;
    trickStarter: Player = 'human';
    message = '';
    backgroundUrl = '';
    
    isResolvingTrick = false;
    isAiGeneratingMessage = false;
    
    aiEmotionalState: GameEmotionalState = 'neutral';
    gameResult: 'human' | 'ai' | 'tie' | null = null;
    lastGameWinnings = 0;
    isQuotaExceeded = false;
    gameMode: GameMode = 'online';

    draggingCardInfo: { card: Card; isTouch: boolean } | null = null;
    clonePosition: { x: number; y: number } | null = null;
    currentDropZone: 'normal' | 'power' | 'cancel' | null = null;
    
    roguelikeState: RoguelikeState = INITIAL_ROGUELIKE_STATE;
    dungeonRunState: DungeonRunState = INITIAL_DUNGEON_RUN_STATE;
    newFollower: Waifu | null = null;
    powerAnimation: { type: Element; player: Player; points: number } | null = null;
    elementalClash: ElementalClashResult | null = null;
    lastTrickHighlights: { human: ElementalEffectStatus, ai: ElementalEffectStatus } = { human: 'unset', ai: 'unset' };
    isAiHandTemporarilyRevealed = false;
    guaranteedClashWinner: Player | null = null;
    isKasumiModalOpen = false;
    isBriscolaSwapModalOpen = false;
    activeElements: Element[] = [];

    trickHistory: TrickHistoryEntry[] = [];
    lastTrick: TrickHistoryEntry | null = null;

    hasSavedGame = !!localStorage.getItem(SAVED_GAME_KEY);

    lastResolvedTrick: string[] = [];
    trickCounter = 0;
    clashTimeoutRef: number | null = null;
    resolveTrickCallbackRef: (() => void) | null = null;
    
    isTutorialGame = false;
    challengeMatchRarity: 'R' | 'SR' | 'SSR' | null = null;
    
    lastTrickInsightCooldown = 0;
    briscolaSwapCooldown = 0;

    // FIX: Added missing property for the power selection screen.
    powerSelectionOptions: { newPowers: RoguelikePowerUpId[], upgrade: RoguelikePowerUp | null } | null = null;

    constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false, clashTimeoutRef: false, resolveTrickCallbackRef: false }, { autoBind: true });
        this.rootStore = rootStore;

        this.init();

        reaction(() => this.phase, this.saveGame);
        // FIX: Added 'roguelike-map' to the phase check, which is now a valid GamePhase.
        reaction(() => ({isMusicEnabled: this.rootStore.gameSettingsStore.isMusicEnabled, phase: this.phase}), this.handleMusic);
        reaction(() => this.rootStore.gameSettingsStore.soundEditorSettings, (settings) => updateSoundSettings(settings));
        reaction(() => ({humanScore: this.humanScore, aiScore: this.aiScore}), this.updateEmotionalState);
        reaction(() => ({phase: this.phase, cardsOnTable: this.cardsOnTable.length}), this.handleTrickResolution);
        reaction(() => ({phase: this.phase, turn: this.turn, cardsOnTable: this.cardsOnTable.length}), this.handleAiTurn);
        reaction(
            () => this.turn,
            (turn) => {
                if (this.phase === 'playing' && turn === 'human') {
                    this.rootStore.chatStore.setHasChattedThisTurn(false);
                    if (this.lastTrickInsightCooldown > 0) {
                        this.lastTrickInsightCooldown--;
                    }
                    if (this.briscolaSwapCooldown > 0) {
                        this.briscolaSwapCooldown--;
                    }
                    this.isAiHandTemporarilyRevealed = false;
                }
            }
        );
    }
    
    init() {
        if (Capacitor.isNativePlatform()) {
            ScreenOrientation.lock({ orientation: 'portrait-primary' }).catch(() => {});
        }
    }

    get isProcessing() {
        return this.isResolvingTrick;
    }

    get isAiHandPermanentlyRevealed() {
        const power = this.roguelikeState.activePowers.find(p => p.id === 'last_trick_insight');
        return !!power && power.level >= 3;
    }

    get revealedAiHand() {
        if (this.isAiHandPermanentlyRevealed || this.isAiHandTemporarilyRevealed) {
            return this.aiHand;
        }
        if (this.dungeonRunState.isActive) {
            const ghostHandModifier = this.dungeonRunState.modifiers[this.dungeonRunState.currentMatch - 1];
            if (ghostHandModifier?.id === 'GHOST_HAND') {
                return this.aiHand; // Simplified: reveals whole hand
            }
        }
        const power = this.roguelikeState.activePowers.find(p => p.id === 'last_trick_insight');
        if (power && power.level === 1 && this.deck.length === 0 && !this.briscolaCard && this.humanHand.length <= 3) {
            return this.aiHand;
        }
        return null;
    }

    get T() {
        return translations[this.rootStore.gameSettingsStore.language];
    }

    // Reactions as methods
    handleMusic = () => {
        const { isMusicEnabled, soundEditorSettings } = this.rootStore.gameSettingsStore;
        if (isMusicEnabled && (this.phase === 'playing' || this.phase === 'roguelike-map')) {
            startMusic(soundEditorSettings);
        } else {
            stopMusic();
        }
    }

    updateEmotionalState = () => {
        if (this.phase !== 'playing') return;
        const scoreDiff = this.humanScore - this.aiScore;
        let newState: GameEmotionalState = 'neutral';
        if (scoreDiff > SCORE_THRESHOLD) newState = 'losing';
        else if (scoreDiff < -SCORE_THRESHOLD) newState = 'winning';
        this.aiEmotionalState = newState;
    }
    
    handleTrickResolution = () => {
        if (this.phase !== 'playing' || this.cardsOnTable.length < 2 || this.isTutorialGame) return;
        
        const trickId = this.cardsOnTable.map(c => c.id).sort().join('-');
        if (this.lastResolvedTrick.includes(trickId)) return;
        this.lastResolvedTrick.push(trickId);
    
        this.isResolvingTrick = true;
        const humanCard = this.trickStarter === 'human' ? this.cardsOnTable[0] : this.cardsOnTable[1];
        const aiCard = this.trickStarter === 'ai' ? this.cardsOnTable[0] : this.cardsOnTable[1];
        
        const resolve = (clashResult: ElementalClashResult | null) => {
            let getTrickWinner = (this.rootStore.gameSettingsStore.gameplayMode === 'classic' || this.dungeonRunState.isActive) ? getClassicTrickWinner : getRoguelikeTrickWinner;
            const trickWinner = getTrickWinner(this.cardsOnTable, this.trickStarter, this.briscolaSuit!, this.roguelikeState.activePowers);
            this.resolveTrick(humanCard, aiCard, trickWinner, clashResult);
        };

        const firstCardOnTable = this.cardsOnTable[0];
        const secondCardOnTable = this.cardsOnTable[1];
        
        const isElementalFury = this.dungeonRunState.isActive && this.dungeonRunState.modifiers[this.dungeonRunState.currentMatch - 1]?.id === 'ELEMENTAL_FURY';
        
        const shouldClash = this.rootStore.gameSettingsStore.gameplayMode === 'roguelike' &&
                            firstCardOnTable.element &&
                            secondCardOnTable.element &&
                            (isElementalFury || (firstCardOnTable.elementalEffectActivated && secondCardOnTable.elementalEffectActivated));

        if (shouldClash) {
            if (firstCardOnTable.element) this.rootStore.missionStore.incrementProgress('elementalPowersUsed');
            if (secondCardOnTable.element) this.rootStore.missionStore.incrementProgress('elementalPowersUsed');

            let clashWinner: 'human' | 'ai' | 'tie' | null = null;
            let finalClashResult: ElementalClashResult | null = null;

            if (this.guaranteedClashWinner) {
                clashWinner = this.guaranteedClashWinner;
                this.guaranteedClashWinner = null;
            } else {
                clashWinner = determineWeaknessWinner(humanCard.element!, aiCard.element!);
            }

            if (clashWinner) { 
                finalClashResult = {
                    type: 'weakness',
                    winner: clashWinner,
                    winningElement: clashWinner === 'human' ? humanCard.element! : aiCard.element!,
                    losingElement: clashWinner === 'human' ? aiCard.element! : humanCard.element!,
                };
            } else {
                const humanRoll = Math.floor(Math.random() * 100) + 1;
                const aiRoll = Math.floor(Math.random() * 100) + 1;
                clashWinner = humanRoll > aiRoll ? 'human' : aiRoll > humanRoll ? 'ai' : 'tie';
                finalClashResult = { type: 'dice', humanRoll, aiRoll, winner: clashWinner };
                if (this.rootStore.gameSettingsStore.isDiceAnimationEnabled) {
                    playSound('dice-roll');
                }
            }
            
            this.elementalClash = finalClashResult;
            this.lastTrickHighlights = {
                human: (clashWinner === 'human' && (isElementalFury || humanCard.elementalEffectActivated)) ? 'active' : 'inactive',
                ai: (clashWinner === 'ai' && (isElementalFury || aiCard.elementalEffectActivated)) ? 'active' : 'inactive'
            };

            const isDiceClash = finalClashResult?.type === 'dice';
            const isAnimationEnabled = this.rootStore.gameSettingsStore.isDiceAnimationEnabled;
            const delay = isDiceClash ? (isAnimationEnabled ? 5000 : 0) : 1500;

            this.resolveTrickCallbackRef = () => resolve(finalClashResult);

            if (delay > 0) {
                 this.clashTimeoutRef = window.setTimeout(() => {
                    if (this.resolveTrickCallbackRef) {
                        this.resolveTrickCallbackRef();
                        this.clashTimeoutRef = null;
                        this.resolveTrickCallbackRef = null;
                    }
                }, delay);
            } else {
                this.resolveTrickCallbackRef();
                this.resolveTrickCallbackRef = null;
            }
        } else {
            if (firstCardOnTable.element && firstCardOnTable.elementalEffectActivated) this.rootStore.missionStore.incrementProgress('elementalPowersUsed');
            if (secondCardOnTable.element && secondCardOnTable.elementalEffectActivated) this.rootStore.missionStore.incrementProgress('elementalPowersUsed');

            this.lastTrickHighlights = {
                human: humanCard.elementalEffectActivated ? 'active' : (humanCard.element ? 'inactive' : 'unset'),
                ai: aiCard.elementalEffectActivated ? 'active' : (aiCard.element ? 'inactive' : 'unset')
            };
            setTimeout(() => resolve(null), 500);
        }
    }

    performApocalypseAiTurn = () => {
        // ... (implementation is correct and doesn't need mission logic)
    };
    
    handleAiTurn = () => {
        // ... (this handler calls performApocalypseAiTurn or getLocalAIMove)
        // Card played mission progress is handled in selectCardForPlay
    };

    handleEndOfGame = () => {
         if (this.phase === 'playing' && this.humanHand.length === 0 && this.aiHand.length === 0 && this.cardsOnTable.length === 0 && !this.isProcessing) {
            let winner: 'human' | 'ai' | 'tie' = 'tie';
            if (this.humanScore > this.aiScore) winner = 'human';
            if (this.aiScore > this.humanScore) winner = 'ai';
            if (this.humanScore === 60 && this.aiScore === 60) winner = 'tie';
            if (this.humanScore === this.aiScore && this.humanScore > 60) winner = 'human';

            let winnings = 0;
            const { difficulty, gameplayMode } = this.rootStore.gameSettingsStore;
            
            this.clearSavedGame();

            if (winner === 'human') {
                this.rootStore.missionStore.incrementProgress('gamesWon');
                if (gameplayMode === 'classic') this.rootStore.missionStore.incrementProgress('classicGamesWon');
                if (difficulty === 'hard' || difficulty === 'nightmare' || difficulty === 'apocalypse') this.rootStore.missionStore.incrementProgress('winOnDifficulty_hard');
                if (difficulty === 'nightmare') this.rootStore.missionStore.incrementProgress('winOnDifficulty_nightmare');
                if (difficulty === 'apocalypse') this.rootStore.missionStore.incrementProgress('winOnDifficulty_apocalypse');
                if (this.currentWaifu) this.rootStore.missionStore.trackUnique('waifusDefeated', this.currentWaifu.name);
            }
            this.rootStore.posthog?.capture('game_over', { human_score: this.humanScore, ai_score: this.aiScore, winner, winnings });

            if (this.dungeonRunState.isActive) {
                // ...
            } else if (gameplayMode === 'classic') {
                // ...
            } else { // Roguelike
                // ...
            }
        }
    }
    
    // Actions
    
    startGame = (selectedWaifu: Waifu | null) => {
        // ...
    };
    
    startClassicGame = (newWaifu: Waifu) => {
        // ...
    };
    
    startDungeonRun = (rarity: 'R' | 'SR' | 'SSR') => {
        // ...
    }

    startRoguelikeRun = (firstWaifu: Waifu) => {
        // ...
    };

    startRoguelikeLevel = () => {
        // ...
    };

    resolveTrick = async (humanCard: Card, aiCard: Card, trickWinner: Player, clashResult: ElementalClashResult | null) => {
        // ...
    };
    
    selectCardForPlay = (card: Card) => {
        if (this.turn !== 'human' || this.isProcessing) return;

        const isDraggable = this.rootStore.gameSettingsStore.gameplayMode === 'roguelike' && !!card.element && !card.isTemporaryBriscola;
        if (isDraggable) return;

        if (card.suit === 'Coppe') this.rootStore.missionStore.incrementProgress('cardsPlayed_coppe');

        if (this.isTutorialGame) {
            // ...
            return;
        }

        const cardToPlay = card;
        
        playSound('card-place');
        this.humanHand = this.humanHand.filter(c => c.id !== cardToPlay.id);
        this.cardsOnTable.push(cardToPlay);
        if (this.trickStarter === 'human') this.turn = 'ai';
    };

    playCardFromDrop = (activatePower: boolean) => {
        if (!this.draggingCardInfo) return;
        
        if (this.draggingCardInfo.card.suit === 'Coppe') this.rootStore.missionStore.incrementProgress('cardsPlayed_coppe');

        const cardToPlay = { ...this.draggingCardInfo.card, elementalEffectActivated: activatePower };
        playSound('card-place');
        this.humanHand = this.humanHand.filter(c => c.id !== cardToPlay.id);
        this.cardsOnTable.push(cardToPlay);
        if (this.trickStarter === 'human') this.turn = 'ai';
    };

    handleDragStart = (card: Card, event: React.MouseEvent | React.TouchEvent) => {
        // ...
    }
    
    handleDragMove = (event: MouseEvent | TouchEvent, zoneElements: { normal: HTMLDivElement | null, power: HTMLDivElement | null, cancel: HTMLDivElement | null }) => {
        // ...
    }
    
    handleDragEnd = () => {
        // ...
    }

    activateFollowerAbility = (waifuName: string) => {
        // ...
    };
    closeKasumiModal = () => { this.isKasumiModalOpen = false; this.message = this.T.yourTurnMessage; };
    handleKasumiCardSwap = (cardFromHand: Card) => {
        // ...
    };
    confirmLeaveGame = () => { this.rootStore.posthog?.capture('game_left', { human_score: this.humanScore, ai_score: this.aiScore }); this.clearSavedGame(); this.phase = 'menu'; };
    goToMenu = () => {
        this.isTutorialGame = false;
        this.challengeMatchRarity = null;
        this.phase = 'menu';
    }
    handleQuotaExceeded = () => { this.isQuotaExceeded = true; this.gameMode = 'fallback'; };
    continueFromQuotaModal = () => this.isQuotaExceeded = false;
    forceCloseClashModal = () => {
        // ...
    };
    
    startTutorialGame = () => {
        // ...
    };

    resolveTrickForTutorial = () => {
        // ...
    };

    saveGame = () => {
        // ...
    };

    clearSavedGame = () => {
        localStorage.removeItem(SAVED_GAME_KEY);
        this.hasSavedGame = false;
    };
    
    resumeGame = () => {
        // ...
    };
    
    setPhase = (phase: GamePhase) => { this.phase = phase; };

    showPowerSelectionScreen = (isInitial: boolean = false) => {
        // ...
    }

    selectPowerUp = (powerId: RoguelikePowerUpId, isUpgrade: boolean) => {
        // ...
    }
    
    acknowledgeNewFollower = () => {
        if (!this.newFollower) return;
    
        this.roguelikeState = {
            ...this.roguelikeState,
            currentLevel: this.roguelikeState.currentLevel + 1,
            followers: [...this.roguelikeState.followers, this.newFollower],
            followerAbilitiesUsedThisMatch: [],
        };
        this.rootStore.missionStore.incrementProgress('followersRecruited');
        this.newFollower = null;
        this.showPowerSelectionScreen(false);
    }
    // FIX: Added missing startNextDungeonMatch method.
    startNextDungeonMatch = () => {
        this.rootStore.uiStore.closeModal('dungeonProgress');
        const nextMatchIndex = this.dungeonRunState.currentMatch; // is 1-based, becomes 0-based index for next match
        if (nextMatchIndex < this.dungeonRunState.totalMatches) {
            const nextOpponentName = this.dungeonRunState.waifuOpponents[nextMatchIndex];
            const nextOpponent = WAIFUS.find(w => w.name === nextOpponentName) || WAIFUS[0];
            runInAction(() => {
                this.dungeonRunState.currentMatch++;
            });
            this.startClassicGame(nextOpponent);
        }
    }

    activateLastTrickInsight = () => {
        // ...
    }

    openBriscolaSwapModal = () => {
        // ...
    }

    closeBriscolaSwapModal = () => { this.isBriscolaSwapModalOpen = false; }
    
    handleBriscolaSwap = (cardFromHand: Card) => {
        // ...
    }
}