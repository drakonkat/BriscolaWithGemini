/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { makeAutoObservable, autorun } from 'mobx';
import { defaultSoundSettings, DRUM_TYPES } from '../core/soundManager.js';

const loadFromLocalStorage = (key, defaultValue) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error loading ${key} from localStorage`, error);
        return defaultValue;
    }
};

const loadSoundSettings = () => {
    const storedSettings = loadFromLocalStorage('sound_editor_settings', defaultSoundSettings);

    // Deep merge with defaults to ensure data integrity
    const settings = {
        ...defaultSoundSettings,
        ...storedSettings,
        drumPattern: {
            ...defaultSoundSettings.drumPattern,
            ...(storedSettings.drumPattern || {}),
        },
    };

    // Ensure arrays have the correct length
    const SEQUENCE_LENGTH = 16;

    if (!Array.isArray(settings.chordPattern) || settings.chordPattern.length !== SEQUENCE_LENGTH) {
        settings.chordPattern = defaultSoundSettings.chordPattern;
    }

    DRUM_TYPES.forEach(drum => {
        if (!Array.isArray(settings.drumPattern[drum]) || settings.drumPattern[drum].length !== SEQUENCE_LENGTH) {
            settings.drumPattern[drum] = defaultSoundSettings.drumPattern[drum];
        }
    });

    return settings;
};

export class GameSettingsStore {
    rootStore;
    language = loadFromLocalStorage('language', 'it');
    gameplayMode = loadFromLocalStorage('gameplay_mode', 'classic');
    difficulty = loadFromLocalStorage('difficulty', 'medium');
    isChatEnabled = loadFromLocalStorage('is_chat_enabled', true);
    waitForWaifuResponse = loadFromLocalStorage('wait_for_waifu_response', false);
    soundtrack = loadFromLocalStorage('soundtrack', 'epic');
    isMusicEnabled = loadFromLocalStorage('is_music_enabled', false);
    soundEditorSettings = loadSoundSettings();
    cardDeckStyle = loadFromLocalStorage('card_deck_style', 'classic');
    isDiceAnimationEnabled = loadFromLocalStorage('is_dice_animation_enabled', true);
    isNsfwEnabled = loadFromLocalStorage('is_nsfw_enabled', true);
    hasCompletedTutorial = loadFromLocalStorage('has_completed_tutorial', false);
    customSoundPresets = loadFromLocalStorage('custom_sound_presets', {});

    constructor(rootStore) {
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
        autorun(() => localStorage.setItem('is_dice_animation_enabled', JSON.stringify(this.isDiceAnimationEnabled)));
        autorun(() => localStorage.setItem('is_nsfw_enabled', JSON.stringify(this.isNsfwEnabled)));
        autorun(() => localStorage.setItem('has_completed_tutorial', JSON.stringify(this.hasCompletedTutorial)));
        autorun(() => localStorage.setItem('custom_sound_presets', JSON.stringify(this.customSoundPresets)));
    }

    setLanguage = (lang) => this.language = lang;
    setGameplayMode = (mode) => {
        if (this.rootStore.gameStateStore.phase === 'menu') {
            this.gameplayMode = mode;
            this.rootStore.switchGameStateStore(mode);
        }
    };
    setDifficulty = (difficulty) => this.difficulty = difficulty;
    setIsChatEnabled = (enabled) => this.isChatEnabled = enabled;
    setWaitForWaifuResponse = (enabled) => this.waitForWaifuResponse = enabled;
    setSoundtrack = (soundtrack) => this.soundtrack = soundtrack;
    setIsMusicEnabled = (enabled) => this.isMusicEnabled = enabled;
    setSoundEditorSettings = (settings) => this.soundEditorSettings = settings;
    setCardDeckStyle = (style) => this.cardDeckStyle = style;
    setIsDiceAnimationEnabled = (enabled) => this.isDiceAnimationEnabled = enabled;
    setIsNsfwEnabled = (enabled) => this.isNsfwEnabled = enabled;
    setTutorialCompleted = (completed) => this.hasCompletedTutorial = completed;

    saveCustomPreset = (name, settings) => {
        if (!name.trim()) return;
        const newPresets = { ...this.customSoundPresets, [name.trim()]: settings };
        this.customSoundPresets = newPresets;
    }

    deleteCustomPreset = (name) => {
        const newPresets = { ...this.customSoundPresets };
        delete newPresets[name];
        this.customSoundPresets = newPresets;
    }
}