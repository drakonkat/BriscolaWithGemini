/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Import React to use React.MouseEvent and React.TouchEvent types.
import React from 'react';
import { runInAction, reaction, makeObservable, observable, action, computed, override } from 'mobx';
import { GameStateStore } from './GameStateStore';
import type { RootStore } from '.';
import type { Waifu, Card, RoguelikeState, RoguelikePowerUpId, Element, TrickHistoryEntry, AbilityUseHistoryEntry, ElementalClashResult, Value } from '../core/types';
import { WAIFUS, BOSS_WAIFU } from '../core/waifus';
import { getImageUrl, shuffleDeck, getCardPoints } from '../core/utils';
import { createDeck } from '../core/classicGameLogic';
import { initializeRoguelikeDeck, getRoguelikeTrickWinner, determineWeaknessWinner, calculateRoguelikeTrickPoints } from '../core/roguelikeGameLogic';
import { ALL_POWER_UP_IDS, POWER_UP_DEFINITIONS } from '../core/roguelikePowers';
import { ROGUELIKE_REWARDS } from '../core/constants';
import { playSound } from '../core/soundManager';
import { getLocalAIMove } from '../core/localAI';

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

export class RoguelikeModeStore extends GameStateStore {
    roguelikeState: RoguelikeState = this._loadRoguelikeState();
    powerSelectionOptions: { newPowers: RoguelikePowerUpId[], upgrade: { id: RoguelikePowerUpId, level: number } | null } | null = null;
    
    activeElements: Element[] = [];
    isElementalChoiceOpen = false;
    cardForElementalChoice: Card | null = null;
    elementalClash: ElementalClashResult | null = null;
    powerAnimation: { type: Element, points: number, player: 'human' | 'ai' } | null = null;

    humanScorePile: Card[] = [];
    aiScorePile: Card[] = [];

    // Follower & Power states
    isKasumiModalOpen = false;
    isBriscolaSwapModalOpen = false;
    briscolaSwapCooldown = 0;
    lastTrickInsightCooldown = 0;
    revealedAiHand: Card[] | null = null;
    newFollower: Waifu | null = null;
    sakuraBlessingActive = false;

    trickResolutionTimer: number | null = null;
    trickResolutionCallback: (() => void) | null = null;

    activatedElementsThisMatch: Element[] = [];

    constructor(rootStore: RootStore) {
        super(rootStore);
        makeObservable(this, {
            roguelikeState: observable,
            powerSelectionOptions: observable,
            activeElements: observable,
            isElementalChoiceOpen: observable,
            cardForElementalChoice: observable,
            elementalClash: observable,
            powerAnimation: observable,
            humanScorePile: observable,
            aiScorePile: observable,
            isKasumiModalOpen: observable,
            isBriscolaSwapModalOpen: observable,
            briscolaSwapCooldown: observable,
            lastTrickInsightCooldown: observable,
            revealedAiHand: observable,
            newFollower: observable,
            trickResolutionTimer: observable,
            trickResolutionCallback: observable,
            activatedElementsThisMatch: observable,
            sakuraBlessingActive: observable,
            hasSavedGame: override,
            saveGame: override,
            loadGame: override,
            clearSavedGame: override,
            resumeGame: override,
            startRoguelikeRun: action,
            selectPowerUp: action,
            startGame: action,
            selectCardForPlay: override,
            confirmElementalChoice: action,
            cancelElementalChoice: action,
            handleAiTurn: override,
            resolveTrick: action,
            handleEndOfGame: action,
            goToNextLevel: action,
            acknowledgeNewFollower: action,
            getCardPoints: action,
            activateFollowerAbility: action,
            openKasumiModal: action,
            closeKasumiModal: action,
            handleKasumiCardSwap: action,
            openBriscolaSwapModal: action,
            closeBriscolaSwapModal: action,
            handleBriscolaSwap: action,
            activateLastTrickInsight: action,
            handleDragStart: override,
            handleDragMove: override,
            handleDragEnd: override,
            forceCloseClashModal: action,
        });

        this.addReactionDisposer(reaction(
            () => this.cardsOnTable.length,
            (length) => {
                if (this.phase === 'playing' && length === 2 && !this.isResolvingTrick) {
                    this.resolveTrick();
                }
            }
        ));
        this.addReactionDisposer(reaction(
            () => ({ phase: this.phase, turn: this.turn, cardsOnTable: this.cardsOnTable.length }), 
            this.handleAiTurn.bind(this)
        ));
    }

