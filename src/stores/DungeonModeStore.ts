/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, runInAction } from 'mobx';
import { ClassicModeStore } from './ClassicModeStore';
import type { RootStore } from '.';
import type { DungeonRunState, Waifu, DungeonModifier } from '../core/types';
import { WAIFUS, BOSS_WAIFU } from '../core/waifus';
import { shuffleDeck } from '../core/utils';
import { DUNGEON_MODIFIERS } from '../core/dungeonModifiers';
import { playSound } from '../core/soundManager';

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

    constructor(rootStore: RootStore) {
        super(rootStore);
        makeAutoObservable(this, { rootStore: false });
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
        this.startNextDungeonMatch();
    }

    startNextDungeonMatch = () => {
        this.rootStore.uiStore.closeModal('dungeonProgress');
        if (!this.dungeonRunState.isActive) return;

        runInAction(() => {
            this.dungeonRunState.currentMatch++;
            this.saveDungeonState();
            const waifuName = this.dungeonRunState.waifuOpponents[this.dungeonRunState.currentMatch - 1];
            const opponent = WAIFUS.find(w => w.name === waifuName) ?? BOSS_WAIFU;
            this._initializeNewGame(opponent);
            playSound('game-start');
        });
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
            } else {
                this.endDungeonRun(false);
            }
        }
    }

    endDungeonRun(didWin: boolean) {
        const { keyRarity, wins, totalMatches } = this.dungeonRunState;
        if (!keyRarity) return;
        
        // FIX: Explicitly type the accumulator `acc` as a number to prevent TypeScript from inferring it as `unknown`.
        const coinsFromWins = Array.from({length: wins}).reduce((acc: number, _, i) => acc + (50 + ((i+1) * 25)), 0);
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