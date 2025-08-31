/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useLocalStorage } from './useLocalStorage';
import type { Language, GameplayMode, Difficulty, Soundtrack } from '../core/types';

export const useGameSettings = () => {
    const [language, setLanguage] = useLocalStorage<Language>('language', 'it');
    const [gameplayMode, setGameplayMode] = useLocalStorage<GameplayMode>('gameplay_mode', 'classic');
    const [difficulty, setDifficulty] = useLocalStorage<Difficulty>('difficulty', 'medium');
    const [isChatEnabled, setIsChatEnabled] = useLocalStorage<boolean>('is_chat_enabled', true);
    const [waitForWaifuResponse, setWaitForWaifuResponse] = useLocalStorage<boolean>('wait_for_waifu_response', false);
    const [soundtrack, setSoundtrack] = useLocalStorage<Soundtrack>('soundtrack', 'epic');

    const settings = {
        language,
        gameplayMode,
        difficulty,
        isChatEnabled,
        waitForWaifuResponse,
        soundtrack,
    };

    const setters = {
        setLanguage,
        setGameplayMode,
        setDifficulty,
        setIsChatEnabled,
        setWaitForWaifuResponse,
        setSoundtrack,
    };

    return { settings, setters };
};