    get hasSavedGame() {
        return this.roguelikeState.currentLevel > 0;
    }

    saveGame() {
        localStorage.setItem('roguelike_save', JSON.stringify(this.roguelikeState));
    }

    // FIX: Renamed from loadGame to _loadRoguelikeState to avoid conflict with the base class's abstract method.
    _loadRoguelikeState(): RoguelikeState {
        return loadFromLocalStorage('roguelike_save', {
            currentLevel: 0,
            encounteredWaifus: [],
            followers: [],
            followerAbilitiesUsedThisMatch: [],
            initialPower: null,
            activePowers: [],
            waifuOpponents: [],
        });
    }

    // FIX: Implemented the abstract loadGame method to match the required `() => boolean` signature from GameStateStore.
    loadGame(): boolean {
        const state = this._loadRoguelikeState();
        if (state.currentLevel > 0) {
            runInAction(() => {
                this.roguelikeState = state;
            });
            return true;
        }
        return false;
    }

    clearSavedGame() {
        localStorage.removeItem('roguelike_save');
        super._resetState();
        
        runInAction(() => {
            this.roguelikeState = {
                currentLevel: 0,
                encounteredWaifus: [],
                followers: [],
                followerAbilitiesUsedThisMatch: [],
                initialPower: null,
                activePowers: [],
                waifuOpponents: [],
            };
            this.powerSelectionOptions = null;
            this.activeElements = [];
            this.isElementalChoiceOpen = false;
            this.cardForElementalChoice = null;
            this.elementalClash = null;
            this.powerAnimation = null;
            this.humanScorePile = [];
            this.aiScorePile = [];
            this.isKasumiModalOpen = false;
            this.isBriscolaSwapModalOpen = false;
            this.briscolaSwapCooldown = 0;
            this.lastTrickInsightCooldown = 0;
            this.revealedAiHand = null;
            this.newFollower = null;
        });
    }

    resumeGame() {
        if (!this.hasSavedGame) return;
        this.phase = 'roguelike-map';
    }
    
    startRoguelikeRun = (waifu: Waifu | null) => {
        this.clearSavedGame();

        const opponents = shuffleDeck(WAIFUS).slice(0, 3);
        this.roguelikeState.waifuOpponents = [...opponents.map(w => w.name), BOSS_WAIFU.name];
        
        this.roguelikeState.currentLevel = 1;
        
        const availablePowers = shuffleDeck(ALL_POWER_UP_IDS.filter(id => id !== 'third_eye'));
        this.powerSelectionOptions = {
            newPowers: availablePowers.slice(0, 3),
            upgrade: null,
        };
        this.phase = 'power-selection';
    }

    selectPowerUp = (powerId: RoguelikePowerUpId, isUpgrade: boolean) => {
        if (isUpgrade) {
            const power = this.roguelikeState.activePowers.find(p => p.id === powerId);
            if (power) {
                power.level++;
            }
        } else {
            this.roguelikeState.activePowers.push({ id: powerId, level: 1 });
            if (!this.roguelikeState.initialPower) {
                this.roguelikeState.initialPower = powerId;
            }
        }
        
        this.powerSelectionOptions = null;
        this.saveGame();
        this.phase = 'roguelike-map';
    }

