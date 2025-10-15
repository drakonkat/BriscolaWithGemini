/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { runInAction } from 'mobx';
import { ClassicModeStore } from './ClassicModeStore';
import type { RootStore } from '.';
import type { DungeonRunState, Waifu, DungeonModifier, Card, TrickHistoryEntry, Element, ElementalClashResult } from '../core/types';
import { WAIFUS, BOSS_WAIFU } from '../core/waifus';
import { getImageUrl, shuffleDeck } from '../core/utils';
import { DUNGEON_MODIFIERS } from '../core/dungeonModifiers';
import { playSound } from '../core/soundManager';
import { initializeRoguelikeDeck, calculateRoguelikeTrickPoints, getRoguelikeTrickWinner } from '../core/roguelikeGameLogic';
import { getCardPoints } from '../core/utils';

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

export class DungeonModeStore extends ClassicModeStore {
    dungeonRunState: DungeonRunState = this.loadDungeonState();
    nextDungeonMatchInfo: { opponent: Waifu, modifier: DungeonModifier } | null = null;
    
    // Roguelike properties needed for modifiers
    humanScorePile: Card[] = [];
    aiScorePile: Card[] = [];
    activeElements: Element[] = [];
    elementalClash: ElementalClashResult | null = null;

    constructor(rootStore: RootStore) {
        super(rootStore);
    }

    saveDungeonState() {
        localStorage.setItem('dungeon_run_state', JSON.stringify(this.dungeonRunState));
    }

    loadDungeonState(): DungeonRunState {
        return loadFromLocalStorage('dungeon_run_state', {
            isActive: false,
            keyRarity: null,
            currentMatch: 0,
            totalMatches: 0,
            wins: 0,
            waifuOpponents: [],
            modifiers: [],
        });
    }

    clearDungeonState() {
        this.dungeonRunState = {
            isActive: false,
            keyRarity: null,
            currentMatch: 0,
            totalMatches: 0,
            wins: 0,
            waifuOpponents: [],
            modifiers: [],
        };
        this.saveDungeonState();
    }

    startGame(param: Waifu | null | 'R' | 'SR' | 'SSR') {
        const rarity = typeof param === 'string' ? param : 'R'; // Fallback
        this.rootStore.uiStore.closeModal('challengeKeySelection');
        this.startDungeonRun(rarity);
    }

    startDungeonRun(rarity: 'R' | 'SR' | 'SSR') {
        const totalMatches = rarity === 'R' ? 3 : rarity === 'SR' ? 4 : 5;
        const opponents: Waifu[] = [];
        if (rarity === 'SSR') {
            const regularOpponents = shuffleDeck(WAIFUS).slice(0, totalMatches - 1);
            opponents.push(...regularOpponents, BOSS_WAIFU);
        } else {
             opponents.push(...shuffleDeck(WAIFUS).slice(0, totalMatches));
        }

        const T_dungeon_modifiers = this.T.dungeonRun.modifiers;
        const modifiers: DungeonModifier[] = Array.from({ length: totalMatches }, () => {
            const modifierInfo = shuffleDeck(DUNGEON_MODIFIERS.filter(m => m.id !== 'NONE'))[0];
            const translationString = T_dungeon_modifiers[modifierInfo.id];
            const [name, ...descriptionParts] = translationString.split(': ');
            const description = descriptionParts.join(': ');
            return { id: modifierInfo.id, name, description: description || '' };
        });

        this.dungeonRunState = {
            isActive: true,
            keyRarity: rarity,
            currentMatch: 0,
            totalMatches,
            wins: 0,
            waifuOpponents: opponents.map(w => w.name),
            modifiers,
        };
        this.saveDungeonState();
        this.prepareNextDungeonMatch();
    }

    prepareNextDungeonMatch = () => {
        this.rootStore.uiStore.closeModal('dungeonProgress');
        if (!this.dungeonRunState.isActive) return;

        const nextMatchIndex = this.dungeonRunState.currentMatch;
        if (nextMatchIndex >= this.dungeonRunState.totalMatches) {
            this.endDungeonRun(true);
            return;
        }

        runInAction(() => {
            const waifuName = this.dungeonRunState.waifuOpponents[nextMatchIndex];
            const opponent = WAIFUS.find(w => w.name === waifuName) ?? BOSS_WAIFU;
            const modifier = this.dungeonRunState.modifiers[nextMatchIndex];
            
            this.nextDungeonMatchInfo = { opponent, modifier };
            this.rootStore.uiStore.openModal('dungeonMatchStart');
        });
    }

