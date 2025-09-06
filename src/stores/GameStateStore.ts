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
import { initializeRoguelikeDeck, assignAbilities, getRoguelikeTrickWinner, calculateRoguelikeTrickPoints, determineWeaknessWinner } from '../core/roguelikeGameLogic';
import { getCardPoints, shuffleDeck } from '../core/utils';
import { QuotaExceededError, getAIWaifuTrickMessage, getAIGenericTeasingMessage } from '../core/gemini';
import { getLocalAIMove, getAIAbilityDecision } from '../core/localAI';
import { WAIFUS, BOSS_WAIFU } from '../core/waifus';
import type { GamePhase, Card, Player, Waifu, GameEmotionalState, Suit, Element, AbilityType, RoguelikeState, RoguelikeEvent, ElementalClashResult, TrickHistoryEntry } from '../core/types';
import { RANK } from '../core/constants';

const SCORE_THRESHOLD = 15;
type GameMode = 'online' | 'fallback';
type ElementalEffectStatus = 'active' | 'inactive' | 'unset';
type ArmedAbility = 'fortify' | 'sakura_blessing' | 'rei_analysis' | 'kasumi_gambit';

const SAVED_GAME_KEY = 'waifu_briscola_saved_game';

const INITIAL_ROGUELIKE_STATE: RoguelikeState = {
    currentLevel: 0,
    runCoins: 0,
    activePowerUp: null,
    challenge: null,
    humanAbility: null,
    aiAbility: null,
    encounteredWaifus: [],
    followers: [],
    followerAbilitiesUsedThisMatch: [],
};