    startGame(param: Waifu | null | 'R' | 'SR' | 'SSR' = null) {
        const level = this.roguelikeState.currentLevel;
        if (level === 0) {
            this.startRoguelikeRun(null);
            return;
        }

        let opponent: Waifu;
        if (level > WAIFUS.length) {
            opponent = BOSS_WAIFU;
        } else {
            const opponentName = this.roguelikeState.waifuOpponents[level - 1];
            opponent = WAIFUS.find(w => w.name === opponentName) ?? BOSS_WAIFU;
        }
        
        this._resetState(); // Reset common game state but keep roguelike progress
        
        runInAction(() => {
            this.humanScorePile = [];
            this.aiScorePile = [];
            this.roguelikeState.followerAbilitiesUsedThisMatch = [];
            this.activatedElementsThisMatch = [];
            this.newFollower = null; // FIX: Reset newFollower at the start of each match.
            
            this.currentWaifu = opponent;
            this.backgroundUrl = getImageUrl(`/background/landscape${Math.floor(Math.random() * 21) + 1}.png`);
            
            const initialDeck = createDeck();
            const { deck, activeElements } = initializeRoguelikeDeck(initialDeck, level);
            this.activeElements = activeElements;
            const shuffledDeck = shuffleDeck(deck);

            this.humanHand = shuffledDeck.splice(0, 3);
            this.aiHand = shuffledDeck.splice(0, 3);
            this.briscolaCard = shuffledDeck.length > 0 ? shuffledDeck.pop()! : null;
            this.briscolaSuit = this.briscolaCard?.suit ?? (shuffledDeck.length > 0 ? shuffledDeck[shuffledDeck.length - 1].suit : 'Spade');
            this.deck = shuffledDeck;

            const acePower = this.roguelikeState.activePowers.find(p => p.id === 'ace_of_briscola_start');
            if (acePower && this.briscolaSuit) {
                const briscola = this.briscolaSuit;
                const cardsToGive: Value[] = [];
            
                if (acePower.level === 1) { // Asso, 3, or Re
                    // FIX: Cast the selected string to `Value` to satisfy TypeScript's type checker.
                    cardsToGive.push(['Asso', '3', 'Re'][Math.floor(Math.random() * 3)] as Value);
                } else if (acePower.level === 2) { // Asso or 3
                    // FIX: Cast the selected string to `Value` to satisfy TypeScript's type checker.
                    cardsToGive.push(['Asso', '3'][Math.floor(Math.random() * 2)] as Value);
                } else { // level 3: Asso and 3
                    cardsToGive.push('Asso', '3');
                }
            
                for (const valueToGive of cardsToGive) {
                    if (this.humanHand.some(c => c.suit === briscola && c.value === valueToGive)) {
                        continue;
                    }
            
                    let specialCard: Card | undefined;
                    let cardLocation: 'deck' | 'aiHand' | 'briscolaCard' | null = null;
                    let cardIndex = -1;
            
                    cardIndex = this.deck.findIndex(c => c.suit === briscola && c.value === valueToGive);
                    if (cardIndex !== -1) {
                        specialCard = this.deck[cardIndex];
                        cardLocation = 'deck';
                    } else {
                        cardIndex = this.aiHand.findIndex(c => c.suit === briscola && c.value === valueToGive);
                        if (cardIndex !== -1) {
                            specialCard = this.aiHand[cardIndex];
                            cardLocation = 'aiHand';
                        } else {
                            if (this.briscolaCard && this.briscolaCard.suit === briscola && this.briscolaCard.value === valueToGive) {
                                specialCard = this.briscolaCard;
                                cardLocation = 'briscolaCard';
                            }
                        }
                    }
                    
                    if (specialCard && cardLocation) {
                        const cardToSwap = this.humanHand.find(c => c.suit !== briscola && getCardPoints(c) === 0) || this.humanHand[0];
                        
                        if (cardToSwap) {
                            const playerSwapIndex = this.humanHand.findIndex(c => c.id === cardToSwap.id);
                            
                            if (playerSwapIndex !== -1) {
                                this.humanHand[playerSwapIndex] = specialCard;
            
                                if (cardLocation === 'deck') {
                                    this.deck[cardIndex] = cardToSwap;
                                } else if (cardLocation === 'aiHand') {
                                    this.aiHand[cardIndex] = cardToSwap;
                                } else if (cardLocation === 'briscolaCard') {
                                    this.briscolaCard = cardToSwap;
                                }
                            }
                        }
                    }
                }
            }

            this.trickStarter = (this.trickCounter % 2 === 0) ? 'human' : 'ai';
            this.turn = this.trickStarter;
            this.message = this.turn === 'human' ? this.T.yourTurnMessage : this.T.aiStarts(this.currentWaifu.name);
            this.briscolaSwapCooldown = Math.max(0, this.briscolaSwapCooldown - 1);
            this.lastTrickInsightCooldown = Math.max(0, this.lastTrickInsightCooldown - 1);
            
            this.rootStore.chatStore.resetChat(this.currentWaifu);
            this.phase = 'playing';
            this.saveGame();
            
            this.rootStore.posthog?.capture('roguelike_match_started', { 
                level: this.roguelikeState.currentLevel,
                difficulty: this.rootStore.gameSettingsStore.difficulty,
                waifu: opponent.name,
                active_powers: this.roguelikeState.activePowers,
            });
        });
    }
    