    startPreparedDungeonMatch = () => {
        if (!this.nextDungeonMatchInfo) return;

        runInAction(() => {
            this.rootStore.uiStore.closeModal('dungeonMatchStart');
            this.dungeonRunState.currentMatch++;
            this.saveDungeonState();
            this._initializeNewGame(this.nextDungeonMatchInfo!.opponent);
            playSound('game-start');
            this.nextDungeonMatchInfo = null;
        });
    }

    _initializeNewGame(waifu: Waifu) {
        super._initializeNewGame(waifu);
        runInAction(() => {
            this.humanScorePile = [];
            this.aiScorePile = [];
            
            const modifier = this.dungeonRunState.modifiers[this.dungeonRunState.currentMatch - 1];
            if (modifier && modifier.id === 'ELEMENTAL_FURY') {
                const { deck, activeElements } = initializeRoguelikeDeck(this.deck, 3);
                this.deck = deck;
                this.activeElements = activeElements;

                const shuffledDeck = shuffleDeck(this.deck);
                this.humanHand = shuffledDeck.splice(0, 3);
                this.aiHand = shuffledDeck.splice(0, 3);
                this.briscolaCard = shuffledDeck.length > 0 ? shuffledDeck.pop()! : null;
                this.briscolaSuit = this.briscolaCard?.suit ?? (shuffledDeck.length > 0 ? shuffledDeck[shuffledDeck.length - 1].suit : 'Spade');
                this.deck = shuffledDeck;
            }
        });
    }

    resolveTrick() {
        if (this.cardsOnTable.length < 2 || this.isResolvingTrick) return;
        this.isResolvingTrick = true;
        
        const modifier = this.dungeonRunState.modifiers[this.dungeonRunState.currentMatch - 1];

        const humanCard = this.trickStarter === 'human' ? this.cardsOnTable[0] : this.cardsOnTable[1];
        const aiCard = this.trickStarter === 'ai' ? this.cardsOnTable[0] : this.cardsOnTable[1];

        const trickWinner = getRoguelikeTrickWinner(this.cardsOnTable, this.trickStarter, this.briscolaSuit!, []);
        let points = 0;
        let newHistoryEntry: TrickHistoryEntry;

        if (modifier?.id === 'ELEMENTAL_FURY') {
            const { totalPoints, basePoints, bonusPoints, bonusReasons } = calculateRoguelikeTrickPoints(
                humanCard, aiCard, trickWinner, null, this.briscolaSuit!, [], this.humanScorePile, this.aiScorePile, this.T, true
            );
            points = totalPoints;
            newHistoryEntry = { trickNumber: this.trickCounter + 1, humanCard, aiCard, winner: trickWinner, points, basePoints, bonusPoints, bonusPointsReason: bonusReasons.join(', ') };
        } else {
            points = this.getCardPoints(humanCard) + this.getCardPoints(aiCard);
            newHistoryEntry = { trickNumber: this.trickCounter + 1, humanCard, aiCard, winner: trickWinner, points, basePoints: points, bonusPoints: 0, bonusPointsReason: '' };
        }

        this.trickHistory.push(newHistoryEntry);
        this.lastTrick = newHistoryEntry;
        
        setTimeout(() => runInAction(() => {
            if (trickWinner === 'human') {
                this.humanScore += points;
                this.humanScorePile.push(humanCard, aiCard);
                this.message = this.T.youWonTrick(points);
                playSound('trick-win');
            } else {
                this.aiScore += points;
                this.aiScorePile.push(humanCard, aiCard);
                this.message = this.T.aiWonTrick(this.currentWaifu!.name, points);
                playSound('trick-lose');
            }

            this.cardsOnTable = [];
            this.trickCounter++;

            const currentModifier = this.dungeonRunState.modifiers[this.dungeonRunState.currentMatch - 1];
            if (currentModifier?.id === 'BRISCOLA_CHAOS' && this.trickCounter > 0 && this.trickCounter % 3 === 0 && this.deck.length > 0) {
                if (this.briscolaCard) {
                    this.deck.push(this.briscolaCard);
                }
                this.deck = shuffleDeck(this.deck);
                this.briscolaCard = this.deck.pop() ?? null;
                this.briscolaSuit = this.briscolaCard?.suit ?? this.briscolaSuit;
            }

            this.drawCards(trickWinner);

        }), 1500);
    }

