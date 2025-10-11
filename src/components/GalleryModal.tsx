/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';
import { translations } from '../core/translations';
import type { Language } from '../core/types';
import { CachedImage } from './CachedImage';
import { GachaUnlockAnimation } from './GachaUnlockAnimation';
import { GachaRollingAnimation } from './GachaRollingAnimation';

type BackgroundItem = {
    url: string;
    rarity: 'R' | 'SR' | 'SSR';
};

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    backgrounds: BackgroundItem[];
    unlockedBackgrounds: string[];
    waifuCoins: number;
    onGachaRoll: () => void;
    onGachaMultiRoll: () => void;
    hasRolledGacha: boolean;
    isRolling: boolean;
    gachaAnimationState: { active: boolean; rarity: 'R' | 'SR' | 'SSR' | null };
    onAnimationEnd: () => void;
    onImageSelect: (url: string) => void;
    isNsfwEnabled: boolean;
}

export const GalleryModal = ({ isOpen, onClose, language, backgrounds, unlockedBackgrounds, waifuCoins, onGachaRoll, onGachaMultiRoll, hasRolledGacha, isRolling, gachaAnimationState, onAnimationEnd, onImageSelect, isNsfwEnabled }: GalleryModalProps) => {
    useEffect(() => {
        if (isOpen && !isNsfwEnabled) {
            onClose();
        }
    }, [isOpen, isNsfwEnabled, onClose]);

    if (!isOpen || !isNsfwEnabled) {
        return null;
    }

    const T = translations[language];
    const GACHA_COST = 100;
    const GACHA_COST_X10 = 900;
    const isFirstRoll = !hasRolledGacha;
    const allUnlocked = unlockedBackgrounds.length >= backgrounds.length;
    const canAfford = waifuCoins >= GACHA_COST;
    const canAffordX10 = waifuCoins >= GACHA_COST_X10;
    // FIX: Called the `gachaButton` function with the cost to generate the button text string.
    const buttonText = isFirstRoll ? T.gallery.gachaButtonFree : T.gallery.gachaButton(GACHA_COST);

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                {isRolling && !gachaAnimationState.active && <GachaRollingAnimation />}
                {gachaAnimationState.active && gachaAnimationState.rarity && (
                    <GachaUnlockAnimation 
                        rarity={gachaAnimationState.rarity}
                        onAnimationEnd={onAnimationEnd}
                    />
                )}
                <div className="gallery-header">
                    <h2>{T.gallery.title}</h2>
                    <div className="modal-actions">
                        <button onClick={onGachaRoll} disabled={allUnlocked || (!isFirstRoll && !canAfford) || isRolling}>
                            {buttonText}
                        </button>
                        {/* FIX: Added a button for multi-gacha rolls. */}
                        <button onClick={onGachaMultiRoll} disabled={allUnlocked || isFirstRoll || !canAffordX10 || isRolling}>
                            {T.gallery.gachaButtonX10(GACHA_COST_X10)}
                        </button>
                    </div>
                </div>
                <div className="gallery-grid">
                    {backgrounds.map((item, index) => {
                        const isUnlocked = unlockedBackgrounds.includes(item.url);
                        const rarityClass = `rarity-${item.rarity.toLowerCase()}`;

                        return (
                            <div 
                                key={index} 
                                className={`gallery-item ${isUnlocked ? '' : 'locked'} ${rarityClass}`} 
                                onClick={isUnlocked ? () => onImageSelect(item.url) : undefined}
                                onKeyDown={isUnlocked ? (e) => (e.key === 'Enter' || e.key === ' ') && onImageSelect(item.url) : undefined}
                                role={isUnlocked ? 'button' : 'img'}
                                tabIndex={isUnlocked ? 0 : -1}
                                aria-label={isUnlocked ? `${T.gallery.backgroundAlt} ${index + 1} (${item.rarity}). ${T.gallery.fullscreenView}` : `${T.gallery.locked} (${item.rarity})`}
                            >
                                {isUnlocked ? (
                                    <CachedImage imageUrl={item.url} alt={`${T.gallery.backgroundAlt} ${index + 1}`} loading="lazy" />
                                ) : (
                                    <div className="locked-overlay">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};