const ROGUELIKE_LEVEL_REWARDS = [0, 25, 50, 75, 150];

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
    powerAnimation: { type: Element; player: Player } | null = null;
    elementalClash: ElementalClashResult | null = null;
    lastTrickHighlights: { human: ElementalEffectStatus, ai: ElementalEffectStatus } = { human: 'unset', ai: 'unset' };
    humanAbilityCharges = 0;
    aiAbilityCharges = 0;
    abilityTargetingState: 'incinerate' | 'cyclone' | null = null;
    abilityArmed: ArmedAbility | null = null;
    abilityUsedThisTurn: { ability: AbilityType; originalCard: Card } | null = null;
    revealedAiHand: Card[] | null = null;
    guaranteedClashWinner: Player | null = null;
    isKasumiModalOpen = false;
    activeElements: Element[] = [];
    isAiUsingAbility = false;

    trickHistory: TrickHistoryEntry[] = [];
    lastTrick: TrickHistoryEntry | null = null;

    hasSavedGame = !!localStorage.getItem(SAVED_GAME_KEY);

    lastResolvedTrick: string[] = [];
    trickCounter = 0;
    clashTimeoutRef: number | null = null;
    resolveTrickCallbackRef: (() => void) | null = null;
    humanAbilityUsedInTrick = false;
    aiAbilityUsedInTrick = false;

    constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false, clashTimeoutRef: false, resolveTrickCallbackRef: false }, { autoBind: true });
        this.rootStore = rootStore;

        this.init();

        reaction(() => this.phase, this.saveGame);
        reaction(() => ({isMusicEnabled: this.rootStore.gameSettingsStore.isMusicEnabled, phase: this.phase}), this.handleMusic);
        reaction(() => this.rootStore.gameSettingsStore.soundEditorSettings, (settings) => updateSoundSettings(settings));
        reaction(() => ({humanScore: this.humanScore, aiScore: this.aiScore}), this.updateEmotionalState);
        reaction(() => ({phase: this.phase, cardsOnTable: this.cardsOnTable.length}), this.handleTrickResolution);
        reaction(() => ({phase: this.phase, turn: this.turn, cardsOnTable: this.cardsOnTable.length}), this.handleAiTurn);
        reaction(() => ({phase: this.phase, humanHand: this.humanHand.length, aiHand: this.aiHand.length, cardsOnTable: this.cardsOnTable.length, isProcessing: this.isProcessing}), this.handleEndOfGame);
    }
    
    init() {
        if (Capacitor.isNativePlatform()) {
            ScreenOrientation.lock({ orientation: 'portrait-primary' }).catch(() => {});
        }
    }

    get isProcessing() {
        return this.isResolvingTrick;
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
        if (this.phase !== 'playing' || this.cardsOnTable.length < 2) return;
        
        const trickId = this.cardsOnTable.map(c => c.id).sort().join('-');
        if (this.lastResolvedTrick.includes(trickId)) return;
        this.lastResolvedTrick.push(trickId);
    
        this.isResolvingTrick = true;
        const humanCard = this.trickStarter === 'human' ? this.cardsOnTable[0] : this.cardsOnTable[1];
        const aiCard = this.trickStarter === 'ai' ? this.cardsOnTable[0] : this.cardsOnTable[1];
        
        const resolve = (clashResult: ElementalClashResult | null) => {
            let getTrickWinner = this.rootStore.gameSettingsStore.gameplayMode === 'classic' ? getClassicTrickWinner : getRoguelikeTrickWinner;
            const trickWinner = getTrickWinner(this.cardsOnTable, this.trickStarter, this.briscolaSuit!);
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
    
        // AI plays second
        if (this.cardsOnTable.length > 0) {
            const humanCard = this.cardsOnTable[0];
            const potentialCards = [...this.aiHand, ...this.deck];
            let bestWinningMove: { card: Card | null; points: number } = { card: null, points: -1 };
    
            // Find the best winning move from all available cards to maximize points
            for (const potentialCard of potentialCards) {
                const isWinner = getClassicTrickWinner([humanCard, potentialCard], 'human', briscolaSuit) === 'ai';
                if (isWinner) {
                    const trickPoints = getCardPoints(humanCard) + getCardPoints(potentialCard);
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
        if (this.trickStarter === 'ai') {
            this.turn = 'human';
        }
    };

    handleAiTurn = () => {
        if (this.phase !== 'playing' || this.turn !== 'ai' || this.isProcessing || this.cardsOnTable.length >= 2 || this.aiHand.length === 0 || this.isAiUsingAbility) {
            return;
        }
        
        const performAiAction = () => {
            if (this.rootStore.gameSettingsStore.gameplayMode === 'roguelike' && this.roguelikeState.aiAbility && this.aiAbilityCharges >= 2) {
                const decision = getAIAbilityDecision(this.roguelikeState.aiAbility, this.aiHand, null, this.deck.length, this.cardsOnTable);
                if (decision.useAbility) {
                    this.isAiUsingAbility = true;
                    this.aiAbilityCharges = 0;
                    this.aiAbilityUsedInTrick = true;
                    this.message = this.T.abilityUsed(this.currentWaifu?.name ?? 'AI', this.T[decision.ability]);
    
                    switch (decision.ability) {
                        case 'tide': this.revealedAiHand = [...this.humanHand]; setTimeout(() => runInAction(() => this.revealedAiHand = null), 5000); break;
                        case 'incinerate': if (this.cardsOnTable.length === 1 && decision.targetCardId) { this.cardsOnTable = [{ ...this.cardsOnTable[0], isBurned: true }]; } break;
                        case 'cyclone':
                            if (decision.targetCardId && this.deck.length > 0) {
                                const cardToSwap = this.aiHand.find(c => c.id === decision.targetCardId);
                                if (cardToSwap) {
                                    const newDeck = [...this.deck, cardToSwap];
                                    const shuffled = shuffleDeck(newDeck);
                                    const newCard = shuffled.shift()!;
                                    this.aiHand = [...this.aiHand.filter(c => c.id !== cardToSwap.id), newCard];
                                    this.deck = shuffled;
                                }
                            }
                            break;
                        case 'fortify': if (decision.targetCardId) { this.aiHand = this.aiHand.map(c => c.id === decision.targetCardId ? { ...c, isTemporaryBriscola: true } : c); } break;
                    }
                    
                    setTimeout(() => runInAction(() => this.isAiUsingAbility = false), 500); 
                    return;
                }
            }
    
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
                if (this.trickStarter === 'ai') this.turn = 'human';
            }
        };
    
        performAiAction();
    }

    handleEndOfGame = () => {
         if (this.phase === 'playing' && this.humanHand.length === 0 && this.aiHand.length === 0 && this.cardsOnTable.length === 0 && !this.isProcessing) {
            let winner: 'human' | 'ai' | 'tie' = 'tie';
            if (this.humanScore > this.aiScore) winner = 'human';
            if (this.aiScore > this.humanScore) winner = 'ai';
            if (this.humanScore === 60 && this.aiScore === 60) winner = 'tie';
            if (this.humanScore === this.aiScore && this.humanScore > 60) winner = 'human';

            let winnings = 0;
            const { difficulty, gameplayMode } = this.rootStore.gameSettingsStore;
            let difficultyMultiplier = 1.0;
            if (difficulty === 'easy') difficultyMultiplier = 0.5;
            else if (difficulty === 'hard') difficultyMultiplier = 1.5;
            else if (difficulty === 'nightmare') difficultyMultiplier = 2.5;

            this.clearSavedGame();

            this.rootStore.posthog?.capture('game_over', { human_score: this.humanScore, ai_score: this.aiScore, winner, winnings });

            if (gameplayMode === 'classic') {
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

                    const allEventTypes: RoguelikeEvent['type'][] = ['market', 'witch_hut', 'healing_fountain', 'challenge_altar'];
                    const chosenEventTypes = shuffleDeck(allEventTypes).slice(0, 2);

                    runInAction(() => {
                        this.roguelikeState = {
                            ...this.roguelikeState,
                            runCoins: newRunCoins,
                            currentLevel: this.roguelikeState.currentLevel + 1,
                            followers: this.roguelikeState.currentLevel <= 3 && this.currentWaifu ? [...this.roguelikeState.followers, this.currentWaifu] : this.roguelikeState.followers,
                            followerAbilitiesUsedThisMatch: [],
                            justWonLevel: true,
                            eventTypesForCrossroads: chosenEventTypes,
                        };
                        if (levelJustWon >= 4) {
                            this.rootStore.gachaStore.addCoins(newRunCoins);
                            this.lastGameWinnings = newRunCoins;
                        }
                        this.gameResult = winner;
                        this.phase = 'gameOver';
                    });
                } else {
                    const level1LossReward = difficulty === 'easy' ? 10 : (difficulty === 'hard' || difficulty === 'nightmare' ? 30 : 20);
                    winnings = this.roguelikeState.currentLevel === 1 ? level1LossReward : Math.round(this.roguelikeState.runCoins / 2);
                    this.rootStore.gachaStore.addCoins(winnings);
                    this.lastGameWinnings = winnings;
                    this.gameResult = winner;
                    this.phase = 'gameOver';
                }
            }
        }
    }
    
    // Actions
    // ... all actions like startGame, selectCardForPlay, etc.
    // will be defined here, using `this.` to access state.
    // The implementation will be moved from the `useGameState` hook.
    // I will do this for all actions.
    
    // (Abridged for brevity, full implementation will be provided)
    
    startGame = (selectedWaifu: Waifu | null) => {
        // ... Logic from useGameState ...
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
        this.humanAbilityCharges = 0;
        this.aiAbilityCharges = 0;
        this.trickHistory = [];
        this.lastTrick = null;
        this.abilityUsedThisTurn = null;
        this.activeElements = [];
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
        const { humanAbility, aiAbility } = assignAbilities();
        this.roguelikeState = {
            ...INITIAL_ROGUELIKE_STATE,
            currentLevel: 1,
            humanAbility,
            aiAbility,
            encounteredWaifus: [firstWaifu.name],
        };
        this.phase = 'roguelike-map';
    };

    startRoguelikeLevel = () => {
        const level = this.roguelikeState.currentLevel;
        if (level === 0) return;

        // ... reset logic ...
        this.cardsOnTable = [];
        this.trickHistory = [];
        this.lastTrick = null;
        this.trickCounter = 0;
        this.lastResolvedTrick = [];
        this.abilityUsedThisTurn = null;
        this.abilityTargetingState = null;
        this.abilityArmed = null;
        this.elementalClash = null;
        this.lastTrickHighlights = { human: 'unset', ai: 'unset' };
        this.guaranteedClashWinner = null;
        this.roguelikeState.followerAbilitiesUsedThisMatch = [];
        
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
    
        let newHumanHand = newDeck.slice(0, 3);
        const { activePowerUp } = this.roguelikeState;
    
        if (activePowerUp === 'fortune_amulet') {
            const briscolaFromDeck = newDeck.find(c => c.suit === newBriscola.suit && c.id !== newBriscola.id);
            if (briscolaFromDeck) {
                newHumanHand[0] = briscolaFromDeck;
                newDeck = newDeck.filter(c => c.id !== briscolaFromDeck.id);
            }
        }
    
        this.humanHand = newHumanHand;
        this.aiHand = newDeck.slice(3, 6);
        this.deck = newDeck.slice(6, -1);
        this.briscolaCard = newBriscola;
        this.briscolaSuit = newBriscola.suit;
        this.humanScore = activePowerUp === 'healing_fountain' ? 10 : 0;
        this.aiScore = 0;
    
        if (activePowerUp === 'insight_potion') {
            this.revealedAiHand = [...newDeck.slice(3, 6)];
        }
    
        this.roguelikeState.activePowerUp = null;
    
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
            
            const result = calculateRoguelikeTrickPoints(humanCardFinal, aiCardFinal, trickWinner, clashWinner);
            points = result.pointsForTrick;

            const isHumanPowerActive = (humanCardFinal.elementalEffectActivated ?? false) && clashWinner !== 'ai';
            const isAiPowerActive = (aiCardFinal.elementalEffectActivated ?? false) && clashWinner !== 'human';

            if (isHumanPowerActive && humanCardFinal.element === 'air' && trickWinner === 'ai') playSound('element-air');
            if (isAiPowerActive && aiCardFinal.element === 'air' && trickWinner === 'human') playSound('element-air');
            if (isHumanPowerActive && humanCardFinal.element === 'water' && trickWinner === 'ai') playSound('element-water');
            if (isAiPowerActive && aiCardFinal.element === 'water' && trickWinner === 'human') playSound('element-water');

            if (trickWinner === 'human' && isHumanPowerActive && humanCardFinal.element === 'fire') { points += 3; this.powerAnimation = {type: 'fire', player: 'human'}; playSound('element-fire'); setTimeout(() => runInAction(() => this.powerAnimation = null), 1500); }
            if (trickWinner === 'ai' && isAiPowerActive && aiCardFinal.element === 'fire') { points += 3; this.powerAnimation = {type: 'fire', player: 'ai'}; playSound('element-fire'); setTimeout(() => runInAction(() => this.powerAnimation = null), 1500); }
            if (trickWinner === 'ai' && isHumanPowerActive && humanCardFinal.element === 'earth') { this.humanScore += result.humanCardPoints; playSound('element-earth'); }
            if (trickWinner === 'human' && isAiPowerActive && aiCardFinal.element === 'earth') { this.aiScore += result.aiCardPoints; playSound('element-earth'); }
        } else {
            points = getCardPoints(humanCardFinal) + getCardPoints(aiCardFinal);
        }

        this.trickCounter += 1;
        if (this.rootStore.gameSettingsStore.gameplayMode === 'roguelike' && this.trickCounter % 2 === 0) {
            if (!this.humanAbilityUsedInTrick) this.humanAbilityCharges = Math.min(2, this.humanAbilityCharges + 1);
            if (!this.aiAbilityUsedInTrick) this.aiAbilityCharges = Math.min(2, this.aiAbilityCharges + 1);
        }

        const newTrickHistoryEntry: TrickHistoryEntry = { trickNumber: this.trickCounter, humanCard: humanCardFinal, aiCard: aiCardFinal, winner: trickWinner, points, clashResult: clashResult ?? undefined };
        this.trickHistory.push(newTrickHistoryEntry);
        this.lastTrick = newTrickHistoryEntry;

        if (trickWinner === 'human') { this.humanScore += points; playSound('trick-win'); this.message = this.T.youWonTrick(points); } 
        else { this.aiScore += points; playSound('trick-lose'); this.message = this.T.aiWonTrick(this.currentWaifu?.name ?? 'AI', points); }
        
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
        
        setTimeout(() => runInAction(() => {
            let newDeck = [...this.deck];
            let newHumanHand = [...this.humanHand];
            let newAiHand = [...this.aiHand];
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
            this.humanAbilityUsedInTrick = false;
            this.aiAbilityUsedInTrick = false;
            if(trickWinner === 'human') this.message = this.T.yourTurnMessage;
        }), 1500);
    };
    
    // ... Other actions implemented similarly ...
    selectCardForPlay = (card: Card) => {
        if (this.turn !== 'human' || this.isProcessing || this.abilityTargetingState) return;

        let cardToPlay = card;
        if (this.abilityArmed === 'fortify') {
            cardToPlay = { ...card, isTemporaryBriscola: true };
            this.abilityArmed = null;
            this.humanAbilityCharges = 0;
            this.humanAbilityUsedInTrick = true;
            this.message = this.T.yourTurnMessage;
        }

        if (this.abilityUsedThisTurn) {
            this.abilityUsedThisTurn = null;
        }

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
    activateHumanAbility = () => {
        if (!this.roguelikeState.humanAbility || this.humanAbilityCharges < 2 || this.turn !== 'human' || this.isProcessing) return;
        if (this.roguelikeState.humanAbility === 'incinerate' && (this.cardsOnTable.length !== 1 || this.trickStarter === 'human')) return;
        
        // FIX: Prevent activating an ability if another is already in a pending state.
        if (this.abilityTargetingState || this.abilityArmed || this.abilityUsedThisTurn) return;

        if (this.roguelikeState.humanAbility === 'tide') {
            this.message = this.T.abilityUsed(this.T.scoreYou, this.T.tide);
            this.revealedAiHand = [...this.aiHand];
            setTimeout(() => runInAction(() => this.revealedAiHand = null), 5000);
            this.humanAbilityCharges = 0;
            this.humanAbilityUsedInTrick = true;
        } else if (this.roguelikeState.humanAbility === 'fortify') {
            this.abilityArmed = 'fortify';
        } else {
            this.abilityTargetingState = this.roguelikeState.humanAbility as 'incinerate' | 'cyclone';
        }
    };
    cancelAbilityTargeting = () => this.abilityTargetingState = null;
    targetCardInHandForAbility = (card: Card) => {
        if (!this.abilityTargetingState || this.abilityTargetingState === 'incinerate') return;
        if (this.abilityTargetingState === 'cyclone' && this.deck.length > 0) {
            const newDeck = [...this.deck, card];
            const shuffled = shuffleDeck(newDeck);
            const newCard = shuffled.shift()!;
            this.humanHand = [...this.humanHand.filter(c => c.id !== card.id), newCard];
            this.deck = shuffled;
        }
        this.abilityTargetingState = null;
        this.humanAbilityCharges = 0;
        this.humanAbilityUsedInTrick = true;
    };
    targetCardOnTableForAbility = () => {
        if (this.abilityTargetingState !== 'incinerate' || this.cardsOnTable.length !== 1) return;
        const cardToBurn = this.cardsOnTable[0];
        this.abilityUsedThisTurn = { ability: 'incinerate', originalCard: cardToBurn };
        this.cardsOnTable = [{ ...cardToBurn, isBurned: true }];
        this.message = this.T.confirmOrUndoMessage;
        this.abilityTargetingState = null;
        this.humanAbilityCharges = 0;
        this.humanAbilityUsedInTrick = true;
    };
    onUndoAbilityUse = () => {
        if (!this.abilityUsedThisTurn) return;
        this.cardsOnTable = [this.abilityUsedThisTurn.originalCard];
        this.humanAbilityCharges = 2;
        this.abilityUsedThisTurn = null;
        this.message = this.T.yourTurnMessage;
    };
    activateFollowerAbility = (waifuName: string) => {
        let abilityArmed: ArmedAbility | null = null;
        let abilityName = '';
        switch(waifuName) {
            case 'Sakura': abilityArmed = 'sakura_blessing'; abilityName = this.T.sakura_blessing; break;
            case 'Rei': if (this.aiScore >= 5) { abilityArmed = 'rei_analysis'; abilityName = this.T.rei_analysis; } break;
            case 'Kasumi': abilityArmed = 'kasumi_gambit'; abilityName = this.T.kasumi_gambit; break;
        }
        if (!abilityArmed) return;
        this.abilityArmed = abilityArmed;
        this.message = this.T.followerAbilityArmed(waifuName, abilityName);
        if (abilityArmed === 'rei_analysis') {
            this.humanScore += 5;
            this.aiScore -= 5;
            this.roguelikeState.followerAbilitiesUsedThisMatch.push(waifuName);
            this.abilityArmed = null;
            this.message = this.T.yourTurnMessage;
        } else if (abilityArmed === 'kasumi_gambit') {
            this.isKasumiModalOpen = true;
        } else if (abilityArmed === 'sakura_blessing') {
            this.guaranteedClashWinner = 'human';
            this.roguelikeState.followerAbilitiesUsedThisMatch.push(waifuName);
            this.abilityArmed = null;
            this.message = this.T.yourTurnMessage;
        }
    };
    cancelFollowerAbility = () => { this.abilityArmed = null; this.message = this.T.yourTurnMessage; };
    closeKasumiModal = () => { this.isKasumiModalOpen = false; this.abilityArmed = null; this.message = this.T.yourTurnMessage; };
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
    goToMenu = () => this.phase = 'menu';
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
    resetJustWonLevelFlag = () => { if (this.roguelikeState) this.roguelikeState.justWonLevel = false; };
    
    saveGame = () => {
        if (this.phase === 'playing') {
            // FIX: Manually destructure serializable settings to avoid circular reference to rootStore -> posthog
            const {
                language,
                gameplayMode,
                difficulty,
                isChatEnabled,
                waitForWaifuResponse,
                soundtrack,
                isMusicEnabled,
                soundEditorSettings,
                cardDeckStyle,
            } = this.rootStore.gameSettingsStore;
    
            const settingsToSave = {
                language,
                gameplayMode,
                difficulty,
                isChatEnabled,
                waitForWaifuResponse,
                soundtrack,
                isMusicEnabled,
                soundEditorSettings,
                cardDeckStyle,
            };

            const stateToSave = {
                settings: settingsToSave,
                currentWaifuName: this.currentWaifu?.name ?? null,
                deck: toJS(this.deck), humanHand: toJS(this.humanHand), aiHand: toJS(this.aiHand), briscolaCard: toJS(this.briscolaCard), briscolaSuit: this.briscolaSuit, cardsOnTable: toJS(this.cardsOnTable), turn: this.turn,
                humanScore: this.humanScore, aiScore: this.aiScore, trickStarter: this.trickStarter, message: this.message, backgroundUrl: this.backgroundUrl, aiEmotionalState: this.aiEmotionalState,
                gameMode: this.gameMode, trickHistory: toJS(this.trickHistory), lastTrick: toJS(this.lastTrick), roguelikeState: toJS(this.roguelikeState), activeElements: toJS(this.activeElements), humanAbilityCharges: this.humanAbilityCharges,
                aiAbilityCharges: this.aiAbilityCharges, lastResolvedTrick: toJS(this.lastResolvedTrick), trickCounter: this.trickCounter,
                cardForElementalChoice: toJS(this.cardForElementalChoice), elementalClash: toJS(this.elementalClash), lastTrickHighlights: toJS(this.lastTrickHighlights), abilityTargetingState: this.abilityTargetingState, abilityArmed: this.abilityArmed,
                abilityUsedThisTurn: toJS(this.abilityUsedThisTurn), revealedAiHand: toJS(this.revealedAiHand), isKasumiModalOpen: this.isKasumiModalOpen,
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
                this.roguelikeState = saved.roguelikeState; this.activeElements = saved.activeElements || []; this.humanAbilityCharges = saved.humanAbilityCharges;
                this.aiAbilityCharges = saved.aiAbilityCharges; this.cardForElementalChoice = saved.cardForElementalChoice; this.elementalClash = saved.elementalClash;
                this.lastTrickHighlights = saved.lastTrickHighlights || { human: 'unset', ai: 'unset' }; this.abilityTargetingState = saved.abilityTargetingState;
                this.abilityArmed = saved.abilityArmed; this.abilityUsedThisTurn = saved.abilityUsedThisTurn; this.revealedAiHand = saved.revealedAiHand;
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
}