/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, autorun } from 'mobx';
import type { RootStore } from '.';
import { getImageUrl } from '../core/utils';
import { translations } from '../core/translations';

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
    waifuCoins: number = loadFromLocalStorage('waifu_coins', 0);
    unlockedBackgrounds: string[] = loadFromLocalStorage('unlocked_backgrounds', []);
    hasRolledGacha: boolean = loadFromLocalStorage('has_rolled_gacha', false);
    fullscreenImage: string = '';

    readonly BACKGROUNDS = BACKGROUNDS;

    constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;

        autorun(() => localStorage.setItem('waifu_coins', JSON.stringify(this.waifuCoins)));
        autorun(() => localStorage.setItem('unlocked_backgrounds', JSON.stringify(this.unlockedBackgrounds)));
        autorun(() => localStorage.setItem('has_rolled_gacha', JSON.stringify(this.hasRolledGacha)));
    }
    
    get T() {
        return translations[this.rootStore.gameSettingsStore.language];
    }

    addCoins = (amount: number) => {
        this.waifuCoins += amount;
    }

    handleGachaRoll = () => {
        const GACHA_COST = 100;
        const isFirstRoll = !this.hasRolledGacha;

        if (!isFirstRoll && this.waifuCoins < GACHA_COST) {
            this.rootStore.uiStore.showSnackbar(this.T.gallery.gachaNotEnoughCoins, 'warning');
            return;
        }

        const locked = this.BACKGROUNDS.filter(bg => !this.unlockedBackgrounds.includes(bg.url));
        if (locked.length === 0) {
            this.rootStore.uiStore.showSnackbar(this.T.gallery.gachaAllUnlocked, 'success');
            return;
        }

        if (!isFirstRoll) {
            this.addCoins(-GACHA_COST);
        }

        if (isFirstRoll || Math.random() < 0.50) {
            const rand = Math.random();
            let rarityToPull: 'R' | 'SR' | 'SSR' = rand < 0.05 ? 'SSR' : rand < 0.20 ? 'SR' : 'R';
            let pool = locked.filter(item => item.rarity === rarityToPull);
            
            if (pool.length === 0) { // Pity system
                pool = locked.filter(item => item.rarity === (rarityToPull === 'SSR' ? 'SR' : 'R')) 
                    || locked.filter(item => item.rarity !== rarityToPull);
            }
            if (pool.length === 0) pool = locked;

            const toUnlock = pool[Math.floor(Math.random() * pool.length)];
            this.unlockedBackgrounds.push(toUnlock.url);
            this.rootStore.uiStore.showSnackbar(this.T.gallery.gachaSuccess(toUnlock.rarity), 'success');
            this.rootStore.posthog?.capture('gacha_success', { 
                rarity: toUnlock.rarity,
                is_first_roll: isFirstRoll,
            });
        } else {
            this.rootStore.uiStore.showSnackbar(this.T.gallery.gachaFailure, 'success');
            this.rootStore.posthog?.capture('gacha_failure', { reason: '50_percent_roll_failed' });
        }
        
        if (isFirstRoll) {
            this.hasRolledGacha = true;
        }
    }

    openFullscreenImage = (url: string) => {
        this.fullscreenImage = url;
    }

    closeFullscreenImage = () => {
        this.fullscreenImage = '';
    }
}
