/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, autorun } from 'mobx';
import type { RootStore } from '.';
import type { Language, GameplayMode, Difficulty, Soundtrack, CardDeckStyle } from '../core/types';
import { defaultSoundSettings, type SoundSettings } from '../core/soundManager';

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error loading ${key} from localStorage`, error);
        return defaultValue;
    }
};

export class GameSettingsStore {
    rootStore: RootStore;
    language: Language = loadFromLocalStorage('language', 'it');
    gameplayMode: GameplayMode = loadFromLocalStorage('gameplay_mode', 'classic');
    difficulty: Difficulty = loadFromLocalStorage('difficulty', 'medium');
    isChatEnabled: boolean = loadFromLocalStorage('is_chat_enabled', true);
    waitForWaifuResponse: boolean = loadFromLocalStorage('wait_for_waifu_response', false);
    soundtrack: Soundtrack = loadFromLocalStorage('soundtrack', 'epic');
    isMusicEnabled: boolean = loadFromLocalStorage('is_music_enabled', false);
    soundEditorSettings: SoundSettings = loadFromLocalStorage('sound_editor_settings', defaultSoundSettings);
    cardDeckStyle: CardDeckStyle = loadFromLocalStorage('card_deck_style', 'classic');

    constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;

        autorun(() => localStorage.setItem('language', JSON.stringify(this.language)));
        autorun(() => localStorage.setItem('gameplay_mode', JSON.stringify(this.gameplayMode)));
        autorun(() => localStorage.setItem('difficulty', JSON.stringify(this.difficulty)));
        autorun(() => localStorage.setItem('is_chat_enabled', JSON.stringify(this.isChatEnabled)));
        autorun(() => localStorage.setItem('wait_for_waifu_response', JSON.stringify(this.waitForWaifuResponse)));
        autorun(() => localStorage.setItem('soundtrack', JSON.stringify(this.soundtrack)));
        autorun(() => localStorage.setItem('is_music_enabled', JSON.stringify(this.isMusicEnabled)));
        autorun(() => localStorage.setItem('sound_editor_settings', JSON.stringify(this.soundEditorSettings)));
        autorun(() => localStorage.setItem('card_deck_style', JSON.stringify(this.cardDeckStyle)));
    }

    setLanguage = (lang: Language) => this.language = lang;
    setGameplayMode = (mode: GameplayMode) => this.gameplayMode = mode;
    setDifficulty = (difficulty: Difficulty) => this.difficulty = difficulty;
    setIsChatEnabled = (enabled: boolean) => this.isChatEnabled = enabled;
    setWaitForWaifuResponse = (enabled: boolean) => this.waitForWaifuResponse = enabled;
    setSoundtrack = (soundtrack: Soundtrack) => this.soundtrack = soundtrack;
    setIsMusicEnabled = (enabled: boolean) => this.isMusicEnabled = enabled;
    setSoundEditorSettings = (settings: SoundSettings) => this.soundEditorSettings = settings;
    setCardDeckStyle = (style: CardDeckStyle) => this.cardDeckStyle = style;
}