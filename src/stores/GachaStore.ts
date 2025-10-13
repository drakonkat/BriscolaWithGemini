/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, autorun, runInAction, reaction } from 'mobx';
import type { RootStore } from '.';
import { getImageUrl } from '../core/utils';
import { translations } from '../core/translations';
import { playSound } from '../core/soundManager';
import type { SoundName } from '../core/types';

type BackgroundItem = {
    url: string;
    rarity: 'R' | 'SR' | 'SSR';
};

const BACKGROUNDS: BackgroundItem[] = [
    { url: getImageUrl('/background/landscape1.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape2.png'), rarity: 'SR' },
    { url: getImageUrl('/background/landscape3.png'), rarity: 'R' },
    { url: getImageUrl('/background/background1.png'), rarity: 'SSR' },
    { url: getImageUrl('/background/background2.png'), rarity: 'SR' },
    { url: getImageUrl('/background/background3.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape4.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape5.png'), rarity: 'SR' },
    { url: getImageUrl('/background/landscape6.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape7.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape8.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape9.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape10.png'), rarity: 'SSR' },
    { url: getImageUrl('/background/landscape11.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape12.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape13.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape14.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape15.png'), rarity: 'SR' },
    { url: getImageUrl('/background/landscape16.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape17.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape18.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape19.png'), rarity: 'R' },
    { url: getImageUrl('/background/landscape20.png'), rarity: 'SSR' },
    { url: getImageUrl('/background/landscape21.png'), rarity: 'R' },
    { url: getImageUrl('/background/background4.png'), rarity: 'R' },
    { url: getImageUrl('/background/background5.png'), rarity: 'SR' },
    { url: getImageUrl('/background/background6.png'), rarity: 'R' },
    { url: getImageUrl('/background/background7.png'), rarity: 'R' },
    { url: getImageUrl('/background/background8.png'), rarity: 'R' },
    { url: getImageUrl('/background/background9.png'), rarity: 'R' },
    { url: getImageUrl('/background/background10.png'), rarity: 'SSR' },
    { url: getImageUrl('/background/background11.png'), rarity: 'R' },
    { url: getImageUrl('/background/background12.png'), rarity: 'R' },
    { url: getImageUrl('/background/background13.png'), rarity: 'R' },
    { url: getImageUrl('/background/background14.png'), rarity: 'R' },
    { url: getImageUrl('/background/background15.png'), rarity: 'SR' },
    { url: getImageUrl('/background/background16.png'), rarity: 'R' },
    { url: getImageUrl('/background/background17.png'), rarity: 'R' },
    { url: getImageUrl('/background/background18.png'), rarity: 'R' },
    { url: getImageUrl('/background/background19.png'), rarity: 'R' },
    { url: getImageUrl('/background/background20.png'), rarity: 'SSR' },
    { url: getImageUrl('/background/background21.png'), rarity: 'R' },
];

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error loading ${key} from localStorage`, error);
        return defaultValue;
    }
};

export class GachaStore {
    rootStore: RootStore;
    waifuCoins: number = loadFromLocalStorage('waifu_coins', 100);
    r_shards: number = loadFromLocalStorage('r_shards', 0);
    sr_shards: number = loadFromLocalStorage('sr_shards', 0);
    ssr_shards: number = loadFromLocalStorage('ssr_shards', 0);
    fire_essences: number = loadFromLocalStorage('fire_essences', 0);
    water_essences: number = loadFromLocalStorage('water_essences', 0);
    air_essences: number = loadFromLocalStorage('air_essences', 0);
    earth_essences: number = loadFromLocalStorage('earth_essences', 0);
    r_keys: number = loadFromLocalStorage('r_keys', 0);
    sr_keys: number = loadFromLocalStorage('sr_keys', 0);
    ssr_keys: number = loadFromLocalStorage('ssr_keys', 0);
    unlockedBackgrounds: string[] = loadFromLocalStorage('unlocked_backgrounds', []);
    hasRolledGacha: boolean = loadFromLocalStorage('has_rolled_gacha', false);
    fullscreenImage: string = '';
    isRolling = false;
    gachaAnimationState: { active: boolean; rarity: 'R' | 'SR' | 'SSR' | null } = { active: false, rarity: null };
    isCraftingMinigameOpen = false;
    craftingAttempt: { rarity: 'R' | 'SR' | 'SSR' } | null = null;
    
    lastDungeonRunRewards = { coins: 0, shards: { R: 0, SR: 0, SSR: 0 }, unlockedBackground: null as BackgroundItem | null };
    lastDungeonMatchRewards = { coins: 0, shards: { R: 0, SR: 0, SSR: 0 } };

    lastGachaResult: BackgroundItem | null = null;
    multiGachaResults: BackgroundItem[] = [];
    lastMultiGachaShards: { R: number; SR: number; SSR: number; } = { R: 0, SR: 0, SSR: 0 };

    readonly BACKGROUNDS = BACKGROUNDS;

    constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;

        autorun(() => localStorage.setItem('waifu_coins', JSON.stringify(this.waifuCoins)));
        autorun(() => localStorage.setItem('r_shards', JSON.stringify(this.r_shards)));
        autorun(() => localStorage.setItem('sr_shards', JSON.stringify(this.sr_shards)));
        autorun(() => localStorage.setItem('ssr_shards', JSON.stringify(this.ssr_shards)));
        autorun(() => localStorage.setItem('fire_essences', JSON.stringify(this.fire_essences)));
        autorun(() => localStorage.setItem('water_essences', JSON.stringify(this.water_essences)));
        autorun(() => localStorage.setItem('air_essences', JSON.stringify(this.air_essences)));
        autorun(() => localStorage.setItem('earth_essences', JSON.stringify(this.earth_essences)));
        autorun(() => localStorage.setItem('r_keys', JSON.stringify(this.r_keys)));
        autorun(() => localStorage.setItem('sr_keys', JSON.stringify(this.sr_keys)));
        autorun(() => localStorage.setItem('ssr_keys', JSON.stringify(this.ssr_keys)));
        autorun(() => localStorage.setItem('unlocked_backgrounds', JSON.stringify(this.unlockedBackgrounds)));
        autorun(() => localStorage.setItem('has_rolled_gacha', JSON.stringify(this.hasRolledGacha)));
        
        reaction(
            () => this.unlockedBackgrounds.length,
            () => {
                const ssrBgs = this.BACKGROUNDS.filter(bg => bg.rarity === 'SSR');
                const unlockedSsrCount = ssrBgs.filter(bg => this.unlockedBackgrounds.includes(bg.url)).length;
                this.rootStore.missionStore.setProgress('ssrCollected', unlockedSsrCount);
            }
        );
    }
    
    get T() {
        return translations[this.rootStore.gameSettingsStore.language];
    }

    addCoins = (amount: number) => {
        this.waifuCoins += amount;
    }
    
    addShards = (rarity: 'R' | 'SR' | 'SSR', amount: number) => {
        if (rarity === 'R') this.r_shards += amount;
        if (rarity === 'SR') this.sr_shards += amount;
        if (rarity === 'SSR') this.ssr_shards += amount;
    }

    addEssences = (type: 'fire' | 'water' | 'air' | 'earth', amount: number) => {
        if (type === 'fire') this.fire_essences += amount;
        if (type === 'water') this.water_essences += amount;
        if (type === 'air') this.air_essences += amount;
        if (type === 'earth') this.earth_essences += amount;
    }

    get totalEssences() {
        return this.fire_essences + this.water_essences + this.air_essences + this.earth_essences;
    }

    addKey = (rarity: 'R' | 'SR' | 'SSR') => {
        if (rarity === 'R') this.r_keys++;
        if (rarity === 'SR') this.sr_keys++;
        if (rarity === 'SSR') this.ssr_keys++;
    }

    spendKey = (rarity: 'R' | 'SR' | 'SSR') => {
        if (rarity === 'R' && this.r_keys > 0) this.r_keys--;
        if (rarity === 'SR' && this.sr_keys > 0) this.sr_keys--;
        if (rarity === 'SSR' && this.ssr_keys > 0) this.ssr_keys--;
    }

    unlockSpecificBackground = (bg: BackgroundItem) => {
        if (!this.unlockedBackgrounds.includes(bg.url)) {
            this.unlockedBackgrounds.push(bg.url);
        }
    }
    // FIX: Added missing convertShards method.
    convertShards = (from: 'R' | 'SR', to: 'SR' | 'SSR') => {
        const T_gallery = this.T.gallery;
        let cost = 0;
        const gain = 1;

        if (from === 'R' && to === 'SR') {
            cost = 25;
            if (this.r_shards < cost) {
                this.rootStore.uiStore.showSnackbar(T_gallery.gachaNotEnoughShards, 'warning');
                return;
            }
            this.r_shards -= cost;
            this.sr_shards += gain;
            this.rootStore.uiStore.showSnackbar(T_gallery.conversionSuccess(gain, 'SR'), 'success');
        } else if (from === 'R' && to === 'SSR') {
            cost = 50;
            if (this.r_shards < cost) {
                this.rootStore.uiStore.showSnackbar(T_gallery.gachaNotEnoughShards, 'warning');
                return;
            }
            this.r_shards -= cost;
            this.ssr_shards += gain;
            this.rootStore.uiStore.showSnackbar(T_gallery.conversionSuccess(gain, 'SSR'), 'success');
        } else if (from === 'SR' && to === 'SSR') {
            cost = 15;
            if (this.sr_shards < cost) {
                this.rootStore.uiStore.showSnackbar(T_gallery.gachaNotEnoughShards, 'warning');
                return;
            }
            this.sr_shards -= cost;
            this.ssr_shards += gain;
            this.rootStore.uiStore.showSnackbar(T_gallery.conversionSuccess(gain, 'SSR'), 'success');
        }
        playSound('essence-gain');
    }

    handleGachaRoll = async () => {
        const GACHA_COST = 100;
        const isFirstRoll = !this.hasRolledGacha;

        if (this.isRolling) return;
        if (!isFirstRoll && this.waifuCoins < GACHA_COST) {
            this.rootStore.uiStore.showSnackbar(this.T.gallery.gachaNotEnoughCoins, 'warning');
            return;
        }

        const areThereAnyLockedItems = this.BACKGROUNDS.length > this.unlockedBackgrounds.length;
        if (!areThereAnyLockedItems) {
            this.rootStore.uiStore.showSnackbar(this.T.gallery.gachaAllUnlocked, 'success');
            return;
        }

        this.isRolling = true;
        if (!isFirstRoll) {
            this.addCoins(-GACHA_COST);
        }

        this.rootStore.missionStore.incrementProgress('gachaRolls', 1);

        playSound('gacha-roll');
        await new Promise(resolve => setTimeout(resolve, 1500));

        const rand = Math.random();
        let rarityToPull: 'R' | 'SR' | 'SSR' = rand < 0.05 ? 'SSR' : rand < 0.20 ? 'SR' : 'R';
        
        let availableToPull = this.BACKGROUNDS.filter(item => item.rarity === rarityToPull);
        if (availableToPull.length === 0) {
            rarityToPull = rarityToPull === 'SSR' ? 'SR' : 'R';
            availableToPull = this.BACKGROUNDS.filter(item => item.rarity === rarityToPull);
        }
        if (availableToPull.length === 0) {
            rarityToPull = 'R';
            availableToPull = this.BACKGROUNDS.filter(item => item.rarity === 'R');
        }
        if (availableToPull.length === 0) { // Should be impossible if there are any locked items
             this.isRolling = false;
             return;
        }

        const pulledItem = availableToPull[Math.floor(Math.random() * availableToPull.length)];
        const isDuplicate = this.unlockedBackgrounds.includes(pulledItem.url);

        if(isDuplicate) {
            this.addShards(pulledItem.rarity, 1);
            playSound('gacha-refund');
            this.rootStore.uiStore.showSnackbar(this.T.gallery.gachaDuplicate(pulledItem.rarity), 'success');
            this.isRolling = false; // end rolling early
            this.rootStore.posthog?.capture('gacha_duplicate', { 
                rarity: pulledItem.rarity,
            });
        } else {
            // New unlock logic
            this.lastGachaResult = pulledItem;
            playSound(`gacha-unlock-${pulledItem.rarity.toLowerCase() as 'r' | 'sr' | 'ssr'}`);
            this.gachaAnimationState = { active: true, rarity: pulledItem.rarity };

            setTimeout(() => {
                runInAction(() => {
                    this.unlockedBackgrounds.push(pulledItem.url);
                    this.rootStore.uiStore.openModal('gachaSingleUnlock');
                });
            }, 1000);

            this.rootStore.posthog?.capture('gacha_success', { 
                rarity: pulledItem.rarity,
                is_first_roll: isFirstRoll,
            });
        }
        
        if (isFirstRoll) {
            this.hasRolledGacha = true;
        }
    }

    handleMultiGachaRoll = async () => {
        const GACHA_COST_X10 = 900;

        if (this.isRolling) return;
        if (this.waifuCoins < GACHA_COST_X10) {
            this.rootStore.uiStore.showSnackbar(this.T.gallery.gachaNotEnoughCoins, 'warning');
            return;
        }
        
        const areThereAnyLockedItems = this.BACKGROUNDS.length > this.unlockedBackgrounds.length;
        if (!areThereAnyLockedItems) {
            this.rootStore.uiStore.showSnackbar(this.T.gallery.gachaAllUnlocked, 'success');
            return;
        }

        this.isRolling = true;
        this.addCoins(-GACHA_COST_X10);
        this.multiGachaResults = [];
        this.lastMultiGachaShards = { R: 0, SR: 0, SSR: 0 };

        this.rootStore.missionStore.incrementProgress('gachaRolls', 10);

        playSound('gacha-roll');
        await new Promise(resolve => setTimeout(resolve, 1500));

        let newUnlocks: BackgroundItem[] = [];
        let totalShards: { R: number, SR: number, SSR: number } = { R: 0, SR: 0, SSR: 0 };

        for (let i = 0; i < 10; i++) {
            const rand = Math.random();
            let rarityToPull: 'R' | 'SR' | 'SSR' = rand < 0.05 ? 'SSR' : rand < 0.20 ? 'SR' : 'R';
            
            let pool = this.BACKGROUNDS.filter(item => item.rarity === rarityToPull);
            if (pool.length === 0) {
                pool = this.BACKGROUNDS.filter(item => item.rarity === (rarityToPull === 'SSR' ? 'SR' : 'R')) 
                    || this.BACKGROUNDS.filter(item => item.rarity !== rarityToPull);
            }
            if (pool.length === 0) pool = this.BACKGROUNDS;
            if (pool.length === 0) continue;

            const pulledItem = pool[Math.floor(Math.random() * pool.length)];
            const isDuplicate = this.unlockedBackgrounds.includes(pulledItem.url) || newUnlocks.some(u => u.url === pulledItem.url);

            if (isDuplicate) {
                totalShards[pulledItem.rarity]++;
            } else {
                newUnlocks.push(pulledItem);
            }
        }
        
        playSound('gacha-multi-unlock');
        
        runInAction(() => {
            if (newUnlocks.length > 0) {
                this.multiGachaResults = newUnlocks;
                this.unlockedBackgrounds.push(...newUnlocks.map(u => u.url));
            }
            if (totalShards.R > 0) this.addShards('R', totalShards.R);
            if (totalShards.SR > 0) this.addShards('SR', totalShards.SR);
            if (totalShards.SSR > 0) this.addShards('SSR', totalShards.SSR);
            this.lastMultiGachaShards = totalShards;
            
            this.rootStore.uiStore.openModal('gachaMultiUnlock');
            this.isRolling = false;
        });

        this.rootStore.posthog?.capture('gacha_multi_roll_completed', { 
            unlocks_count: newUnlocks.length,
            shards_r: totalShards.R,
            shards_sr: totalShards.SR,
            shards_ssr: totalShards.SSR,
        });

        if (!this.hasRolledGacha) {
            this.hasRolledGacha = true;
        }
    }

    endGachaAnimation = () => {
        this.gachaAnimationState = { active: false, rarity: null };
        this.isRolling = false;
    }

    openFullscreenImage = (url: string) => {
        this.fullscreenImage = url;
    }

    closeFullscreenImage = () => {
        this.fullscreenImage = '';
    }
    
    craftKey = (rarity: 'R' | 'SR' | 'SSR') => {
        const costs = { 
            R: { r_shards: 10 },
            SR: { sr_shards: 10, r_shards: 25, essences: 5 },
            SSR: { ssr_shards: 5, sr_shards: 15, essences: 10 }
        };

        const cost = costs[rarity];

        if (('r_shards' in cost && this.r_shards < cost.r_shards) ||
            ('sr_shards' in cost && this.sr_shards < cost.sr_shards) ||
            ('ssr_shards' in cost && this.ssr_shards < cost.ssr_shards) ||
            ('essences' in cost && this.totalEssences < cost.essences)) {
            this.rootStore.uiStore.showSnackbar(this.T.gallery.gachaNotEnoughShards, 'warning');
            return;
        }

        this.craftingAttempt = { rarity };
        this.rootStore.uiStore.openModal('craftingMinigame');
    }

    cancelCraftingAttempt = () => {
        this.rootStore.uiStore.closeModal('craftingMinigame');
        this.craftingAttempt = null;
    }

    resolveCraftingAttempt = (result: 'critical' | 'success' | 'failure') => {
        if (!this.craftingAttempt) return;
        
        const { rarity } = this.craftingAttempt;
        
        if (result === 'failure') {
            const shardsLost = Math.floor(Math.random() * 3) + 1;
            this.addShards(rarity, -shardsLost);
            playSound('shard-shatter');
            this.rootStore.uiStore.showSnackbar(this.T.craftingMinigame.shardsLost(shardsLost), 'warning');
            this.rootStore.posthog?.capture('key_crafted', { rarity, result: 'failure', shards_lost: shardsLost });
            
        } else { // success or critical
            const costs = {
                R: { r_shards: 10 },
                SR: { sr_shards: 10, r_shards: 25, essences: 5 },
                SSR: { ssr_shards: 5, sr_shards: 15, essences: 10 }
            };
            const cost = costs[rarity];

            // Deduct materials
            if ('r_shards' in cost) this.r_shards -= cost.r_shards;
            if ('sr_shards' in cost) this.sr_shards -= cost.sr_shards;
            if ('ssr_shards' in cost) this.ssr_shards -= cost.ssr_shards;
            if ('essences' in cost) {
                let essencesToSpend = cost.essences;
                // Simple logic to deduct from available essences
                const essenceTypes: ('fire_essences' | 'water_essences' | 'air_essences' | 'earth_essences')[] = ['fire_essences', 'water_essences', 'air_essences', 'earth_essences'];
                for (const type of essenceTypes) {
                    const amountToTake = Math.min(this[type], essencesToSpend);
                    this[type] -= amountToTake;
                    essencesToSpend -= amountToTake;
                    if (essencesToSpend === 0) break;
                }
            }
            
            this.addKey(rarity);
            this.rootStore.missionStore.incrementProgress('keysCrafted', 1);

            if (result === 'critical') {
                // Refund half of the shards
                if ('r_shards' in cost) this.r_shards += Math.floor(cost.r_shards / 2);
                if ('sr_shards' in cost) this.sr_shards += Math.floor(cost.sr_shards / 2);
                if ('ssr_shards' in cost) this.ssr_shards += Math.floor(cost.ssr_shards / 2);
                playSound('craft-critical');
                this.rootStore.uiStore.showSnackbar(this.T.craftingMinigame.criticalSuccess, 'success');
            } else {
                playSound(`gacha-unlock-${rarity.toLowerCase() as 'r'|'sr'|'ssr'}`);
                this.rootStore.uiStore.showSnackbar(this.T.gallery.craftKeySuccess(rarity), 'success');
            }
            this.rootStore.posthog?.capture('key_crafted', { rarity, result });
        }
    }
}