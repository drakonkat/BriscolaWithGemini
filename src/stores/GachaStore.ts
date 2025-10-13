/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, autorun, runInAction } from 'mobx';
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
    waifuCoins: number = loadFromLocalStorage('waifu_coins', 10000);
    r_shards: number = loadFromLocalStorage('r_shards', 100);
    sr_shards: number = loadFromLocalStorage('sr_shards', 100);
    ssr_shards: number = loadFromLocalStorage('ssr_shards', 100);
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
        autorun(() => localStorage.setItem('r_keys', JSON.stringify(this.r_keys)));
        autorun(() => localStorage.setItem('sr_keys', JSON.stringify(this.sr_keys)));
        autorun(() => localStorage.setItem('ssr_keys', JSON.stringify(this.ssr_keys)));
        autorun(() => localStorage.setItem('unlocked_backgrounds', JSON.stringify(this.unlockedBackgrounds)));
        autorun(() => localStorage.setItem('has_rolled_gacha', JSON.stringify(this.hasRolledGacha)));
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

    unlockRandomBackground = (rarity: 'R' | 'SR' | 'SSR') => {
        const lockedOfRarity = this.BACKGROUNDS.filter(bg => bg.rarity === rarity && !this.unlockedBackgrounds.includes(bg.url));
    
        if (lockedOfRarity.length > 0) {
            const toUnlock = lockedOfRarity[Math.floor(Math.random() * lockedOfRarity.length)];
            
            this.lastGachaResult = toUnlock;
            playSound(`gacha-unlock-${rarity.toLowerCase() as 'r'|'sr'|'ssr'}`);
            
            this.gachaAnimationState = { active: true, rarity: rarity };
            setTimeout(() => {
                runInAction(() => {
                    // Unlock after animation starts for better perceived performance
                    this.unlockedBackgrounds.push(toUnlock.url);
                    this.rootStore.uiStore.openModal('gachaSingleUnlock');
                });
            }, 1000);
        } else {
            // Refund the key as there's nothing to win
            this.addKey(rarity); 
            this.rootStore.uiStore.showSnackbar(this.T.gallery.gachaNoLockedToCraft(rarity), 'warning');
        }
    }

    convertShards = (from: 'R' | 'SR', to: 'SR' | 'SSR') => {
        const conversions = {
            'R_to_SR': { fromCost: 25, toAmount: 1, toRarity: 'SR' as 'SR' | 'SSR' },
            'R_to_SSR': { fromCost: 50, toAmount: 1, toRarity: 'SSR' as 'SR' | 'SSR' },
            'SR_to_SSR': { fromCost: 15, toAmount: 1, toRarity: 'SSR' as 'SR' | 'SSR' },
        };
        
        const key = `${from}_to_${to}` as keyof typeof conversions;
        const config = conversions[key];
        
        if (!config) return;

        const currentShards = { R: this.r_shards, SR: this.sr_shards };

        if (currentShards[from] < config.fromCost) {
            this.rootStore.uiStore.showSnackbar(this.T.gallery.gachaNotEnoughShards, 'warning');
            return;
        }

        // Subtract from and add to
        if (from === 'R') this.r_shards -= config.fromCost;
        if (from === 'SR') this.sr_shards -= config.fromCost;
        
        if (to === 'SR') this.sr_shards += config.toAmount;
        if (to === 'SSR') this.ssr_shards += config.toAmount;

        playSound('gacha-refund'); // Re-use a fitting sound
        this.rootStore.uiStore.showSnackbar(this.T.gallery.conversionSuccess(config.toAmount, to), 'success');
        
        this.rootStore.posthog?.capture('shards_converted', { from, to, amount: 1 });
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

        playSound('gacha-roll');
        await new Promise(resolve => setTimeout(resolve, 1500));

        const rand = Math.random();
        let rarityToPull: 'R' | 'SR' | 'SSR' = rand < 0.05 ? 'SSR' : rand < 0.20 ? 'SR' : 'R';
        
        // Pity System: if all items of a rarity are unlocked, try to pull from a lower rarity
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
        const costs = { R: 10, SR: 10, SSR: 5 };
        const currentShards = { R: this.r_shards, SR: this.sr_shards, SSR: this.ssr_shards };
        const cost = costs[rarity];
        
        if (currentShards[rarity] < cost) {
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

    resolveCraftingAttempt = (success: boolean) => {
        if (!this.craftingAttempt) return;
        const { rarity } = this.craftingAttempt;
        const cost = { R: 10, SR: 10, SSR: 5 }[rarity];

        if (success) {
            this.addShards(rarity, -cost);
            this.addKey(rarity);

            playSound(`gacha-unlock-${rarity.toLowerCase() as 'r'|'sr'|'ssr'}`);
            this.rootStore.uiStore.showSnackbar(this.T.gallery.craftKeySuccess(rarity), 'success');
            this.rootStore.posthog?.capture('key_crafted', { rarity, result: 'success' });
        } else {
            const shardsLost = Math.floor(Math.random() * 5) + 1;
            const currentShardCount = {R: this.r_shards, SR: this.sr_shards, SSR: this.ssr_shards}[rarity];
            const actualShardsLost = Math.min(shardsLost, currentShardCount);
            
            if (actualShardsLost > 0) {
                this.addShards(rarity, -actualShardsLost);
                playSound('shard-shatter');
                this.rootStore.uiStore.showSnackbar(this.T.craftingMinigame.shardsLost(actualShardsLost), 'warning');
            } else {
                playSound('trick-lose');
                this.rootStore.uiStore.showSnackbar(this.T.craftingMinigame.failure, 'warning');
            }
            
            this.rootStore.posthog?.capture('key_crafted', { rarity, result: 'failure', shards_lost: actualShardsLost });
        }
    }
}