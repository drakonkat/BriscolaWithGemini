/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useContext } from 'react';
import { makeAutoObservable } from 'mobx';
import { GameSettingsStore } from './GameSettingsStore';
import { UIStateStore } from './UIStateStore';
import { GachaStore } from './GachaStore';
import { ChatStore } from './ChatStore';
import { MissionStore } from './MissionStore';
import { GameStateStore } from './GameStateStore';
import { ClassicModeStore } from './ClassicModeStore';
import { DungeonModeStore } from './DungeonModeStore';
import { RoguelikeModeStore } from './RoguelikeModeStore';
import type { PostHog } from 'posthog-js';
import type { GameplayMode } from '../core/types';

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error loading ${key} from localStorage`, error);
        return defaultValue;
    }
};

export class RootStore {
    gameSettingsStore: GameSettingsStore;
    uiStore: UIStateStore;
    gachaStore: GachaStore;
    gameStateStore: GameStateStore; // This must be initialized before stores that depend on it (like ChatStore).
    chatStore: ChatStore;
    missionStore: MissionStore;

    posthog: PostHog | null = null;

    constructor() {
        this.gameSettingsStore = new GameSettingsStore(this);
        this.uiStore = new UIStateStore(this);
        this.gachaStore = new GachaStore(this);
        this.missionStore = new MissionStore(this);

        // Initialize gameStateStore based on the loaded setting, BEFORE other stores that depend on it.
        this.gameStateStore = this.createGameStateStoreForMode(this.gameSettingsStore.gameplayMode);
        
        // Now initialize stores that depend on gameStateStore.
        this.chatStore = new ChatStore(this);
        
        makeAutoObservable(this, { posthog: false });
    }

    switchGameStateStore = (mode: GameplayMode) => {
        // Check if we even need to switch
        if (mode === 'classic' && this.gameStateStore instanceof ClassicModeStore) return;
        if (mode === 'roguelike' && this.gameStateStore instanceof RoguelikeModeStore) return;
        if (mode === 'dungeon' && this.gameStateStore instanceof DungeonModeStore) return;
    
        // Dispose listeners on old stores
        this.gameStateStore.dispose();
        this.chatStore.dispose();
    
        // Create and assign new store
        this.gameStateStore = this.createGameStateStoreForMode(mode);
    
        // Re-initialize listeners that depend on the new store
        this.chatStore.init();
    }

    // Helper function to create the correct store instance based on the mode.
    createGameStateStoreForMode(mode: GameplayMode): GameStateStore {
        if (mode === 'roguelike') {
            return new RoguelikeModeStore(this);
        }
        if (mode === 'dungeon') {
            return new DungeonModeStore(this);
        }
        // Default to classic mode.
        return new ClassicModeStore(this);
    }

    init = (posthogInstance: PostHog) => {
        this.posthog = posthogInstance;
    }

    get hasAnySavedGame(): boolean {
        const hasClassic = loadFromLocalStorage('classic_save', null) !== null;
        const roguelikeState = loadFromLocalStorage('roguelike_save', { currentLevel: 0 });
        const hasRoguelike = roguelikeState.currentLevel > 0;
        const dungeonState = loadFromLocalStorage('dungeon_run_state', { isActive: false });
        const hasDungeon = dungeonState.isActive;
        return hasClassic || hasRoguelike || hasDungeon;
    }

    resumeAnyGame = () => {
        const hasClassic = loadFromLocalStorage('classic_save', null) !== null;
        const roguelikeState = loadFromLocalStorage('roguelike_save', { currentLevel: 0 });
        const hasRoguelike = roguelikeState.currentLevel > 0;
        const dungeonState = loadFromLocalStorage('dungeon_run_state', { isActive: false });
        const hasDungeon = dungeonState.isActive;

        let modeToResume: GameplayMode | null = null;
        // Prioritize more complex/longer modes
        if (hasRoguelike) {
            modeToResume = 'roguelike';
        } else if (hasDungeon) {
            modeToResume = 'dungeon';
        } else if (hasClassic) {
            modeToResume = 'classic';
        }

        if (modeToResume) {
            this.gameSettingsStore.gameplayMode = modeToResume;
            this.switchGameStateStore(modeToResume);
            this.gameStateStore.resumeGame();
        }
    }
}

export const rootStore = new RootStore();
export const StoreContext = createContext(rootStore);

export const useStores = () => {
    return useContext(StoreContext);
};

// FIX: Export store classes so they can be imported and used for type checking elsewhere in the app.
export { GameStateStore, ClassicModeStore, DungeonModeStore, RoguelikeModeStore };