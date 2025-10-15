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
        // Instantiate a default store. The UI will call prepareGame to switch it if needed.
        this.gameStateStore = new ClassicModeStore(this);
        this.chatStore = new ChatStore(this);
        this.missionStore = new MissionStore(this);
        
        makeAutoObservable(this, { posthog: false });
    }

    prepareGame = (mode: GameplayMode) => {
        if (this.gameStateStore.phase !== 'menu') return;

        if (mode === 'classic' && !(this.gameStateStore instanceof ClassicModeStore)) {
            this.gameStateStore = new ClassicModeStore(this);
        } else if (mode === 'roguelike' && !(this.gameStateStore instanceof RoguelikeModeStore)) {
            this.gameStateStore = new RoguelikeModeStore(this);
        } else if (mode === 'dungeon' && !(this.gameStateStore instanceof DungeonModeStore)) {
            this.gameStateStore = new DungeonModeStore(this);
        }
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
