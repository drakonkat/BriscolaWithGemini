/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { usePostHog } from 'posthog-js/react';
import { getImageUrl } from '../core/utils';
import { translations } from '../core/translations';
import type { Language } from '../core/types';

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

export const useGachaAndGallery = (
    showSnackbar: (message: string, type: 'success' | 'warning') => void,
    language: Language
) => {
    const [waifuCoins, setWaifuCoins] = useLocalStorage<number>('waifu_coins', 0);
    const [unlockedBackgrounds, setUnlockedBackgrounds] = useLocalStorage<string[]>('unlocked_backgrounds', []);
    const [hasRolledGacha, setHasRolledGacha] = useLocalStorage<boolean>('has_rolled_gacha', false);
    const [fullscreenImage, setFullscreenImage] = useState<string>('');
    const posthog = usePostHog();
    const T = translations[language];

    const addCoins = useCallback((amount: number) => {
        setWaifuCoins(prev => prev + amount);
    }, [setWaifuCoins]);

    const handleGachaRoll = useCallback(() => {
        const GACHA_COST = 100;
        const isFirstRoll = !hasRolledGacha;

        if (!isFirstRoll && waifuCoins < GACHA_COST) {
            showSnackbar(T.gallery.gachaNotEnoughCoins, 'warning');
            return;
        }

        const locked = BACKGROUNDS.filter(bg => !unlockedBackgrounds.includes(bg.url));
        if (locked.length === 0) {
            showSnackbar(T.gallery.gachaAllUnlocked, 'success');
            return;
        }

        if (!isFirstRoll) {
            addCoins(-GACHA_COST);
        }

        if (isFirstRoll || Math.random() < 0.50) {
            const rand = Math.random();
            let rarityToPull: 'R' | 'SR' | 'SSR' = rand < 0.05 ? 'SSR' : rand < 0.20 ? 'SR' : 'R';
            let pool = locked.filter(item => item.rarity === rarityToPull);
            
            if (pool.length === 0) { // Pity system
                pool = locked.filter(item => item.rarity === (rarityToPull === 'SSR' ? 'SR' : 'R')) 
                    || locked.filter(item => item.rarity !== rarityToPull);
            }
            if (pool.length === 0) pool = locked;

            const toUnlock = pool[Math.floor(Math.random() * pool.length)];
            setUnlockedBackgrounds(prev => [...prev, toUnlock.url]);
            showSnackbar(T.gallery.gachaSuccess(toUnlock.rarity), 'success');
            posthog.capture('gacha_success', { 
                rarity: toUnlock.rarity,
                is_first_roll: isFirstRoll,
            });
        } else {
            showSnackbar(T.gallery.gachaFailure, 'success');
            posthog.capture('gacha_failure', { reason: '50_percent_roll_failed' });
        }
        
        if (isFirstRoll) {
            setHasRolledGacha(true);
        }
    }, [hasRolledGacha, waifuCoins, showSnackbar, T.gallery, unlockedBackgrounds, addCoins, posthog, setHasRolledGacha, setUnlockedBackgrounds]);

    const openFullscreenImage = (url: string) => setFullscreenImage(url);
    const closeFullscreenImage = () => setFullscreenImage('');

    return {
        gachaState: {
            waifuCoins,
            unlockedBackgrounds,
            hasRolledGacha,
            fullscreenImage,
            BACKGROUNDS,
        },
        gachaActions: {
            addCoins,
            handleGachaRoll,
            openFullscreenImage,
            closeFullscreenImage,
        }
    };
};