    getCardPoints(card: Card): number {
        const modifier = this.dungeonRunState.modifiers[this.dungeonRunState.currentMatch - 1];
        if (modifier?.id === 'VALUE_INVERSION') {
            const invertedPoints: { [key: string]: number } = {
                'Asso': 0, '3': 0, 'Re': 0, 'Cavallo': 0, 'Fante': 0,
                '7': 2, '6': 3, '5': 4, '4': 10, '2': 11,
            };
            return invertedPoints[card.value];
        }
        return getCardPoints(card);
    }


    handleEndOfGame() {
        if (this.humanHand.length === 0 && this.aiHand.length === 0 && !this.isResolvingTrick) {
            let winner: 'human' | 'ai' | 'tie' = 'tie';
            if (this.humanScore > this.aiScore) winner = 'human';
            if (this.aiScore > this.humanScore) winner = 'ai';
            if (this.humanScore === 60 && this.aiScore === 60) winner = 'tie';
            if (this.humanScore === this.aiScore && this.humanScore > 60) winner = 'human';

            this.gameResult = winner;

            if (!this.dungeonRunState.isActive) {
                 super.handleEndOfGame();
                 return;
            }
            
            const didWinMatch = this.gameResult === 'human';

            if (didWinMatch) {
                this.dungeonRunState.wins++;
            }

            const rewards = {
                coins: didWinMatch ? 50 + (this.dungeonRunState.currentMatch * 25) : 10,
                shards: { R: 0, SR: 0, SSR: 0 }
            };
            if(didWinMatch) {
                if(this.dungeonRunState.keyRarity === 'R') rewards.shards.R = 1;
                if(this.dungeonRunState.keyRarity === 'SR') rewards.shards.SR = 1;
                if(this.dungeonRunState.keyRarity === 'SSR') rewards.shards.SSR = 1;
            }
            this.rootStore.gachaStore.lastDungeonMatchRewards = rewards;
            this.rootStore.gachaStore.addCoins(rewards.coins);
            if(rewards.shards.R > 0) this.rootStore.gachaStore.addShards('R', rewards.shards.R);
            if(rewards.shards.SR > 0) this.rootStore.gachaStore.addShards('SR', rewards.shards.SR);
            if(rewards.shards.SSR > 0) this.rootStore.gachaStore.addShards('SSR', rewards.shards.SSR);
            
            this.saveDungeonState();
            
            this.phase = 'gameOver';

            if (didWinMatch) {
                if (this.dungeonRunState.currentMatch < this.dungeonRunState.totalMatches) {
                    this.rootStore.uiStore.openModal('dungeonProgress');
                } else {
                    this.endDungeonRun(true);
                }
            }
            // In case of loss, we just set the phase to gameOver.
            // GameModals will pick this up and show the match loss screen.
        }
    }

    endDungeonRun(didWin: boolean) {
        const { keyRarity, wins, totalMatches } = this.dungeonRunState;
        if (!keyRarity) return;
        
        // FIX: Replaced Array.from with new Array().fill(0) to ensure the reduce method's result is correctly typed as a number.
        const coinsFromWins = new Array(wins).fill(0).reduce((acc: number, _, i) => acc + (50 + ((i+1) * 25)), 0);
        const coinsFromLosses = 10 * (totalMatches - wins);
        const allMatchCoins = coinsFromWins + coinsFromLosses;
        const allMatchShards = { R: 0, SR: 0, SSR: 0};
        if (keyRarity === 'R') allMatchShards.R = wins;
        if (keyRarity === 'SR') allMatchShards.SR = wins;
        if (keyRarity === 'SSR') allMatchShards.SSR = wins;
        
        let unlockedBg = null;

        if (didWin) {
            this.rootStore.gachaStore.spendKey(keyRarity);
            unlockedBg = this.rootStore.gachaStore.unlockRandomBackground(keyRarity);
            this.rootStore.missionStore.incrementProgress('dungeonRunsWon');
        }
        
        this.rootStore.gachaStore.lastDungeonRunRewards = {
            coins: allMatchCoins,
            shards: allMatchShards,
            unlockedBackground: unlockedBg,
        };

        this.rootStore.posthog?.capture('dungeon_run_completed', {
            rarity: keyRarity,
            wins,
            total_matches: totalMatches,
            did_win_run: didWin,
        });

        this.clearDungeonState();
        this.rootStore.uiStore.openModal('dungeonEnd');
    }
}