    selectCardForPlay = (card: Card) => {
        if (this.turn !== 'human' || this.isProcessing) return;
    
        if (card.element) {
            this.cardForElementalChoice = card;
            this.isElementalChoiceOpen = true;
            return;
        }
        
        this.isProcessing = true;
        this.playCard({ ...card, elementalEffectActivated: false }, 'human');
    }

    confirmElementalChoice = (activate: boolean, card?: Card) => {
        const cardToPlay = card || this.cardForElementalChoice;
        if (!cardToPlay || this.isProcessing) return;
        
        // If we came from the modal, close it and clear state
        if (!card) {
            this.isElementalChoiceOpen = false;
            this.cardForElementalChoice = null;
        }
    
        const finalCard = { ...cardToPlay, elementalEffectActivated: activate };

        if (finalCard.elementalEffectActivated) {
            this.rootStore.missionStore.incrementProgress('elementalPowersUsed');
            playSound(`element-${finalCard.element!}`);
        }
        
        this.isProcessing = true;
        this.playCard(finalCard, 'human');
    }

    cancelElementalChoice = () => {
        this.isElementalChoiceOpen = false;
        this.cardForElementalChoice = null;
    }

    handleAiTurn() {
        if (this.phase !== 'playing' || this.turn !== 'ai' || this.cardsOnTable.length === 2) return;
        this.isProcessing = true;
    
        const { difficulty } = this.rootStore.gameSettingsStore;
        const humanHandForAI = difficulty === 'apocalypse' ? this.humanHand : null;
        const deckForAI = difficulty === 'apocalypse' ? this.deck : null;
    
        let aiCardToPlay: Card;
        let activatePower = false;
        const humanCardOnTable = this.cardsOnTable.length === 1 ? this.cardsOnTable[0] : null;
    
        const aiMoveResult = getLocalAIMove(this.aiHand, this.briscolaSuit!, this.cardsOnTable, difficulty, humanHandForAI, deckForAI);
        let hadSwap = false;
    
        if (aiMoveResult.newHand && aiMoveResult.newDeck) {
            this.aiHand = aiMoveResult.newHand;
            this.deck = aiMoveResult.newDeck;
            hadSwap = true;
        }
        aiCardToPlay = aiMoveResult.cardToPlay;
    
        // Only try to override with a power move if a deck swap didn't happen
        if (!hadSwap) {
            if (humanCardOnTable?.elementalEffectActivated) {
                const elementalCards = this.aiHand.filter(c => c.element);
                if (elementalCards.length > 0) {
                    const bestPowerCard = getLocalAIMove(elementalCards, this.briscolaSuit!, this.cardsOnTable, difficulty, humanHandForAI, deckForAI).cardToPlay;
                    aiCardToPlay = bestPowerCard;
                    activatePower = true;
                }
            } else {
                for (const card of this.aiHand) {
                    if (card.element) {
                        const isWinningTrick = !humanCardOnTable || getRoguelikeTrickWinner([humanCardOnTable, card], this.trickStarter, this.briscolaSuit!) === 'ai';
                        let isGoodPowerMove = false;
    
                        switch (card.element) {
                            case 'fire':
                                if (isWinningTrick) isGoodPowerMove = true;
                                break;
                            case 'water':
                                if (!isWinningTrick && humanCardOnTable && getCardPoints(humanCardOnTable) >= 10) isGoodPowerMove = true;
                                break;
                            case 'air':
                                if (isWinningTrick && this.aiScorePile.some(c => c.element === 'air')) isGoodPowerMove = true;
                                break;
                            case 'earth':
                                if (!isWinningTrick && getCardPoints(card) >= 10) isGoodPowerMove = true;
                                break;
                        }
                        
                        if (isGoodPowerMove) {
                            aiCardToPlay = card;
                            activatePower = true;
                            break;
                        }
                    }
                }
            }
        }
    
        const finalCard = { ...aiCardToPlay, elementalEffectActivated: activatePower };
    
        if (finalCard.elementalEffectActivated) {
            this.rootStore.missionStore.incrementProgress('elementalPowersUsed');
            playSound(`element-${finalCard.element!}`);
        }
    
        this.playAiCard(finalCard);
    }
    
