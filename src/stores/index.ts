/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useContext } from 'react';
import { makeAutoObservable, reaction } from 'mobx';
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

export class RootStore {
    gameSettingsStore: GameSettingsStore;
    uiStore: UIStateStore;
    gachaStore: GachaStore;
    chatStore: ChatStore;
    missionStore: MissionStore;
    gameStateStore: GameStateStore; // This will hold an instance of ClassicModeStore, RoguelikeModeStore, etc.

    posthog: PostHog | null = null;

    constructor() {
        this.gameSettingsStore = new GameSettingsStore(this);
        this.uiStore = new UIStateStore(this);
        this.gachaStore = new GachaStore(this);
        this.chatStore = new ChatStore(this);
        this.missionStore = new MissionStore(this);

        // Initialize gameStateStore based on the loaded setting
        this.gameStateStore = this.createGameStateStoreForMode(this.gameSettingsStore.gameplayMode);
        
        makeAutoObservable(this, { posthog: false });

        // When the gameplay mode changes in settings, create a new game state store for that mode.
        reaction(
            () => this.gameSettingsStore.gameplayMode,
            (newMode) => {
                // Only allow switching modes from the menu to prevent losing an active game.
                if (this.gameStateStore.phase === 'menu') {
                    this.gameStateStore.dispose();
                    this.gameStateStore = this.createGameStateStoreForMode(newMode);
                }
            }
        );
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
}

export const rootStore = new RootStore();
export const StoreContext = createContext(rootStore);

export const useStores = () => {
    return useContext(StoreContext);
};

// FIX: Export store classes so they can be imported and used for type checking elsewhere in the app.
export { GameStateStore, ClassicModeStore, DungeonModeStore, RoguelikeModeStore };