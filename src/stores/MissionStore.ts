/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, autorun, runInAction } from 'mobx';
import type { RootStore } from '.';
import type { Mission, Achievement, MissionState, AchievementState, MissionProgressKey, MissionRewardType } from '../core/types';
import { playSound } from '../core/soundManager';
import { WAIFUS } from '../core/waifus';

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error loading ${key} from localStorage`, error);
        return defaultValue;
    }
};

const DAILY_MISSIONS_DEFINITIONS: Mission[] = [
    { id: 'daily_win_classic', type: 'daily', category: 'gameplay', progressKey: 'classicGamesWon', target: 1, rewards: { waifuCoins: 50, r_shards: 1 } },
    { id: 'daily_play_cards_coppe', type: 'daily', category: 'gameplay', progressKey: 'cardsPlayed_coppe', target: 5, rewards: { waifuCoins: 25 } },
    { id: 'daily_use_elemental_power', type: 'daily', category: 'gameplay', progressKey: 'elementalPowersUsed', target: 3, rewards: { fire_essences: 1, water_essences: 1 } },
];

const WEEKLY_MISSIONS_DEFINITIONS: Mission[] = [
    { id: 'weekly_win_any', type: 'weekly', category: 'gameplay', progressKey: 'gamesWon', target: 5, rewards: { waifuCoins: 150, sr_shards: 1 } },
    // FIX: Corrected progressKey to match the updated MissionProgressKey type.
    { id: 'weekly_win_hard', type: 'weekly', category: 'gameplay', progressKey: 'winOnDifficulty_hard', target: 1, rewards: { waifuCoins: 100, sr_shards: 2 } },
    { id: 'weekly_craft_key', type: 'weekly', category: 'collection', progressKey: 'keysCrafted', target: 1, rewards: { r_shards: 5 } },
    { id: 'weekly_gacha_10', type: 'weekly', category: 'collection', progressKey: 'gachaRolls', target: 10, rewards: { waifuCoins: 100 } },
];

const ACHIEVEMENTS_DEFINITIONS: Achievement[] = [
    { id: 'achievement_win_10', category: 'gameplay', progressKey: 'gamesWon', target: 10, rewards: { waifuCoins: 200 } },
    { id: 'achievement_win_50', category: 'gameplay', progressKey: 'gamesWon', target: 50, rewards: { waifuCoins: 500, sr_shards: 5 } },
    { id: 'achievement_win_100', category: 'gameplay', progressKey: 'gamesWon', target: 100, rewards: { waifuCoins: 1000, ssr_shards: 1 } },
    { id: 'achievement_win_nightmare', category: 'gameplay', progressKey: 'winOnDifficulty_nightmare', target: 1, rewards: { sr_shards: 3 } },
    { id: 'achievement_win_apocalypse', category: 'gameplay', progressKey: 'winOnDifficulty_apocalypse', target: 1, rewards: { ssr_shards: 2 } },
    { id: 'achievement_defeat_all_waifus', category: 'gameplay', progressKey: 'waifusDefeated', target: WAIFUS.length, rewards: { waifuCoins: 250 } },
    { id: 'achievement_collect_all_ssr', category: 'collection', progressKey: 'ssrCollected', target: 5, rewards: { ssr_shards: 3 } },
    { id: 'achievement_recruit_follower', category: 'gameplay', progressKey: 'followersRecruited', target: 1, rewards: { waifuCoins: 100 } },
];

export class MissionStore {
    rootStore: RootStore;
    
    dailyMissions = DAILY_MISSIONS_DEFINITIONS;
    weeklyMissions = WEEKLY_MISSIONS_DEFINITIONS;
    achievements = ACHIEVEMENTS_DEFINITIONS;

    missionProgress: Record<string, MissionState> = loadFromLocalStorage('mission_progress', {});
    achievementProgress: Record<string, AchievementState> = loadFromLocalStorage('achievement_progress', {});
    
    lastDailyReset: number = loadFromLocalStorage('last_daily_reset', 0);
    lastWeeklyReset: number = loadFromLocalStorage('last_weekly_reset', 0);
    
    uniqueProgress: Record<string, string[]> = loadFromLocalStorage('unique_progress', {});

    constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
        
        this.checkForResets();

        autorun(() => localStorage.setItem('mission_progress', JSON.stringify(this.missionProgress)));
        autorun(() => localStorage.setItem('achievement_progress', JSON.stringify(this.achievementProgress)));
        autorun(() => localStorage.setItem('last_daily_reset', JSON.stringify(this.lastDailyReset)));
        autorun(() => localStorage.setItem('last_weekly_reset', JSON.stringify(this.lastWeeklyReset)));
        autorun(() => localStorage.setItem('unique_progress', JSON.stringify(this.uniqueProgress)));
    }

    checkForResets() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        // Daily Reset (midnight)
        if (this.lastDailyReset < today) {
            runInAction(() => {
                this.lastDailyReset = today;
                this.dailyMissions.forEach(mission => {
                    this.missionProgress[mission.id] = { progress: 0, claimed: false };
                });
            });
        }
        
        // Weekly Reset (Monday midnight)
        const dayOfWeek = now.getDay(); // Sunday is 0, Monday is 1
        const daysSinceMonday = (dayOfWeek + 6) % 7;
        const monday = new Date(today - daysSinceMonday * 24 * 60 * 60 * 1000).getTime();
        if (this.lastWeeklyReset < monday) {
            runInAction(() => {
                this.lastWeeklyReset = monday;
                this.weeklyMissions.forEach(mission => {
                    this.missionProgress[mission.id] = { progress: 0, claimed: false };
                });
            });
        }
    }

    incrementProgress(key: MissionProgressKey, amount = 1) {
        this.checkForResets();

        const allMissions = [...this.dailyMissions, ...this.weeklyMissions, ...this.achievements];
        
        allMissions.forEach(mission => {
            if (mission.progressKey === key) {
                if (mission.type) { // Daily or Weekly
                    const state = this.missionProgress[mission.id] || { progress: 0, claimed: false };
                    if (!state.claimed) {
                        state.progress += amount;
                        this.missionProgress[mission.id] = state;
                    }
                } else { // Achievement
                    const state = this.achievementProgress[mission.id] || { progress: 0, claimed: false };
                    if (!state.claimed) {
                        state.progress += amount;
                        this.achievementProgress[mission.id] = state;
                    }
                }
            }
        });
    }

    setProgress(key: MissionProgressKey, value: number) {
         this.checkForResets();
        const allMissions = [...this.dailyMissions, ...this.weeklyMissions, ...this.achievements];
        allMissions.forEach(mission => {
            if (mission.progressKey === key) {
                if (mission.type) {
                     const state = this.missionProgress[mission.id] || { progress: 0, claimed: false };
                     if (!state.claimed) {
                         state.progress = value;
                         this.missionProgress[mission.id] = state;
                     }
                } else {
                    const state = this.achievementProgress[mission.id] || { progress: 0, claimed: false };
                     if (!state.claimed) {
                         state.progress = value;
                         this.achievementProgress[mission.id] = state;
                     }
                }
            }
        });
    }
    
    trackUnique(key: MissionProgressKey, value: string) {
        if (!this.uniqueProgress[key]) {
            this.uniqueProgress[key] = [];
        }
        if (!this.uniqueProgress[key].includes(value)) {
            this.uniqueProgress[key].push(value);
            this.setProgress(key, this.uniqueProgress[key].length);
        }
    }

    claimReward(missionId: string) {
        const mission = [...this.dailyMissions, ...this.weeklyMissions, ...this.achievements].find(m => m.id === missionId);
        if (!mission) return;
        
        const isAchievement = !mission.type;
        const state = isAchievement ? this.achievementProgress[missionId] : this.missionProgress[missionId];

        if (state && !state.claimed && state.progress >= mission.target) {
            Object.entries(mission.rewards).forEach(([type, amount]) => {
                const rewardType = type as MissionRewardType;
                if (rewardType === 'waifuCoins') this.rootStore.gachaStore.addCoins(amount!);
                else if (rewardType.endsWith('_shards')) this.rootStore.gachaStore.addShards(rewardType.split('_')[0].toUpperCase() as 'R' | 'SR' | 'SSR', amount!);
                else if (rewardType.endsWith('_essences')) this.rootStore.gachaStore.addEssences(rewardType.split('_')[0] as 'fire' | 'water' | 'air' | 'earth', amount!);
            });

            state.claimed = true;
            if (isAchievement) {
                (state as AchievementState).unlockedAt = Date.now();
                this.achievementProgress[missionId] = state;
            } else {
                this.missionProgress[missionId] = state;
            }
            
            playSound('mission-complete');
            this.rootStore.posthog?.capture('mission_claimed', { mission_id: missionId, type: mission.type || 'achievement' });
        }
    }
}