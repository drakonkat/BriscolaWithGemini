/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { runInAction, reaction } from 'mobx';
import { GameStateStore } from './GameStateStore';
import type { RootStore } from '.';
import type { Waifu, Card, RoguelikeState, RoguelikePowerUpId, Element, TrickHistoryEntry, AbilityUseHistoryEntry, ElementalClashResult } from '../core/types';
import { WAIFUS } from '../core/waifus';
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
    roguelikeState: RoguelikeState = this.loadGame();
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

    constructor(rootStore: RootStore) {
        super(rootStore);

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

    loadGame(): RoguelikeState {
        return loadFromLocalStorage('roguelike_save', {
            currentLevel: 0,
            encounteredWaifus: [],
            followers: [],
            followerAbilitiesUsedThisMatch: [],
            initialPower: null,
            activePowers: [],
        });
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

    resumeGame = () => {
        if (!this.hasSavedGame) return;
        this.startGame(null);
    }
    
    startRoguelikeRun = (waifu: Waifu | null) => {
        this.clearSavedGame();
        
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
        
        this.roguelikeState.currentLevel = 1;
        this.powerSelectionOptions = null;
        this.saveGame();
        this.startGame(null);
    }

    startGame(param: Waifu | null | 'R' | 'SR' | 'SSR' = null) {
        const level = this.roguelikeState.currentLevel;
        if (level === 0) {
            this.startRoguelikeRun(null);
            return;
        }

        const opponentPool = WAIFUS.filter(w => !this.roguelikeState.encounteredWaifus.includes(w.name));
        const opponent = opponentPool.length > 0 ? opponentPool[Math.floor(Math.random() * opponentPool.length)] : WAIFUS[Math.floor(Math.random() * WAIFUS.length)];
        
        this._resetState(); // Reset common game state but keep roguelike progress
        
        runInAction(() => {
            this.humanScorePile = [];
            this.aiScorePile = [];
            this.roguelikeState.followerAbilitiesUsedThisMatch = [];
            
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
    
    selectCardForPlay = (card: Card, activatePower?: boolean) => {
        if (this.turn !== 'human' || this.isProcessing) return;
    
        if (card.element && activatePower === undefined && !card.isTemporaryBriscola) {
            this.cardForElementalChoice = card;
            this.isElementalChoiceOpen = true;
            return;
        }
    
        this.isElementalChoiceOpen = false;
        this.cardForElementalChoice = null;
    
        if (activatePower && card.element) {
            const cardToPlay = { ...card, elementalEffectActivated: true };
            this.rootStore.missionStore.incrementProgress('elementalPowersUsed');
            playSound(`element-${card.element}`);
            this.playCard(cardToPlay, 'human');
        } else {
            this.playCard({ ...card, elementalEffectActivated: false }, 'human');
        }
    }

    confirmElementalChoice = (activate: boolean) => {
        if (this.cardForElementalChoice) {
            this.selectCardForPlay(this.cardForElementalChoice, activate);
        }
    }

    cancelElementalChoice = () => {
        this.isElementalChoiceOpen = false;
        this.cardForElementalChoice = null;
    }

    handleAiTurn() {
        if (this.phase !== 'playing' || this.turn !== 'ai' || this.isProcessing || this.cardsOnTable.length === 2) return;

        this.isProcessing = true;
        let aiCard = getLocalAIMove(this.aiHand, this.briscolaSuit!, this.cardsOnTable, this.rootStore.gameSettingsStore.difficulty);
        
        if (aiCard.element) {
            const humanCardOnTable = this.cardsOnTable.length === 1 ? this.cardsOnTable[0] : null;
            let shouldActivate = false;

            if (humanCardOnTable?.elementalEffectActivated) {
                shouldActivate = true;
            } else {
                const isWinningTrick = !humanCardOnTable || getRoguelikeTrickWinner([humanCardOnTable, aiCard], 'human', this.briscolaSuit!) === 'ai';

                switch (aiCard.element) {
                    case 'fire':
                        if (isWinningTrick || this.getCardPoints(aiCard) === 0) shouldActivate = Math.random() < 0.8; 
                        break;
                    case 'water':
                        if (!isWinningTrick && humanCardOnTable && this.getCardPoints(humanCardOnTable) >= 10) shouldActivate = Math.random() < 0.9;
                        break;
                    case 'air':
                        if (isWinningTrick && this.aiScorePile.some(c => c.element === 'air')) shouldActivate = Math.random() < 0.7;
                        break;
                    case 'earth':
                        if (!isWinningTrick && this.getCardPoints(aiCard) > 0) shouldActivate = Math.random() < 0.75;
                        break;
                }
            }

            if (shouldActivate) {
                const newAiCard = { ...aiCard, elementalEffectActivated: true };
                this.rootStore.missionStore.incrementProgress('elementalPowersUsed');
                playSound(`element-${newAiCard.element!}`);
                aiCard = newAiCard;
            }
        }

        this.playAiCard(aiCard);
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

        if (isHumanPowerActive && isAiPowerActive && humanCard.element && aiCard.element) {
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
        
        const trickResolutionDelay = this.elementalClash ? (this.elementalClash.type === 'dice' && this.rootStore.gameSettingsStore.isDiceAnimationEnabled ? 3500 : 2000) : 1500;
        
        setTimeout(() => runInAction(() => {
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
            
            setTimeout(() => runInAction(() => {
                this.drawCards();
                this.trickStarter = trickWinner;
                this.turn = trickWinner;
                this.trickCounter++;
                if (trickWinner === 'ai' && this.currentWaifu) this.message = this.T.aiStarts(this.currentWaifu.name);
                else this.message = this.T.yourTurn;
                this.isResolvingTrick = false;
                this.revealedAiHand = null;
                this.handleEndOfGame();
            }), 1000);
        }), trickResolutionDelay);
    }
    
    drawCards() {
        if (this.deck.length > 0) {
            const { uiStore } = this.rootStore;
            uiStore.setDrawingCards([{ destination: this.trickStarter }, { destination: this.trickStarter === 'human' ? 'ai' : 'human' }]);

            setTimeout(() => runInAction(() => {
                if (this.deck.length === 0) {
                     uiStore.setDrawingCards(null);
                     return;
                }
                const card1 = this.deck.pop()!;
                const card2 = this.deck.length > 0 ? this.deck.pop()! : null;

                if (this.trickStarter === 'human') {
                    this.humanHand.push(card1);
                    if(card2) this.aiHand.push(card2);
                } else {
                    this.aiHand.push(card1);
                    if(card2) this.humanHand.push(card2);
                }

                if (this.deck.length === 0 && this.briscolaCard) {
                    const finalCard = this.briscolaCard;
                    if (this.trickStarter === 'human') this.aiHand.push(finalCard);
                    else this.humanHand.push(finalCard);
                    this.briscolaCard = null;
                }
                uiStore.setDrawingCards(null);
            }), 500);
        }
    }

    handleEndOfGame() {
        if (this.humanHand.length === 0 && this.aiHand.length === 0 && !this.isResolvingTrick) {
            const lastTrickBonus = this.roguelikeState.activePowers.some(p => p.id === 'bonus_point_per_trick') ? 0 : 1;
            if (this.trickStarter === 'human') this.humanScore += lastTrickBonus;
            else this.aiScore += lastTrickBonus;

            let winner: 'human' | 'ai' | 'tie' = 'tie';
            if (this.humanScore > this.aiScore) winner = 'human';
            if (this.aiScore > this.humanScore) winner = 'ai';

            this.gameResult = winner;
            const { difficulty } = this.rootStore.gameSettingsStore;

            if (winner === 'human') {
                this.roguelikeState.encounteredWaifus.push(this.currentWaifu!.name);
                const followerToRecruit = WAIFUS.find(w => w.name === this.currentWaifu!.name && w.followerAbilityId && !this.roguelikeState.followers.some(f => f.name === w.name));
                if (followerToRecruit) {
                    this.newFollower = followerToRecruit;
                    this.roguelikeState.followers.push(followerToRecruit);
                    this.rootStore.missionStore.incrementProgress('followersRecruited');
                }
                
                if (this.roguelikeState.currentLevel < 4) {
                    if (!this.newFollower) this.goToNextLevel();
                } else {
                    this.lastGameWinnings = ROGUELIKE_REWARDS[difficulty].win;
                    this.rootStore.gachaStore.addCoins(this.lastGameWinnings);
                    this.rootStore.missionStore.incrementProgress('roguelikeGamesWon');
                }
                this.phase = 'gameOver';

            } else { // AI wins or tie
                this.lastGameWinnings = ROGUELIKE_REWARDS[difficulty].loss[this.roguelikeState.currentLevel];
                this.rootStore.gachaStore.addCoins(this.lastGameWinnings);
                this.phase = 'gameOver';
            }
            if(this.phase === 'gameOver') this.clearSavedGame();
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
        
        const abilityEntry: AbilityUseHistoryEntry = { isAbilityUse: true, trickNumber: this.trickCounter + 1, waifuName, abilityName: (this.T as any)[abilityId] as string };
        this.trickHistory.push(abilityEntry);

        this.roguelikeState.followerAbilitiesUsedThisMatch.push(waifuName);
        this.saveGame();
    }
    
    openKasumiModal = () => { if(this.turn === 'human') this.isKasumiModalOpen = true; }
    closeKasumiModal = () => this.isKasumiModalOpen = false;
    handleKasumiCardSwap = (card: Card) => {
        if (!this.briscolaCard) return;
        this.humanHand = this.humanHand.filter(c => c.id !== card.id);
        this.humanHand.push({ ...this.briscolaCard, isTemporaryBriscola: false });
        this.briscolaCard = { ...card, isTemporaryBriscola: true };
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
        this.humanHand = this.humanHand.filter(c => c.id !== card.id);
        this.humanHand.push({ ...this.briscolaCard, isTemporaryBriscola: false });
        this.briscolaCard = { ...card, isTemporaryBriscola: true };
        this.briscolaSwapCooldown = 4 - swapPower.level;
        this.closeBriscolaSwapModal();
    }
    
    activateLastTrickInsight() {
        const insightPower = this.roguelikeState.activePowers.find(p => p.id === 'last_trick_insight');
        if (this.lastTrickInsightCooldown === 0 && insightPower?.level === 2) {
            this.revealedAiHand = [...this.aiHand];
            this.lastTrickInsightCooldown = 3;
        }
    }

    handleDragStart = (card: Card, e: React.MouseEvent | React.TouchEvent) => {
        if (this.turn !== 'human' || this.isProcessing || !card.element || card.isTemporaryBriscola) return;
        
        const target = e.currentTarget as HTMLElement;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        this.draggingCardInfo = { card, element: target };
        this.clonePosition = { x: clientX, y: clientY };
    }

    handleDragMove = (e: MouseEvent | TouchEvent, zones: Record<string, HTMLElement | null>) => {
        if (!this.draggingCardInfo) return;
        
        e.preventDefault();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        this.clonePosition = { x: clientX, y: clientY };
        
        let newDropZone: 'normal' | 'power' | 'cancel' | null = null;
        for (const [zoneName, zoneElement] of Object.entries(zones)) {
            if (zoneElement) {
                const rect = zoneElement.getBoundingClientRect();
                if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
                    newDropZone = zoneName as 'normal' | 'power' | 'cancel';
                    break;
                }
            }
        }
        this.currentDropZone = newDropZone;
    }

    handleDragEnd = () => {
        if (!this.draggingCardInfo) return;

        this.draggingCardInfo.element.style.opacity = '1';
        const card = this.draggingCardInfo.card;

        if (this.currentDropZone === 'normal') {
            this.selectCardForPlay(card, false); 
        } else if (this.currentDropZone === 'power') {
            this.selectCardForPlay(card, true);
        }

        this.draggingCardInfo = null;
        this.clonePosition = null;
        this.currentDropZone = null;
    }

    forceCloseClashModal() {
        this.elementalClash = null;
    }
}