    resolveTrick() {
        if (this.cardsOnTable.length < 2 || this.isResolvingTrick) return;
        this.isResolvingTrick = true;

        const humanCard = this.trickStarter === 'human' ? this.cardsOnTable[0] : this.cardsOnTable[1];
        const aiCard = this.trickStarter === 'ai' ? this.cardsOnTable[0] : this.cardsOnTable[1];
        
        this.elementalClash = null;
        let clashWinner: 'human' | 'ai' | 'tie' | null = null;
        
        const isHumanPowerActive = humanCard.elementalEffectActivated ?? false;
        const isAiPowerActive = aiCard.elementalEffectActivated ?? false;
        
        if (isHumanPowerActive && humanCard.element) {
            this.activatedElementsThisMatch.push(humanCard.element);
        }
        if (isAiPowerActive && aiCard.element) {
            this.activatedElementsThisMatch.push(aiCard.element);
        }

        if (isHumanPowerActive && isAiPowerActive && humanCard.element && aiCard.element) {
            if (this.sakuraBlessingActive) {
                clashWinner = 'human';
                this.elementalClash = { type: 'weakness', winner: 'human', winningElement: humanCard.element, losingElement: aiCard.element };
                this.sakuraBlessingActive = false; // one-time use
            } else {
                const weaknessWinner = determineWeaknessWinner(humanCard.element, aiCard.element);
                if (weaknessWinner) {
                    clashWinner = weaknessWinner;
                    this.elementalClash = { type: 'weakness', winner: weaknessWinner, winningElement: weaknessWinner === 'human' ? humanCard.element : aiCard.element, losingElement: weaknessWinner === 'human' ? aiCard.element : humanCard.element };
                } else {
                    playSound('dice-roll');
                    const humanRoll = Math.floor(Math.random() * 100) + 1;
                    const aiRoll = Math.floor(Math.random() * 100) + 1;
                    if (humanRoll > aiRoll) clashWinner = 'human';
                    else if (aiRoll > humanRoll) clashWinner = 'ai';
                    else clashWinner = 'tie';
                    this.elementalClash = { type: 'dice', humanRoll, aiRoll, winner: clashWinner };
                }
            }
        }
        
        const trickWinner = getRoguelikeTrickWinner(this.cardsOnTable, this.trickStarter, this.briscolaSuit!, this.roguelikeState.activePowers);
        
        const { totalPoints, basePoints, bonusPoints, bonusReasons, humanCardPointsReturned, aiCardPointsReturned, airBonus } = calculateRoguelikeTrickPoints(
            humanCard, aiCard, trickWinner, clashWinner, this.briscolaSuit!, this.roguelikeState.activePowers,
            this.humanScorePile, this.aiScorePile, this.T
        );

        if (airBonus > 0) {
            this.powerAnimation = { type: 'air', points: airBonus, player: trickWinner };
            setTimeout(() => runInAction(() => this.powerAnimation = null), 1500);
        }

        const newHistoryEntry: TrickHistoryEntry = { trickNumber: this.trickCounter + 1, humanCard, aiCard, winner: trickWinner, points: totalPoints, clashResult: this.elementalClash || undefined, basePoints, bonusPoints, bonusPointsReason: bonusReasons.join(', ') };
        this.trickHistory.push(newHistoryEntry);
        this.lastTrick = newHistoryEntry;
        
        const trickResolutionDelay = this.elementalClash ? (this.elementalClash.type === 'dice' && this.rootStore.gameSettingsStore.isDiceAnimationEnabled ? 5000 : 2000) : 1500;
        
        this.trickResolutionCallback = () => runInAction(() => {
            if (this.trickResolutionCallback === null) return;

            if (trickWinner === 'human') {
                this.humanScore += totalPoints + humanCardPointsReturned;
                this.aiScore += aiCardPointsReturned;
                this.humanScorePile.push(humanCard, aiCard);
                this.message = this.T.youWonTrick(totalPoints);
                playSound('trick-win');
            } else {
                this.aiScore += totalPoints + aiCardPointsReturned;
                this.humanScore += humanCardPointsReturned;
                this.aiScorePile.push(humanCard, aiCard);
                this.message = this.T.aiWonTrick(this.currentWaifu!.name, totalPoints);
                playSound('trick-lose');
            }

            this.cardsOnTable = [];
            this.elementalClash = null;
            this.trickCounter++;
            this.revealedAiHand = null;
            
            if(this.trickResolutionTimer) clearTimeout(this.trickResolutionTimer);
            this.trickResolutionTimer = null;
            this.trickResolutionCallback = null;

            this.drawCards(trickWinner);
            
        });

        this.trickResolutionTimer = window.setTimeout(this.trickResolutionCallback, trickResolutionDelay);
    }

