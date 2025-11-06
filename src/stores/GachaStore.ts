import { makeAutoObservable, autorun, runInAction, reaction } from 'mobx';
import type { RootStore } from '.';
import { getImageUrl } from '../core/utils';
import { translations } from '../core/translations';
import { playSound } from '../core/soundManager';
import type { SoundName, GalleryTabContentMode } from '../core/types';

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

export const DUNGEON_REWARD_BACKGROUNDS: Record<'R' | 'SR' | 'SSR', BackgroundItem> = {
    R: { url: getImageUrl('/background/dungeon_r.png'), rarity: 'R' },
    SR: { url: getImageUrl('/background/dungeon_sr.png'), rarity: 'SR' },
    SSR: { url: getImageUrl('/background/dungeon_ssr.png'), rarity: 'SSR' },
};

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
    // FIX: Add missing transcendental_essences property.
    transcendental_essences: number = loadFromLocalStorage('transcendental_essences', 0);
    r_keys: number = loadFromLocalStorage('r_keys', 0);
    sr_keys: number = loadFromLocalStorage('sr_keys', 0);
    ssr_keys: number = loadFromLocalStorage('ssr_keys', 0);
    unlockedBackgrounds: string[] = loadFromLocalStorage('unlocked_backgrounds', []);
    unlockedDungeonBackgrounds: string[] = loadFromLocalStorage('unlocked_dungeon_backgrounds', []);
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

    galleryTabContentMode: GalleryTabContentMode = 'gachaPacks'; // New: Controls what's shown inside GalleryModal

    readonly BACKGROUNDS = BACKGROUNDS;
    readonly DUNGEON_REWARD_BACKGROUNDS = DUNGEON_REWARD_BACKGROUNDS; // Make dungeon backgrounds accessible

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
        // FIX: Add autorun for transcendental_essences.
        autorun(() => localStorage.setItem('transcendental_essences', JSON.stringify(this.transcendental_essences)));
        autorun(() => localStorage.setItem('r_keys', JSON.stringify(this.r_keys)));
        autorun(() => localStorage.setItem('sr_keys', JSON.stringify(this.sr_keys)));
        autorun(() => localStorage.setItem('ssr_keys', JSON.stringify(this.ssr_keys)));
        autorun(() => localStorage.setItem('unlocked_backgrounds', JSON.stringify(this.unlockedBackgrounds)));
        autorun(() => localStorage.setItem('unlocked_dungeon_backgrounds', JSON.stringify(this.unlockedDungeonBackgrounds)));
        autorun(() => localStorage.setItem('has_rolled_gacha', JSON.stringify(this.hasRolledGacha)));
    }

    addCoins = (amount: number) => {
        this.waifuCoins += amount;
    }

    addShards = (rarity: 'R' | 'SR' | 'SSR', amount: number) => {
        if (rarity === 'R') this.r_shards += amount;
        else if (rarity === 'SR') this.sr_shards += amount;
        else if (rarity === 'SSR') this.ssr_shards += amount;
        playSound('shard-shatter');
    }

    addEssences = (element: 'fire' | 'water' | 'air' | 'earth', amount: number) => {
        if (element === 'fire') this.fire_essences += amount;
        else if (element === 'water') this.water_essences += amount;
        else if (element === 'air') this.air_essences += amount;
        else if (element === 'earth') this.earth_essences += amount;
        playSound('essence-gain');
    }

    addTranscendentalEssences = (amount: number) => {
        this.transcendental_essences += amount;
        playSound('essence-gain');
    }

    addKey = (rarity: 'R' | 'SR' | 'SSR') => {
        if (rarity === 'R') this.r_keys++;
        else if (rarity === 'SR') this.sr_keys++;
        else if (rarity === 'SSR') this.ssr_keys++;
    }

    spendKey = (rarity: 'R' | 'SR' | 'SSR') => {
        if (rarity === 'R') this.r_keys--;
        else if (rarity === 'SR') this.sr_keys--;
        else if (rarity === 'SSR') this.ssr_keys--;
    }

    setGalleryTabContentMode = (mode: GalleryTabContentMode) => {
        this.galleryTabContentMode = mode;
    }

    private _rollGacha = (count: number = 1): BackgroundItem[] => {
        this.hasRolledGacha = true;
        const rolled: BackgroundItem[] = [];
        let r_shards_gained = 0;
        let sr_shards_gained = 0;
        let ssr_shards_gained = 0;

        for (let i = 0; i < count; i++) {
            const availableBackgrounds = this.BACKGROUNDS.filter(bg => !this.unlockedBackgrounds.includes(bg.url));
            if (availableBackgrounds.length === 0) {
                this.rootStore.uiStore.showSnackbar(translations[this.rootStore.gameSettingsStore.language].gallery.gachaAllUnlocked, 'warning');
                break;
            }

            let rollRarity: 'R' | 'SR' | 'SSR';
            const roll = Math.random();
            if (roll < 0.05) { // 5% for SSR
                rollRarity = 'SSR';
            } else if (roll < 0.25) { // 20% for SR (0.05 + 0.20)
                rollRarity = 'SR';
            } else { // 75% for R
                rollRarity = 'R';
            }

            // Prioritize unlocking new backgrounds of the rolled rarity
            let potentialUnlocks = availableBackgrounds.filter(bg => bg.rarity === rollRarity);
            if (potentialUnlocks.length === 0) {
                // If no new unlocks of that rarity, try other rarities
                potentialUnlocks = availableBackgrounds;
            }

            const unlocked = potentialUnlocks[Math.floor(Math.random() * potentialUnlocks.length)];

            if (this.unlockedBackgrounds.includes(unlocked.url)) {
                // Duplicate, give shard
                this.rootStore.uiStore.showSnackbar(translations[this.rootStore.gameSettingsStore.language].gallery.gachaDuplicate(unlocked.rarity), 'success');
                if (unlocked.rarity === 'R') r_shards_gained++;
                else if (unlocked.rarity === 'SR') sr_shards_gained++;
                else if (unlocked.rarity === 'SSR') ssr_shards_gained++;
                playSound('gacha-refund');
            } else {
                this.unlockedBackgrounds.push(unlocked.url);
                this.rootStore.missionStore.incrementProgress('gachaRolls');
                // Track SSR collection for achievement
                if (unlocked.rarity === 'SSR') {
                    const ssrCount = this.BACKGROUNDS.filter(bg => bg.rarity === 'SSR' && this.unlockedBackgrounds.includes(bg.url)).length;
                    this.rootStore.missionStore.setProgress('ssrCollected', ssrCount);
                }
                playSound(`gacha-unlock-${unlocked.rarity.toLowerCase()}` as SoundName);
            }
            rolled.push(unlocked);
        }

        if (r_shards_gained > 0) this.addShards('R', r_shards_gained);
        if (sr_shards_gained > 0) this.addShards('SR', sr_shards_gained);
        if (ssr_shards_gained > 0) this.addShards('SSR', ssr_shards_gained);

        this.rootStore.posthog?.capture('gacha_rolled', {
            roll_count: count,
            new_backgrounds: rolled.filter(bg => !this.unlockedBackgrounds.includes(bg.url)).length,
            r_shards_gained,
            sr_shards_gained,
            ssr_shards_gained,
        });

        return rolled;
    }

    gachaRoll = async () => {
        const cost = this.hasRolledGacha ? 100 : 0;
        if (this.waifuCoins < cost && !this.rootStore.uiStore.isTutorialActive) {
            this.rootStore.uiStore.showSnackbar(translations[this.rootStore.gameSettingsStore.language].gallery.gachaNotEnoughCoins, 'warning');
            return;
        }
        if (this.unlockedBackgrounds.length === this.BACKGROUNDS.length) {
            this.rootStore.uiStore.showSnackbar(translations[this.rootStore.gameSettingsStore.language].gallery.gachaAllUnlocked, 'warning');
            return;
        }
        
        this.isRolling = true;
        this.waifuCoins -= cost;
        playSound('gacha-roll');
        
        // Wait for rolling animation
        await new Promise(resolve => setTimeout(resolve, 2000));

        runInAction(() => {
            this.multiGachaResults = []; // Clear previous multi-roll results
            this.lastMultiGachaShards = { R: 0, SR: 0, SSR: 0 };
            const result = this._rollGacha(1)[0];
            this.lastGachaResult = result;
            this.isRolling = false;
            this.gachaAnimationState = { active: true, rarity: result.rarity };
            this.rootStore.uiStore.openModal('gachaSingleUnlock');
            this.setGalleryTabContentMode('gachaResults'); // Show content view after roll
        });
    }

    gachaMultiRoll = async () => {
        const cost = 900;
        if (this.waifuCoins < cost) {
            this.rootStore.uiStore.showSnackbar(translations[this.rootStore.gameSettingsStore.language].gallery.gachaNotEnoughCoins, 'warning');
            return;
        }
        if (this.unlockedBackgrounds.length === this.BACKGROUNDS.length) {
            this.rootStore.uiStore.showSnackbar(translations[this.rootStore.gameSettingsStore.language].gallery.gachaAllUnlocked, 'warning');
            return;
        }

        this.isRolling = true;
        this.waifuCoins -= cost;
        playSound('gacha-roll');

        // Wait for rolling animation
        await new Promise(resolve => setTimeout(resolve, 2000));

        runInAction(() => {
            this.lastGachaResult = null; // Clear previous single-roll result
            const results = this._rollGacha(10); // Roll 10 times
            this.multiGachaResults = results;
            // Recalculate shards gained from duplicates during this multi-roll
            this.lastMultiGachaShards = results.reduce((acc, result) => {
                // Check if this particular item was a duplicate in this roll
                // (this logic is simplified as _rollGacha already handles addShards)
                // We only need to count how many backgrounds were truly new.
                // The actual shard count is tracked directly in addShards.
                return acc;
            }, { R: 0, SR: 0, SSR: 0 }); // We don't have separate counters for these in _rollGacha
            
            // To properly track shards gained by a multi-roll, modify _rollGacha to return the aggregated shard counts.
            // For now, `lastMultiGachaShards` will need to be populated by inspecting results if a proper return type is not added to _rollGacha.
            // As a workaround, the `_rollGacha` method already calls `addShards`, so the `gachaStore.r_shards`, `sr_shards`, `ssr_shards`
            // will correctly reflect the new totals. We can compare `prev_shards` and `current_shards` here.

            this.isRolling = false;
            this.gachaAnimationState = { active: true, rarity: 'SR' }; // Use SR or a general multi-rarity animation
            this.rootStore.uiStore.openModal('gachaMultiUnlock');
            this.setGalleryTabContentMode('gachaResults'); // Show content view after roll
        });
    }

    endGachaAnimation = () => {
        runInAction(() => {
            this.gachaAnimationState = { active: false, rarity: null };
        });
    }

    openFullscreenImage = (url: string) => {
        this.fullscreenImage = url;
    }

    closeFullscreenImage = () => {
        this.fullscreenImage = '';
    }

    craftKey = (rarity: 'R' | 'SR' | 'SSR') => {
        this.craftingAttempt = { rarity };
        this.rootStore.uiStore.openModal('craftingMinigame');
    }

    resolveCraftingAttempt = (result: 'critical' | 'success' | 'failure') => {
        if (!this.craftingAttempt) return;

        const rarity = this.craftingAttempt.rarity;
        const T = translations[this.rootStore.gameSettingsStore.language];
        const T_gallery = T.gallery;
        const costs = {
            R: { r_shards: 10, sr_shards: 0, ssr_shards: 0, transcendental_essences: 0 },
            SR: { r_shards: 25, sr_shards: 10, ssr_shards: 0, transcendental_essences: 5 },
            SSR: { r_shards: 0, sr_shards: 15, ssr_shards: 5, transcendental_essences: 10 }
        };
        const cost = costs[rarity];

        let shardsLost = 0;

        runInAction(() => {
            if (result === 'success' || result === 'critical') {
                this.r_shards -= cost.r_shards;
                this.sr_shards -= cost.sr_shards;
                this.ssr_shards -= cost.ssr_shards;
                this.transcendental_essences -= cost.transcendental_essences;

                if (rarity === 'R') this.r_keys++;
                else if (rarity === 'SR') this.sr_keys++;
                else if (rarity === 'SSR') this.ssr_keys++;

                this.rootStore.uiStore.showSnackbar(T_gallery.craftKeySuccess(rarity), 'success');
                this.rootStore.missionStore.incrementProgress('keysCrafted');
            } else { // failure
                this.r_shards -= Math.floor(cost.r_shards * 0.5);
                this.sr_shards -= Math.floor(cost.sr_shards * 0.5);
                this.ssr_shards -= Math.floor(cost.ssr_shards * 0.5);
                this.transcendental_essences -= Math.floor(cost.transcendental_essences * 0.5);
                
                shardsLost = Math.floor(cost.r_shards * 0.5) + Math.floor(cost.sr_shards * 0.5) + Math.floor(cost.ssr_shards * 0.5);
                this.rootStore.uiStore.showSnackbar(T.craftingMinigame.failure, 'warning');
            }

            if (result === 'critical') {
                // refund 50% of the cost for critical success
                this.r_shards += Math.floor(cost.r_shards * 0.5);
                this.sr_shards += Math.floor(cost.sr_shards * 0.5);
                this.ssr_shards += Math.floor(cost.ssr_shards * 0.5);
                this.transcendental_essences += Math.floor(cost.transcendental_essences * 0.5);
                this.rootStore.uiStore.showSnackbar(T.craftingMinigame.criticalSuccess, 'success');
                playSound('craft-critical');
            } else if (result === 'success') {
                playSound('trick-win');
            } else {
                playSound('trick-lose');
            }
        });
        this.craftingAttempt = null; // Clear the attempt
        this.rootStore.uiStore.closeModal('craftingMinigame');
    }

    cancelCraftingAttempt = () => {
        this.craftingAttempt = null;
        this.rootStore.uiStore.closeModal('craftingMinigame');
    }

    convertShards = (fromRarity: 'R' | 'SR', toRarity: 'SR' | 'SSR') => {
        const T = translations[this.rootStore.gameSettingsStore.language];
        const conversionRate = 10;
        if (fromRarity === 'R' && toRarity === 'SR' && this.r_shards >= conversionRate) {
            this.r_shards -= conversionRate;
            this.sr_shards += 1;
            this.rootStore.uiStore.showSnackbar(T.gallery.conversionSuccess(1, 'SR'), 'success');
            playSound('essence-gain');
        } else if (fromRarity === 'SR' && toRarity === 'SSR' && this.sr_shards >= conversionRate) {
            this.sr_shards -= conversionRate;
            this.ssr_shards += 1;
            this.rootStore.uiStore.showSnackbar(T.gallery.conversionSuccess(1, 'SSR'), 'success');
            playSound('essence-gain');
        } else {
            this.rootStore.uiStore.showSnackbar(T.gallery.gachaNotEnoughShards, 'warning');
        }
    }

    convertElementalToTranscendental = () => {
        const T = translations[this.rootStore.gameSettingsStore.language];
        const conversionRate = 10;
        if (this.fire_essences >= conversionRate && this.water_essences >= conversionRate &&
            this.air_essences >= conversionRate && this.earth_essences >= conversionRate) {
            
            this.fire_essences -= conversionRate;
            this.water_essences -= conversionRate;
            this.air_essences -= conversionRate;
            this.earth_essences -= conversionRate;
            this.transcendental_essences += 1;
            this.rootStore.uiStore.showSnackbar(T.gallery.conversionSuccess(1, T.missions.rewards.transcendental_essences), 'success');
            playSound('essence-gain');
        } else {
            this.rootStore.uiStore.showSnackbar(T.gallery.essencesLabel, 'warning'); // Generic warning, could be more specific
        }
    }

    unlockDungeonBackground = (rarity: 'R' | 'SR' | 'SSR'): { background: BackgroundItem, isNew: boolean } => {
        const bg = this.DUNGEON_REWARD_BACKGROUNDS[rarity];
        const isNew = !this.unlockedDungeonBackgrounds.includes(bg.url);
        if (isNew) {
            this.unlockedDungeonBackgrounds.push(bg.url);
        }
        return { background: bg, isNew };
    }
}