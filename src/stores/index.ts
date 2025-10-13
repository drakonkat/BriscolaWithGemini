/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useContext } from 'react';
import { GameSettingsStore } from './GameSettingsStore';
import { UIStateStore } from './UIStateStore';
import { GachaStore } from './GachaStore';
import { GameStateStore } from './GameStateStore';
import { ChatStore } from './ChatStore';
import { MissionStore } from './MissionStore';
import type { PostHog } from 'posthog-js';

export class RootStore {
    gameSettingsStore: GameSettingsStore;
    uiStore: UIStateStore;
    gachaStore: GachaStore;
    gameStateStore: GameStateStore;
    chatStore: ChatStore;
    missionStore: MissionStore;
    posthog: PostHog | null = null;

    constructor() {
        this.gameSettingsStore = new GameSettingsStore(this);
        this.uiStore = new UIStateStore(this);
        this.gachaStore = new GachaStore(this);
        this.gameStateStore = new GameStateStore(this);
        this.chatStore = new ChatStore(this);
        this.missionStore = new MissionStore(this);
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