    handleEndOfGame() {
        if (this.humanHand.length === 0 && this.aiHand.length === 0 && !this.isResolvingTrick) {
            const lastTrickBonus = this.roguelikeState.activePowers.some(p => p.id === 'bonus_point_per_trick') ? 0 : 1;
            if (this.trickStarter === 'human') this.humanScore += lastTrickBonus;
            else this.aiScore += lastTrickBonus;

            let winner: 'human' | 'ai' | 'tie' = 'tie';
            if (this.humanScore > this.aiScore) winner = 'human';
            if (this.aiScore > this.humanScore) winner = 'ai';
            if (this.humanScore === this.aiScore && this.humanScore > 60) winner = 'human';
            
            this.gameResult = winner;
            const { difficulty } = this.rootStore.gameSettingsStore;

            if (winner === 'human') {
                const difficultyMultiplier = { easy: 0.5, medium: 1, hard: 1.5, nightmare: 2, apocalypse: 2.5 };
                const coinReward = Math.round(100 * difficultyMultiplier[difficulty] * this.roguelikeState.currentLevel);
                if (coinReward > 0) {
                    this.rootStore.gachaStore.addCoins(coinReward);
                    this.rootStore.uiStore.showSnackbar(this.T.coinsEarned(coinReward), 'success');
                }
                
                this.roguelikeState.encounteredWaifus.push(this.currentWaifu!.name);
                const followerToRecruit = WAIFUS.find(w => w.name === this.currentWaifu!.name && w.followerAbilityId && !this.roguelikeState.followers.some(f => f.name === w.name));
                
                const essencesGainedStrings: string[] = [];
                const essenceCounts = this.activatedElementsThisMatch.reduce((acc, el) => {
                    acc[el] = (acc[el] || 0) + 1;
                    return acc;
                }, {} as Record<Element, number>);

                Object.entries(essenceCounts).forEach(([element, count]) => {
                    if (count > 0) {
                        this.rootStore.gachaStore.addEssences(element as Element, count);
                        const rewardType = `${element}_essences` as keyof typeof this.T.missions.rewards;
                        essencesGainedStrings.push(`${count} ${this.T.missions.rewards[rewardType]}`);
                    }
                });
                
                if (essencesGainedStrings.length > 0) {
                    const message = `${this.T.roguelike.essencesObtained}: ${essencesGainedStrings.join(', ')}`;
                    setTimeout(() => {
                        runInAction(() => {
                            this.rootStore.uiStore.showSnackbar(message, 'success');
                        });
                    }, coinReward > 0 ? 1500 : 0);
                }

                if (followerToRecruit) {
                    this.newFollower = followerToRecruit;
                    this.roguelikeState.followers.push(followerToRecruit);
                    this.rootStore.missionStore.incrementProgress('followersRecruited');
                }
                
                if (this.roguelikeState.currentLevel < 4) {
                    if (!this.newFollower) {
                        this.goToNextLevel();
                    } else {
                        // Wait for user to acknowledge new follower before proceeding
                        this.phase = 'playing'; // Stay on the game board behind the modal
                    }
                } else {
                    // Won the final level (level 4)
                    this.lastGameWinnings = ROGUELIKE_REWARDS[difficulty].win;
                    this.rootStore.gachaStore.addCoins(this.lastGameWinnings);
                    this.rootStore.missionStore.incrementProgress('roguelikeGamesWon');
                    this.phase = 'gameOver'; // Set to gameOver only when run is complete
                    this.clearSavedGame(); // Clear save only when run is complete
                }
            } else { // AI wins or tie
                this.lastGameWinnings = ROGUELIKE_REWARDS[difficulty].loss[this.roguelikeState.currentLevel];
                this.rootStore.gachaStore.addCoins(this.lastGameWinnings);
                this.phase = 'gameOver';
                this.clearSavedGame();
            }
        }
    }

