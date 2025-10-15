/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, runInAction } from 'mobx';
import { GameStateStore } from './GameStateStore';
import type { RootStore } from '.';
import type { Waifu, Card, RoguelikeState, RoguelikePowerUpId, Element, TrickHistoryEntry, AbilityUseHistoryEntry, ElementalClashResult } from '../core/types';
import { WAIFUS } from '../core/waifus';
// FIX: Import `getCardPoints` to resolve a scoping issue where the class method was incorrectly calling itself.
import { getImageUrl, shuffleDeck, getCardPoints } from '../core/utils';
import { createDeck } from '../core/classicGameLogic';
import { initializeRoguelikeDeck, getRoguelikeTrickWinner, determineWeaknessWinner, calculateRoguelikeTrickPoints } from '../core/roguelikeGameLogic';
import { ALL_POWER_UP_IDS, POWER_UP_DEFINITIONS } from '../core/roguelikePowers';
import { ROGUELIKE_REWARDS } from '../core/constants';
import { playSound } from '../core/soundManager';

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
        makeAutoObservable(this, { rootStore: false });
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
        this.roguelikeState = this.loadGame();
    }

    resumeGame = () => {
        if (!this.hasSavedGame) return;
        this.startGame(null);
    }
    
    startRoguelikeRun(waifu: Waifu | null) {
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

    // FIX: Update method signature to match the base class, accepting an optional `param` argument to resolve the type error.
    startGame(param?: Waifu | null | 'R' | 'SR' | 'SSR') {
        const level = this.roguelikeState.currentLevel;
        if (level === 0) { // Should not happen, but as a safeguard
            this.goToMenu();
            return;
        }

        const opponentPool = WAIFUS.filter(w => !this.roguelikeState.encounteredWaifus.includes(w.name));
        const opponent = opponentPool.length > 0 ? opponentPool[Math.floor(Math.random() * opponentPool.length)] : WAIFUS[Math.floor(Math.random() * WAIFUS.length)];
        
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

        // Reset match-specific state
        this.humanScore = 0;
        this.aiScore = 0;
        this.cardsOnTable = [];
        this.trickStarter = (this.trickCounter % 2 === 0) ? 'human' : 'ai';
        this.turn = this.trickStarter;
        this.message = this.turn === 'human' ? this.T.yourTurnMessage : this.T.aiStarts(this.currentWaifu.name);
        this.gameResult = null;
        this.lastGameWinnings = 0;
        this.aiEmotionalState = 'neutral';
        this.trickHistory = [];
        this.lastTrick = null;
        this.isResolvingTrick = false;
        this.elementalClash = null;
        this.humanScorePile = [];
        this.aiScorePile = [];
        this.briscolaSwapCooldown = Math.max(0, this.briscolaSwapCooldown - 1);
        this.lastTrickInsightCooldown = Math.max(0, this.lastTrickInsightCooldown - 1);
        this.roguelikeState.followerAbilitiesUsedThisMatch = [];

        this.rootStore.chatStore.resetChat(this.currentWaifu);
        this.phase = 'playing';
        this.saveGame();
    }
    
    // override selectCardForPlay
    // ...

    resolveTrick() {
        // ... (complex logic for roguelike)
    }

    drawCards() {
        // ...
    }
    
    handleEndOfGame() {
        // ...
    }

    getCardPoints(card: Card): number {
        return getCardPoints(card);
    }
    // Dummy implementations for abstract methods
    selectPower(powerId: RoguelikePowerUpId) {}
    openKasumiModal() {}
    closeKasumiModal() {}
    handleKasumiCardSwap(card: Card) {}
    openBriscolaSwapModal() {}
    closeBriscolaSwapModal() {}
    handleBriscolaSwap(card: Card) {}
    activateLastTrickInsight() {}
    activateFollowerAbility(waifuName: string) {}
    acknowledgeNewFollower() {}
    forceCloseClashModal() { this.elementalClash = null; }
}