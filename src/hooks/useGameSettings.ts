/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useLocalStorage } from './useLocalStorage';
import type { Language, GameplayMode, Difficulty, Soundtrack } from '../core/types';
import { defaultSoundSettings, type SoundSettings } from '../core/soundManager';

export const useGameSettings = () => {
    const [language, setLanguage] = useLocalStorage<Language>('language', 'it');
    const [gameplayMode, setGameplayMode] = useLocalStorage<GameplayMode>('gameplay_mode', 'classic');
    const [difficulty, setDifficulty] = useLocalStorage<Difficulty>('difficulty', 'medium');
    const [isChatEnabled, setIsChatEnabled] = useLocalStorage<boolean>('is_chat_enabled', true);
    const [waitForWaifuResponse, setWaitForWaifuResponse] = useLocalStorage<boolean>('wait_for_waifu_response', false);
    const [soundtrack, setSoundtrack] = useLocalStorage<Soundtrack>('soundtrack', 'epic');
    const [isMusicEnabled, setIsMusicEnabled] = useLocalStorage<boolean>('is_music_enabled', false);
    const [soundEditorSettings, setSoundEditorSettings] = useLocalStorage<SoundSettings>('sound_editor_settings', defaultSoundSettings);

    const settings = {
        language,
        gameplayMode,
        difficulty,
        isChatEnabled,
        waitForWaifuResponse,
        soundtrack,
        isMusicEnabled,
        soundEditorSettings,
    };

    const setters = {
        setLanguage,
        setGameplayMode,
        setDifficulty,
        setIsChatEnabled,
        setWaitForWaifuResponse,
        setSoundtrack,
        setIsMusicEnabled,
        setSoundEditorSettings,
    };

    return { settings, setters };
};