    goToNextLevel() {
        if (this.roguelikeState.currentLevel < 4) {
            this.roguelikeState.currentLevel++;
            this.saveGame();
            
            const initialPowerData = this.roguelikeState.activePowers.find(p => p.id === this.roguelikeState.initialPower);
            const canUpgradeInitial = initialPowerData && initialPowerData.level < POWER_UP_DEFINITIONS[initialPowerData.id].maxLevel;

            const newPowerOptions = shuffleDeck(
                ALL_POWER_UP_IDS.filter(id => {
                    const existing = this.roguelikeState.activePowers.find(p => p.id === id);
                    if (!existing) return true;
                    return existing.level < POWER_UP_DEFINITIONS[id].maxLevel;
                })
            ).slice(0, 2);
                
            this.powerSelectionOptions = {
                newPowers: newPowerOptions,
                upgrade: canUpgradeInitial ? { id: initialPowerData!.id, level: initialPowerData!.level } : null,
            };
            this.phase = 'power-selection';
        } else {
            this.goToMenu();
        }
    }

    acknowledgeNewFollower = () => {
        this.newFollower = null;
        this.goToNextLevel();
    }
    
    getCardPoints(card: Card): number {
        return getCardPoints(card);
    }
    
    activateFollowerAbility(waifuName: string) {
        const follower = this.roguelikeState.followers.find(f => f.name === waifuName);
        if (!follower || !follower.followerAbilityId || this.roguelikeState.followerAbilitiesUsedThisMatch.includes(waifuName)) return;

        const abilityId = follower.followerAbilityId;
        const abilityName = (this.T as any)[abilityId] as string;
        
        let abilityUsed = false;
        let canUse = true;

        switch (abilityId) {
            case 'sakura_blessing':
                this.sakuraBlessingActive = true;
                this.rootStore.uiStore.showSnackbar(this.T.followerAbilityArmed(waifuName, abilityName), 'success');
                abilityUsed = true;
                break;
            case 'rei_analysis':
                if (this.aiScore - this.humanScore >= 5) {
                    this.humanScore += 5;
                    this.aiScore -= 5;
                    this.rootStore.uiStore.showSnackbar(`+5 Punti!`, 'success');
                    abilityUsed = true;
                } else {
                    canUse = false;
                    this.rootStore.uiStore.showSnackbar(`Non puoi usarla ora.`, 'warning');
                }
                break;
            case 'kasumi_gambit':
                if (this.turn === 'human' && this.briscolaCard) {
                    this.openKasumiModal();
                    abilityUsed = true; // Consumed on use, even if modal is closed
                } else {
                     canUse = false;
                     this.rootStore.uiStore.showSnackbar(`Non puoi usarla ora.`, 'warning');
                }
                break;
        }
        
        if (abilityUsed) {
            const abilityEntry: AbilityUseHistoryEntry = { isAbilityUse: true, trickNumber: this.trickCounter + 1, waifuName, abilityName };
            this.trickHistory.push(abilityEntry);
            this.roguelikeState.followerAbilitiesUsedThisMatch.push(waifuName);
            this.saveGame();
        }
    }
    
    openKasumiModal = () => { if(this.turn === 'human') this.isKasumiModalOpen = true; }
    closeKasumiModal = () => this.isKasumiModalOpen = false;

