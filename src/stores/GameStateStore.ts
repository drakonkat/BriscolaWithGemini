/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, runInAction, reaction, toJS } from 'mobx';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

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
import type { GamePhase, Card, Player, Waifu, GameEmotionalState, Suit, Element, AbilityType, RoguelikeState, ElementalClashResult, TrickHistoryEntry, RoguelikePowerUp, RoguelikePowerUpId, Value } from '../core/types';
import { RANK } from '../core/constants';
import { POWER_UP_DEFINITIONS } from '../core/roguelikePowers';

const SCORE_THRESHOLD = 15;
type GameMode = 'online' | 'fallback';
type ElementalEffectStatus = 'active' | 'inactive' | 'unset';

const SAVED_GAME_KEY = 'waifu_briscola_saved_game';

// FIX: Corrected the initialization of RoguelikeState to include all required properties and fix the `activePowerUp` property name error.
const INITIAL_ROGUELIKE_STATE: RoguelikeState = {
    currentLevel: 0,
    runCoins: 0,
    encounteredWaifus: [],
    followers: [],
    followerAbilitiesUsedThisMatch: [],
    initialPower: null,
    activePowers: [],
};

const ROGUELIKE_LEVEL_REWARDS = [0, 25, 50, 75, 150];

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
    cardForElementalChoice: Card | null = null;
    
    roguelikeState: RoguelikeState = INITIAL_ROGUELIKE_STATE;
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
            let getTrickWinner = this.rootStore.gameSettingsStore.gameplayMode === 'classic' ? getClassicTrickWinner : getRoguelikeTrickWinner;
            const trickWinner = getTrickWinner(this.cardsOnTable, this.trickStarter, this.briscolaSuit!, this.roguelikeState.activePowers);
            this.resolveTrick(humanCard, aiCard, trickWinner, clashResult);
        };

        if (this.rootStore.gameSettingsStore.gameplayMode === 'roguelike' && humanCard.element && aiCard.element) {
            // ... (rest of the logic remains the same)
            let clashWinner: 'human' | 'ai' | 'tie' | null = null;
            let finalClashResult: ElementalClashResult | null = null;
            
            if (this.guaranteedClashWinner) {
                clashWinner = this.guaranteedClashWinner;
                this.guaranteedClashWinner = null;
            } else {
                clashWinner = determineWeaknessWinner(humanCard.element, aiCard.element);
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
                human: (clashWinner === 'human' && humanCard.elementalEffectActivated) ? 'active' : 'inactive',
                ai: (clashWinner === 'ai' && aiCard.elementalEffectActivated) ? 'active' : 'inactive'
            };

            this.resolveTrickCallbackRef = () => resolve(finalClashResult);
            this.clashTimeoutRef = window.setTimeout(() => {
                resolve(finalClashResult);
                this.clashTimeoutRef = null;
                this.resolveTrickCallbackRef = null;
            }, 5000);

        } else {
            this.lastTrickHighlights = {
                human: humanCard.elementalEffectActivated ? 'active' : (humanCard.element ? 'inactive' : 'unset'),
                ai: aiCard.elementalEffectActivated ? 'active' : (aiCard.element ? 'inactive' : 'unset')
            };
            setTimeout(() => resolve(null), 500);
        }
    }

    performNightmareAiTurn = () => {
        const briscolaSuit = this.briscolaSuit!;
    
        let cardToPlay: Card;
    
        const isRoguelike = this.rootStore.gameSettingsStore.gameplayMode === 'roguelike';
        const getTrickWinnerLogic = isRoguelike ? getRoguelikeTrickWinner : getClassicTrickWinner;
        
        // AI plays second
        if (this.cardsOnTable.length > 0) {
            const humanCard = this.cardsOnTable[0];
            const potentialCards = [...this.aiHand, ...this.deck]; // In Nightmare, AI knows the deck
            let bestWinningMove: { card: Card | null; points: number } = { card: null, points: -1 };
    
            // Find the best winning move from all available cards to maximize points
            for (const potentialCard of potentialCards) {
                let isWinner = getTrickWinnerLogic([humanCard, potentialCard], 'human', briscolaSuit, this.roguelikeState.activePowers) === 'ai';
    
                if (isWinner) {
                    let trickPoints;
                    if (isRoguelike) {
                        const activatedPotentialCard = { ...potentialCard, elementalEffectActivated: !!potentialCard.element };
                        const result = calculateRoguelikeTrickPoints(humanCard, activatedPotentialCard, 'ai', null, this.briscolaSuit!, this.roguelikeState.activePowers, [], []); // Note: score piles not available for prediction
                        trickPoints = result.pointsForTrick;
                    } else {
                        trickPoints = getCardPoints(humanCard) + getCardPoints(potentialCard);
                    }
    
                    if (trickPoints > bestWinningMove.points) {
                        bestWinningMove = { card: potentialCard, points: trickPoints };
                    } else if (trickPoints === bestWinningMove.points && bestWinningMove.card && RANK[potentialCard.value] < RANK[bestWinningMove.card.value]) {
                        bestWinningMove.card = potentialCard;
                    }
                }
            }
    
            // If a winning move is found
            if (bestWinningMove.card) {
                cardToPlay = bestWinningMove.card;
                const isCardInHand = this.aiHand.some(c => c.id === cardToPlay.id);
    
                // If the best card is not in hand, swap it
                if (!isCardInHand) {
                    const worstCardInHand = [...this.aiHand].sort((a, b) => {
                        const pointsA = getCardPoints(a);
                        const pointsB = getCardPoints(b);
                        if (pointsA !== pointsB) return pointsA - pointsB;
                        return RANK[a.value] - RANK[b.value];
                    })[0];
                    
                    const newAiHand = this.aiHand.filter(c => c.id !== worstCardInHand.id);
                    newAiHand.push(cardToPlay);
                    this.aiHand = newAiHand;
                    
                    const newDeck = this.deck.filter(c => c.id !== cardToPlay.id);
                    newDeck.push(worstCardInHand);
                    this.deck = newDeck;
                }
            } else {
                // No winning move possible, discard the worst card from hand
                cardToPlay = [...this.aiHand].sort((a, b) => {
                    const pointsA = getCardPoints(a);
                    const pointsB = getCardPoints(b);
                    if (pointsA !== pointsB) return pointsA - pointsB;
                    return RANK[a.value] - RANK[b.value];
                })[0];
            }
    
        } else { // AI plays first
            const nonPointCards = this.aiHand.filter(c => getCardPoints(c) === 0);
            
            if (nonPointCards.length > 0) {
                cardToPlay = nonPointCards.sort((a,b) => RANK[a.value] - RANK[b.value])[0];
            } else {
                cardToPlay = [...this.aiHand].sort((a,b) => RANK[a.value] - RANK[b.value])[0];
            }
        }
    
        if (cardToPlay.element) {
            cardToPlay = { ...cardToPlay, elementalEffectActivated: true };
        }
        playSound('card-place');
        this.message = this.T.aiPlayedYourTurn(this.currentWaifu!.name);
        this.aiHand = this.aiHand.filter(c => c.id !== cardToPlay.id);
        this.cardsOnTable.push(cardToPlay);
        
        // FIX: Aggressively clean up temporary states from the AI's hand immediately after it plays a card.
        // This prevents state corruption that could cause the AI to freeze on subsequent turns, especially
        // after using an ability like "Fortify" on a card that it ultimately decides not to play.
        this.aiHand = this.aiHand.map(c => {
            if (c.isTemporaryBriscola) {
                const { isTemporaryBriscola, ...rest } = c;
                return rest;
            }
            return c;
        });

        if (this.trickStarter === 'ai') {
            this.turn = 'human';
        }
    };

    handleAiTurn = () => {
        if (this.phase !== 'playing' || this.turn !== 'ai' || this.isProcessing || this.cardsOnTable.length >= 2 || this.aiHand.length === 0) {
            return;
        }
    
        if (this.isTutorialGame) {
            if (this.rootStore.uiStore.tutorialStep === 'promptPlayCard' && this.cardsOnTable.length === 1) {
                setTimeout(() => runInAction(() => {
                    const aiCardToPlay = this.aiHand.find(c => c.id === 'tutorial-a-2-bastoni')!;
                    playSound('card-place');
                    this.aiHand = this.aiHand.filter(c => c.id !== aiCardToPlay.id);
                    this.cardsOnTable.push(aiCardToPlay);
                    this.rootStore.uiStore.onTutorialGameEvent('aiResponded');
                }), 1500);
            }
            return;
        }
    
        const playCardAction = () => {
            if (!this.currentWaifu) return;
    
            if (this.rootStore.gameSettingsStore.difficulty === 'nightmare') {
                this.performNightmareAiTurn();
            } else {
                let chosenCard = getLocalAIMove(this.aiHand, this.briscolaSuit!, this.cardsOnTable, this.rootStore.gameSettingsStore.difficulty);
    
                if (chosenCard.element) chosenCard = { ...chosenCard, elementalEffectActivated: true };
    
                playSound('card-place');
                this.message = this.T.aiPlayedYourTurn(this.currentWaifu.name);
    
                this.aiHand = this.aiHand.filter(c => c.id !== chosenCard.id);
                this.cardsOnTable.push(chosenCard);
    
                this.aiHand = this.aiHand.map(c => {
                    if (c.isTemporaryBriscola) {
                        const { isTemporaryBriscola, ...rest } = c;
                        return rest;
                    }
                    return c;
                });
    
                if (this.trickStarter === 'ai') this.turn = 'human';
            }
        };
    
        playCardAction();
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

            this.rootStore.posthog?.capture('game_over', { human_score: this.humanScore, ai_score: this.aiScore, winner, winnings });

            if (gameplayMode === 'classic') {
                let difficultyMultiplier = 1.0;
                if (difficulty === 'easy') difficultyMultiplier = 0.5;
                else if (difficulty === 'hard') difficultyMultiplier = 1.5;

                if (winner === 'human') {
                    if (difficulty === 'nightmare') {
                        winnings = 500;
                    } else {
                        if (this.humanScore >= 101) winnings = Math.round(100 * difficultyMultiplier);
                        else if (this.humanScore >= 81) winnings = Math.round(70 * difficultyMultiplier);
                        else winnings = Math.round(45 * difficultyMultiplier);
                    }
                } else {
                    if (difficulty === 'nightmare') {
                        winnings = Math.round(20 * 1.5);
                    } else {
                        winnings = Math.round(20 * difficultyMultiplier);
                    }
                }
                this.rootStore.gachaStore.addCoins(winnings);
                this.lastGameWinnings = winnings;
                this.gameResult = winner;
                this.phase = 'gameOver';
            } else { // Roguelike
                if (winner === 'human') {
                    const levelJustWon = this.roguelikeState.currentLevel;
                    winnings = ROGUELIKE_LEVEL_REWARDS[levelJustWon];
                    const newRunCoins = this.roguelikeState.runCoins + winnings;

                    if (levelJustWon >= 4) {
                        // Run is complete
                        this.rootStore.gachaStore.addCoins(newRunCoins);
                        this.lastGameWinnings = newRunCoins;
                        this.gameResult = winner;
                        this.phase = 'gameOver';
                        this.roguelikeState = INITIAL_ROGUELIKE_STATE;
                    } else {
                        // Level is won, but run continues
                        this.roguelikeState = {
                            ...this.roguelikeState,
                            runCoins: newRunCoins,
                            currentLevel: this.roguelikeState.currentLevel + 1,
                            followers: this.roguelikeState.currentLevel <= 3 && this.currentWaifu ? [...this.roguelikeState.followers, this.currentWaifu] : this.roguelikeState.followers,
                            followerAbilitiesUsedThisMatch: [],
                        };
                        this.rootStore.uiStore.showSnackbar(`${this.T.coinsEarned(winnings)}`, 'success');
                        this.showPowerSelectionScreen(false);
                    }
                } else { // AI won, run failed
                    let level1LossReward;
                    switch(difficulty) {
                        case 'easy': level1LossReward = 10; break;
                        case 'medium': level1LossReward = 20; break;
                        case 'hard': level1LossReward = 30; break;
                        case 'nightmare': level1LossReward = 50; break; // Increased reward
                        default: level1LossReward = 20;
                    }

                    let consolationCoins = Math.round(this.roguelikeState.runCoins / 2);
                    if (difficulty === 'nightmare') {
                        consolationCoins = Math.round(this.roguelikeState.runCoins * 0.75);
                    }
                    
                    winnings = this.roguelikeState.currentLevel === 1 ? level1LossReward : consolationCoins;

                    this.rootStore.gachaStore.addCoins(winnings);
                    this.lastGameWinnings = winnings;
                    this.gameResult = winner;
                    this.phase = 'gameOver';
                    this.roguelikeState = INITIAL_ROGUELIKE_STATE;
                }
            }
        }
    }
    
    // Actions
    
    startGame = (selectedWaifu: Waifu | null) => {
        const { language, gameplayMode, difficulty, isChatEnabled } = this.rootStore.gameSettingsStore;
        
        const bgIndex = Math.floor(Math.random() * 21) + 1;
        const isDesktop = window.innerWidth > 1024;
        const backgroundPrefix = isDesktop ? 'landscape' : 'background';
        this.backgroundUrl = `https://s3.tebi.io/waifubriscola/background/${backgroundPrefix}${bgIndex}.png`;
        
        playSound('game-start');
        const newWaifu = selectedWaifu ?? WAIFUS[Math.floor(Math.random() * WAIFUS.length)];
        
        this.rootStore.posthog?.capture('game_started', {
            waifu_name: newWaifu.name, language, gameplayMode, difficulty, is_chat_enabled: isChatEnabled,
        });
        
        this.aiEmotionalState = 'neutral';
        this.cardsOnTable = [];
        this.humanScore = 0;
        this.aiScore = 0;
        this.isQuotaExceeded = false;
        this.gameMode = 'online';
        this.gameResult = null;
        this.lastGameWinnings = 0;
        this.lastResolvedTrick = [];
        this.trickCounter = 0;
        this.trickHistory = [];
        this.lastTrick = null;
        this.activeElements = [];
        this.isTutorialGame = false;
        this.roguelikeState = INITIAL_ROGUELIKE_STATE;
        
        if (gameplayMode === 'classic') {
            this.currentWaifu = newWaifu;
            this.startClassicGame(newWaifu);
        } else {
            this.startRoguelikeRun(newWaifu);
        }
    };
    
    startClassicGame = (newWaifu: Waifu) => {
        let newDeck = shuffleDeck(createDeck());
        const newBriscola = newDeck[newDeck.length - 1];
        this.humanHand = newDeck.slice(0, 3);
        this.aiHand = newDeck.slice(3, 6);
        this.deck = newDeck.slice(6, -1);
        this.briscolaCard = newBriscola;
        this.briscolaSuit = newBriscola.suit;
        this.turn = 'human';
        this.trickStarter = 'human';
        this.message = this.T.yourTurn;
        this.phase = 'playing';
    };
    
    startRoguelikeRun = (firstWaifu: Waifu) => {
        const { difficulty } = this.rootStore.gameSettingsStore;
        this.rootStore.posthog?.capture('roguelike_run_started', { waifu_name: firstWaifu.name, difficulty });
        this.roguelikeState = {
            ...INITIAL_ROGUELIKE_STATE,
            currentLevel: 1,
            encounteredWaifus: [firstWaifu.name],
        };
        // FIX: Transition to power selection screen instead of map.
        this.showPowerSelectionScreen(true);
    };

    startRoguelikeLevel = () => {
        const level = this.roguelikeState.currentLevel;
        if (level === 0) return;

        this.cardsOnTable = [];
        this.trickHistory = [];
        this.lastTrick = null;
        this.trickCounter = 0;
        this.lastResolvedTrick = [];
        this.elementalClash = null;
        this.lastTrickHighlights = { human: 'unset', ai: 'unset' };
        this.guaranteedClashWinner = null;
        this.roguelikeState.followerAbilitiesUsedThisMatch = [];
        this.lastTrickInsightCooldown = 0;
        this.briscolaSwapCooldown = 0;
        
        let nextWaifu: Waifu;
        if (level >= 4) {
            nextWaifu = BOSS_WAIFU;
        } else {
            const availableWaifus = WAIFUS.filter(w => !this.roguelikeState.encounteredWaifus.includes(w.name));
            const pool = availableWaifus.length > 0 ? availableWaifus : WAIFUS;
            nextWaifu = pool[Math.floor(Math.random() * pool.length)];
        }
        this.currentWaifu = nextWaifu;
        this.roguelikeState.encounteredWaifus.push(nextWaifu.name);
    
        const initialDeck = shuffleDeck(createDeck());
        const { deck: elementalDeck, activeElements: newActiveElements } = initializeRoguelikeDeck(initialDeck, level);
        this.activeElements = newActiveElements;
    
        let newDeck = elementalDeck;
        const newBriscola = newDeck[newDeck.length - 1];
    
        const aceInHolePower = this.roguelikeState.activePowers.find(p => p.id === 'ace_of_briscola_start');
        let preDealtCards: Card[] = [];

        if (aceInHolePower) {
            const briscolaSuit = newBriscola.suit;
            let potentialCardValues: Value[] = [];
            let numToPick = 0;

            if (aceInHolePower.level === 1) {
                potentialCardValues = ['Asso', '3', 'Re'];
                numToPick = 1;
            } else if (aceInHolePower.level === 2) {
                potentialCardValues = ['Asso', '3'];
                numToPick = 1;
            } else if (aceInHolePower.level >= 3) {
                potentialCardValues = ['Asso', '3'];
                numToPick = 2;
            }
            
            // Filter out the briscola card's value from the list of potential cards to give.
            // This prevents duplicating the card that's already on the table as the briscola.
            const availableValues = potentialCardValues.filter(value => value !== newBriscola.value);
            
            const cardsToFind = shuffleDeck(availableValues).slice(0, numToPick);
            
            for (const value of cardsToFind) {
                // The search is now safe as we are not looking for the briscola card itself.
                const cardIndex = newDeck.findIndex(c => c.value === value && c.suit === briscolaSuit);
                if (cardIndex !== -1) {
                    preDealtCards.push(newDeck.splice(cardIndex, 1)[0]);
                }
            }
        }

        const cardsToDeal = 3 - preDealtCards.length;
        this.humanHand = [...preDealtCards, ...newDeck.slice(0, cardsToDeal)];
        this.aiHand = newDeck.slice(cardsToDeal, cardsToDeal + 3);
        this.deck = newDeck.slice(cardsToDeal + 3, -1);
        this.briscolaCard = newBriscola;
        this.briscolaSuit = newBriscola.suit;
        this.humanScore = 0;
        this.aiScore = 0;
    
        const starter: Player = Math.random() < 0.5 ? 'human' : 'ai';
        this.turn = starter;
        this.trickStarter = starter;
        this.message = starter === 'human' ? this.T.yourTurn : this.T.aiStarts(nextWaifu.name);
        this.phase = 'playing';
    };

    resolveTrick = async (humanCard: Card, aiCard: Card, trickWinner: Player, clashResult: ElementalClashResult | null) => {
        const humanCardFinal = this.cardsOnTable.find(c => c.id === humanCard.id) || humanCard;
        const aiCardFinal = this.cardsOnTable.find(c => c.id === aiCard.id) || aiCard;

        let points;
        
        if (this.rootStore.gameSettingsStore.gameplayMode === 'roguelike') {
            const clashWinner = clashResult?.winner ?? null;
            
            const humanScorePile: Card[] = [];
            const aiScorePile: Card[] = [];
            this.trickHistory.forEach(entry => {
                if (entry.winner === 'human') {
                    humanScorePile.push(entry.humanCard, entry.aiCard);
                } else {
                    aiScorePile.push(entry.humanCard, entry.aiCard);
                }
            });

            const result = calculateRoguelikeTrickPoints(humanCardFinal, aiCardFinal, trickWinner, clashWinner, this.briscolaSuit!, this.roguelikeState.activePowers, humanScorePile, aiScorePile);
            points = result.pointsForTrick;
            const airBonus = result.airBonus;

            const isHumanPowerActive = (humanCardFinal.elementalEffectActivated ?? false) && clashWinner !== 'ai';
            const isAiPowerActive = (aiCardFinal.elementalEffectActivated ?? false) && clashWinner !== 'human';

            if (airBonus > 0) {
                this.powerAnimation = { type: 'air', player: trickWinner, points: airBonus };
                playSound('element-air');
                setTimeout(() => runInAction(() => this.powerAnimation = null), 1500);
            }

            if (isHumanPowerActive && humanCardFinal.element === 'water' && trickWinner === 'ai') playSound('element-water');
            if (isAiPowerActive && aiCardFinal.element === 'water' && trickWinner === 'human') playSound('element-water');

            if (trickWinner === 'human' && isHumanPowerActive && humanCardFinal.element === 'fire') { this.powerAnimation = {type: 'fire', player: 'human', points: 3}; playSound('element-fire'); setTimeout(() => runInAction(() => this.powerAnimation = null), 1500); }
            if (trickWinner === 'ai' && isAiPowerActive && aiCardFinal.element === 'fire') { this.powerAnimation = {type: 'fire', player: 'ai', points: 3}; playSound('element-fire'); setTimeout(() => runInAction(() => this.powerAnimation = null), 1500); }
            if (trickWinner === 'ai' && isHumanPowerActive && humanCardFinal.element === 'earth') { this.humanScore += result.humanCardPoints; playSound('element-earth'); }
            if (trickWinner === 'human' && isAiPowerActive && aiCardFinal.element === 'earth') { this.aiScore += result.aiCardPoints; playSound('element-earth'); }
        } else {
            points = getCardPoints(humanCardFinal) + getCardPoints(aiCardFinal);
        }

        this.trickCounter += 1;

        const newTrickHistoryEntry: TrickHistoryEntry = { trickNumber: this.trickCounter, humanCard: humanCardFinal, aiCard: aiCardFinal, winner: trickWinner, points, clashResult: clashResult ?? undefined };
        this.trickHistory.push(newTrickHistoryEntry);
        this.lastTrick = newTrickHistoryEntry;

        if (trickWinner === 'human') { this.humanScore += points; playSound('trick-win'); this.message = this.T.youWonTrick(points); } 
        else { this.aiScore += points; playSound('trick-lose'); this.message = this.T.aiWonTrick(this.currentWaifu?.name ?? 'AI', points); }
        
        if (this.isTutorialGame) {
            this.rootStore.uiStore.onTutorialGameEvent('trickResolved');
        }

        this.turn = trickWinner;
        this.trickStarter = trickWinner;
        this.elementalClash = null;
        this.lastTrickHighlights = { human: 'unset', ai: 'unset' };

        const { isChatEnabled, waitForWaifuResponse, language } = this.rootStore.gameSettingsStore;
        if (isChatEnabled && !this.isQuotaExceeded && this.gameMode === 'online' && this.currentWaifu) {
            if (trickWinner === 'ai' && waitForWaifuResponse) {
                this.isAiGeneratingMessage = true;
                try {
                    const { message } = await getAIWaifuTrickMessage(this.currentWaifu, this.aiEmotionalState, humanCardFinal, aiCardFinal, points, language);
                    this.rootStore.chatStore.addMessageToChat(message, 'ai');
                    this.rootStore.uiStore.showWaifuBubble(message);
                } catch (e) { if (e instanceof QuotaExceededError) this.handleQuotaExceeded(); } 
                finally { runInAction(() => this.isAiGeneratingMessage = false); }
            } else if (this.trickCounter > 1 && Math.random() < 0.25) {
                getAIGenericTeasingMessage(this.currentWaifu, this.aiEmotionalState, this.aiScore, this.humanScore, language)
                    .then(({message}) => {
                        this.rootStore.chatStore.addMessageToChat(message, 'ai');
                        this.rootStore.uiStore.showWaifuBubble(message);
                    })
                    .catch(e => { if (e instanceof QuotaExceededError) this.handleQuotaExceeded(); });
            }
        }
        
        const isFinalTrick = this.deck.length === 0 && !this.briscolaCard;
        const delay = isFinalTrick ? 3000 : 1500;

        setTimeout(() => runInAction(() => {
            // FIX: Clear temporary effects like Fortify from cards in hand at the end of a trick.
            // This prevents invalid states where a card remains fortified in hand after a trick,
            // which could cause the AI logic to freeze on subsequent turns. This is a robust safeguard
            // for both players' hands.
            const cleanupHand = (hand: Card[]): Card[] => {
                return hand.map(c => {
                    if (c.isTemporaryBriscola) {
                        const { isTemporaryBriscola, ...rest } = c;
                        return rest;
                    }
                    return c;
                });
            };

            let newDeck = [...this.deck];
            let newHumanHand = cleanupHand(this.humanHand);
            let newAiHand = cleanupHand(this.aiHand);
            let newBriscolaCard = this.briscolaCard;
            const drawOrder: Player[] = trickWinner === 'human' ? ['human', 'ai'] : ['ai', 'human'];

            for (const player of drawOrder) {
                let cardDrawn = newDeck.length > 0 ? newDeck.shift()! : (newBriscolaCard ? newBriscolaCard : null);
                if (cardDrawn && newBriscolaCard && cardDrawn.id === newBriscolaCard.id) newBriscolaCard = null;
                if (cardDrawn) player === 'human' ? newHumanHand.push(cardDrawn) : newAiHand.push(cardDrawn);
            }
            
            this.humanHand = newHumanHand;
            this.aiHand = newAiHand;
            this.deck = newDeck;
            this.briscolaCard = newBriscolaCard;
            this.cardsOnTable = [];
            this.isResolvingTrick = false;

            // FIX: Cannot assign to 'revealedAiHand' because it is a read-only property.
            // The getter for `revealedAiHand` already contains the logic to show the hand
            // for the last tricks based on game state, so this explicit assignment
            // was redundant and incorrect. It has been removed.
            if (this.rootStore.gameSettingsStore.gameplayMode === 'roguelike') {
                
            }

            if(trickWinner === 'human') this.message = this.T.yourTurnMessage;
            if (this.isTutorialGame) {
                this.rootStore.uiStore.onTutorialGameEvent('cardsDrawn');
            }
        }), delay);
    };
    
    selectCardForPlay = (card: Card) => {
        if (this.turn !== 'human' || this.isProcessing) return;

        if (this.isTutorialGame) {
            const { uiStore } = this.rootStore;
            if (uiStore.tutorialStep === 'promptPlayCard' && card.id === 'tutorial-h-ace-bastoni') {
                playSound('card-place');
                this.humanHand = this.humanHand.filter(c => c.id !== card.id);
                this.cardsOnTable.push(card);
                this.turn = 'ai';
            }
            return;
        }

        let cardToPlay = card;

        if (this.rootStore.gameSettingsStore.gameplayMode === 'roguelike' && card.element && !card.isTemporaryBriscola) {
            this.cardForElementalChoice = cardToPlay;
        } else {
            playSound('card-place');
            this.humanHand = this.humanHand.filter(c => c.id !== cardToPlay.id);
            this.cardsOnTable.push(cardToPlay);
            if (this.trickStarter === 'human') this.turn = 'ai';
        }
    };
    confirmCardPlay = (activateEffect: boolean) => {
        if (!this.cardForElementalChoice) return;
        const cardToPlay = { ...this.cardForElementalChoice, elementalEffectActivated: activateEffect };
        this.cardForElementalChoice = null;
        playSound('card-place');
        this.humanHand = this.humanHand.filter(c => c.id !== cardToPlay.id);
        this.cardsOnTable.push(cardToPlay);
        if (this.trickStarter === 'human') this.turn = 'ai';
    };
    cancelCardPlay = () => this.cardForElementalChoice = null;
    activateFollowerAbility = (waifuName: string) => {
        let abilityArmed: 'sakura_blessing' | 'rei_analysis' | 'kasumi_gambit' | null = null;
        let abilityName = '';
        switch(waifuName) {
            case 'Sakura': abilityArmed = 'sakura_blessing'; abilityName = this.T.sakura_blessing; break;
            case 'Rei': if (this.aiScore >= 5) { abilityArmed = 'rei_analysis'; abilityName = this.T.rei_analysis; } break;
            case 'Kasumi': abilityArmed = 'kasumi_gambit'; abilityName = this.T.kasumi_gambit; break;
        }
        if (!abilityArmed) return;
        this.message = this.T.followerAbilityArmed(waifuName, abilityName);
        if (abilityArmed === 'rei_analysis') {
            this.humanScore += 5;
            this.aiScore -= 5;
            this.roguelikeState.followerAbilitiesUsedThisMatch.push(waifuName);
            this.message = this.T.yourTurnMessage;
        } else if (abilityArmed === 'kasumi_gambit') {
            this.isKasumiModalOpen = true;
        } else if (abilityArmed === 'sakura_blessing') {
            this.guaranteedClashWinner = 'human';
            this.roguelikeState.followerAbilitiesUsedThisMatch.push(waifuName);
            this.message = this.T.yourTurnMessage;
        }
    };
    closeKasumiModal = () => { this.isKasumiModalOpen = false; this.message = this.T.yourTurnMessage; };
    handleKasumiCardSwap = (cardFromHand: Card) => {
        if (this.briscolaCard) {
            const oldBriscola = this.briscolaCard;
            this.briscolaCard = cardFromHand;
            this.briscolaSuit = cardFromHand.suit;
            this.humanHand = [...this.humanHand.filter(c => c.id !== cardFromHand.id), oldBriscola];
            this.roguelikeState.followerAbilitiesUsedThisMatch.push('Kasumi');
        }
        this.closeKasumiModal();
    };
    confirmLeaveGame = () => { this.rootStore.posthog?.capture('game_left', { human_score: this.humanScore, ai_score: this.aiScore }); this.clearSavedGame(); this.phase = 'menu'; };
    goToMenu = () => {
        this.isTutorialGame = false;
        this.phase = 'menu';
    }
    handleQuotaExceeded = () => { this.isQuotaExceeded = true; this.gameMode = 'fallback'; };
    continueFromQuotaModal = () => this.isQuotaExceeded = false;
    forceCloseClashModal = () => {
        if (this.clashTimeoutRef && this.resolveTrickCallbackRef) {
            clearTimeout(this.clashTimeoutRef);
            this.resolveTrickCallbackRef();
            this.clashTimeoutRef = null;
            this.resolveTrickCallbackRef = null;
        }
    };
    
    startTutorialGame = () => {
        const tutorialWaifu = WAIFUS.find(w => w.name === 'Sakura') || WAIFUS[0];
        
        this.backgroundUrl = getImageUrl('/background/landscape3.png');
        this.currentWaifu = tutorialWaifu;
        this.isTutorialGame = true;
        this.phase = 'playing';
        this.aiEmotionalState = 'neutral';
        this.cardsOnTable = [];
        this.humanScore = 0;
        this.aiScore = 0;
        this.gameResult = null;
        this.lastGameWinnings = 0;
        this.trickCounter = 0;
        this.humanHand = [...TUTORIAL_HUMAN_HAND];
        this.aiHand = [...TUTORIAL_AI_HAND];
        this.briscolaCard = { ...TUTORIAL_BRISCOLA };
        this.briscolaSuit = TUTORIAL_BRISCOLA.suit;
        this.deck = [...TUTORIAL_DECK];
        this.turn = 'human';
        this.trickStarter = 'human';
        this.message = this.T.yourTurn;
        this.rootStore.uiStore.setTutorialStep('playerHand');
    };

    resolveTrickForTutorial = () => {
        if (!this.isTutorialGame || this.phase !== 'playing' || this.cardsOnTable.length < 2) return;

        const trickId = this.cardsOnTable.map(c => c.id).sort().join('-');
        if (this.lastResolvedTrick.includes(trickId)) return;
        this.lastResolvedTrick.push(trickId);
    
        this.isResolvingTrick = true;
        const humanCard = this.trickStarter === 'human' ? this.cardsOnTable[0] : this.cardsOnTable[1];
        const aiCard = this.trickStarter === 'ai' ? this.cardsOnTable[0] : this.cardsOnTable[1];
        
        const trickWinner = getClassicTrickWinner(this.cardsOnTable, this.trickStarter, this.briscolaSuit!);
        this.resolveTrick(humanCard, aiCard, trickWinner, null);
    };

    saveGame = () => {
        if (this.phase === 'playing') {
            const {
                language, gameplayMode, difficulty, isChatEnabled, waitForWaifuResponse,
                soundtrack, isMusicEnabled, soundEditorSettings, cardDeckStyle,
            } = this.rootStore.gameSettingsStore;
    
            const settingsToSave = {
                language, gameplayMode, difficulty, isChatEnabled, waitForWaifuResponse,
                soundtrack, isMusicEnabled, soundEditorSettings, cardDeckStyle,
            };

            const stateToSave = {
                settings: settingsToSave,
                currentWaifuName: this.currentWaifu?.name ?? null,
                deck: toJS(this.deck), humanHand: toJS(this.humanHand), aiHand: toJS(this.aiHand), briscolaCard: toJS(this.briscolaCard), briscolaSuit: this.briscolaSuit, cardsOnTable: toJS(this.cardsOnTable), turn: this.turn,
                humanScore: this.humanScore, aiScore: this.aiScore, trickStarter: this.trickStarter, message: this.message, backgroundUrl: this.backgroundUrl, aiEmotionalState: this.aiEmotionalState,
                gameMode: this.gameMode, trickHistory: toJS(this.trickHistory), lastTrick: toJS(this.lastTrick), roguelikeState: toJS(this.roguelikeState), activeElements: toJS(this.activeElements),
                lastResolvedTrick: toJS(this.lastResolvedTrick), trickCounter: this.trickCounter,
                cardForElementalChoice: toJS(this.cardForElementalChoice), elementalClash: toJS(this.elementalClash), lastTrickHighlights: toJS(this.lastTrickHighlights),
                // FIX: Cannot assign to 'revealedAiHand' because it is a read-only property.
                // Switched to saving the underlying state property `isAiHandTemporarilyRevealed` instead.
                isAiHandTemporarilyRevealed: this.isAiHandTemporarilyRevealed, isKasumiModalOpen: this.isKasumiModalOpen,
            };
            localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(stateToSave));
            this.hasSavedGame = true;
        }
    };

    clearSavedGame = () => {
        localStorage.removeItem(SAVED_GAME_KEY);
        this.hasSavedGame = false;
    };
    
    resumeGame = () => {
        const savedGameJson = localStorage.getItem(SAVED_GAME_KEY);
        if (!savedGameJson) return;

        try {
            const saved = JSON.parse(savedGameJson);
            const { gameSettingsStore } = this.rootStore;

            gameSettingsStore.setLanguage(saved.settings.language);
            gameSettingsStore.setGameplayMode(saved.settings.gameplayMode);
            gameSettingsStore.setDifficulty(saved.settings.difficulty);
            gameSettingsStore.setIsChatEnabled(saved.settings.isChatEnabled);
            gameSettingsStore.setWaitForWaifuResponse(saved.settings.waitForWaifuResponse);
            gameSettingsStore.setSoundtrack(saved.settings.soundtrack);
            gameSettingsStore.setCardDeckStyle(saved.settings.cardDeckStyle || 'classic');

            const waifu = WAIFUS.find(w => w.name === saved.currentWaifuName) || (BOSS_WAIFU.name === saved.currentWaifuName ? BOSS_WAIFU : null);
            
            runInAction(() => {
                this.currentWaifu = waifu;
                this.deck = saved.deck; this.humanHand = saved.humanHand; this.aiHand = saved.aiHand; this.briscolaCard = saved.briscolaCard;
                this.briscolaSuit = saved.briscolaSuit; this.cardsOnTable = saved.cardsOnTable; this.turn = saved.turn; this.humanScore = saved.humanScore;
                this.aiScore = saved.aiScore; this.trickStarter = saved.trickStarter; this.message = saved.message; this.backgroundUrl = saved.backgroundUrl;
                this.aiEmotionalState = saved.aiEmotionalState; this.gameMode = saved.gameMode; this.trickHistory = saved.trickHistory || []; this.lastTrick = saved.lastTrick || null;
                this.roguelikeState = saved.roguelikeState; this.activeElements = saved.activeElements || []; this.cardForElementalChoice = saved.cardForElementalChoice; this.elementalClash = saved.elementalClash;
                this.lastTrickHighlights = saved.lastTrickHighlights || { human: 'unset', ai: 'unset' };
                // FIX: Cannot assign to 'revealedAiHand' because it is a read-only property.
                // Restored the underlying state property `isAiHandTemporarilyRevealed` instead.
                this.isAiHandTemporarilyRevealed = saved.isAiHandTemporarilyRevealed || false;
                this.isKasumiModalOpen = saved.isKasumiModalOpen; this.lastResolvedTrick = saved.lastResolvedTrick || []; this.trickCounter = saved.trickCounter || 0;
                this.phase = 'playing';
            });
            this.rootStore.posthog?.capture('game_resumed');

        } catch (e) {
            console.error("Failed to load saved game", e);
            this.clearSavedGame();
        }
    };
    
    setPhase = (phase: GamePhase) => { this.phase = phase; };

    showPowerSelectionScreen = (isInitial: boolean = false) => {
        const { activePowers, initialPower } = this.roguelikeState;
        const allPowerIds = Object.keys(POWER_UP_DEFINITIONS) as RoguelikePowerUpId[];
        const currentPowerIds = activePowers.map(p => p.id);
        const availableNewPowerIds = allPowerIds.filter(id => !currentPowerIds.includes(id));
    
        let newPowers: RoguelikePowerUpId[] = [];
        let upgrade: RoguelikePowerUp | null = null;

        if (isInitial) {
            newPowers = shuffleDeck(availableNewPowerIds).slice(0, 3);
        } else {
            newPowers = shuffleDeck(availableNewPowerIds).slice(0, 2);
            
            if (initialPower) {
                const initialPowerState = activePowers.find(p => p.id === initialPower);
                if (initialPowerState && initialPowerState.level < POWER_UP_DEFINITIONS[initialPowerState.id].maxLevel) {
                    upgrade = initialPowerState;
                }
            }
        }
    
        this.powerSelectionOptions = { newPowers, upgrade };
        this.phase = 'power-selection';
    }

    selectPowerUp = (powerId: RoguelikePowerUpId, isUpgrade: boolean) => {
        const { roguelikeState } = this;
        if (isUpgrade) {
            const powerIndex = roguelikeState.activePowers.findIndex(p => p.id === powerId);
            if (powerIndex > -1) {
                roguelikeState.activePowers[powerIndex].level++;
            }
        } else {
            if (!roguelikeState.initialPower) {
                roguelikeState.initialPower = powerId;
            }
            roguelikeState.activePowers.push({ id: powerId, level: 1 });
        }
        
        this.powerSelectionOptions = null;
        this.startRoguelikeLevel();
    }

    activateLastTrickInsight = () => {
        const power = this.roguelikeState.activePowers.find(p => p.id === 'last_trick_insight');
        if (this.turn === 'human' && power && power.level === 2 && this.lastTrickInsightCooldown === 0) {
            this.isAiHandTemporarilyRevealed = true;
            this.lastTrickInsightCooldown = 3;
        }
    }

    openBriscolaSwapModal = () => {
        const power = this.roguelikeState.activePowers.find(p => p.id === 'value_swap');
        if (power && this.briscolaSwapCooldown === 0) {
            this.isBriscolaSwapModalOpen = true;
        }
    }

    closeBriscolaSwapModal = () => { this.isBriscolaSwapModalOpen = false; }
    
    handleBriscolaSwap = (cardFromHand: Card) => {
        if (this.briscolaCard) {
            const oldBriscola = this.briscolaCard;
            this.briscolaCard = cardFromHand;
            this.briscolaSuit = cardFromHand.suit;
            this.humanHand = [...this.humanHand.filter(c => c.id !== cardFromHand.id), oldBriscola];

            const power = this.roguelikeState.activePowers.find(p => p.id === 'value_swap');
            if (power) {
                this.briscolaSwapCooldown = 4 - power.level;
            }
        }
        this.closeBriscolaSwapModal();
    }
}