    handleKasumiCardSwap = (card: Card) => {
        if (!this.briscolaCard) return;

        // The original briscola card goes to the player's hand
        const originalBriscolaCard = this.briscolaCard;
        
        // The chosen card from hand goes to the table
        const newBriscolaCard = card;

        // Perform the swap in the hand
        this.humanHand = this.humanHand.filter(c => c.id !== newBriscolaCard.id);
        this.humanHand.push(originalBriscolaCard);

        // Update the briscola on the table AND the briscola suit for the game
        this.briscolaCard = newBriscolaCard;
        this.briscolaSuit = newBriscolaCard.suit;

        this.closeKasumiModal();
    }
    
    openBriscolaSwapModal = () => {
        const swapPower = this.roguelikeState.activePowers.find(p => p.id === 'value_swap');
        if (this.turn === 'human' && this.briscolaSwapCooldown === 0 && swapPower && this.briscolaCard) {
            this.isBriscolaSwapModalOpen = true;
        }
    }
    closeBriscolaSwapModal = () => this.isBriscolaSwapModalOpen = false;

    handleBriscolaSwap = (card: Card) => {
        const swapPower = this.roguelikeState.activePowers.find(p => p.id === 'value_swap');
        if (!this.briscolaCard || !swapPower) return;
        
        const originalBriscolaCard = this.briscolaCard;
        const newBriscolaCard = card;

        this.humanHand = this.humanHand.filter(c => c.id !== newBriscolaCard.id);
        this.humanHand.push(originalBriscolaCard);

        this.briscolaCard = newBriscolaCard;
        this.briscolaSuit = newBriscolaCard.suit;
        
        this.briscolaSwapCooldown = 4 - swapPower.level;
        this.closeBriscolaSwapModal();
    }
    
    activateLastTrickInsight = () => {
        const insightPower = this.roguelikeState.activePowers.find(p => p.id === 'last_trick_insight');
        if (this.lastTrickInsightCooldown === 0 && insightPower?.level === 2) {
            this.revealedAiHand = [...this.aiHand];
            this.lastTrickInsightCooldown = 3;
        }
    }

    handleDragStart(card: Card, e: React.MouseEvent | React.TouchEvent) {
        if (this.turn !== 'human' || this.isProcessing || !card.element) return;

        e.preventDefault();
        const targetElement = e.currentTarget as HTMLElement;
        const touch = 'touches' in e ? e.touches[0] : e;

        runInAction(() => {
            this.draggingCardInfo = { card, element: targetElement };
            this.clonePosition = { x: touch.clientX, y: touch.clientY };
            this.cardForElementalChoice = card; // Set card for choice context
        });
    }

    handleDragMove(e: MouseEvent | TouchEvent, zones: Record<string, HTMLElement | null>) {
        if (!this.draggingCardInfo) return;

        e.preventDefault(); // Prevent scrolling on touch devices

        const touch = 'touches' in e ? e.touches[0] : e;
        const x = touch.clientX;
        const y = touch.clientY;

        runInAction(() => {
            this.clonePosition = { x, y };

            let overZone: 'normal' | 'power' | 'cancel' | null = null;
            if (zones.power) {
                const rect = zones.power.getBoundingClientRect();
                if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
                    overZone = 'power';
                }
            }
            if (!overZone && zones.normal) {
                const rect = zones.normal.getBoundingClientRect();
                if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
                    overZone = 'normal';
                }
            }
            if (!overZone && zones.cancel) {
                const rect = zones.cancel.getBoundingClientRect();
                if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
                    overZone = 'cancel';
                }
            }

            this.currentDropZone = overZone;
        });
    }

    handleDragEnd() {
        if (!this.draggingCardInfo) return;

        const dropZone = this.currentDropZone;

        runInAction(() => {
            if (dropZone === 'power') {
                this.confirmElementalChoice(true);
            } else if (dropZone === 'normal') {
                this.confirmElementalChoice(false);
            } else {
                // Canceled
                this.cardForElementalChoice = null;
            }

            // Reset drag state
            this.draggingCardInfo = null;
            this.clonePosition = null;
            this.currentDropZone = null;
        });
    }

    forceCloseClashModal = () => {
        if (this.trickResolutionTimer && this.trickResolutionCallback) {
            clearTimeout(this.trickResolutionTimer);
            this.trickResolutionTimer = null; 
            this.trickResolutionCallback();
        } else {
            this.elementalClash = null;
        }
    }
}