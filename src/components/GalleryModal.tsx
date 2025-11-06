/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import type { Language } from '../core/types';
import { GachaUnlockAnimation } from './GachaUnlockAnimation';
import { GachaRollingAnimation } from './GachaRollingAnimation';

// Import new sub-components
import { GalleryTabs } from './gallery/GalleryTabs';
import { GalleryTabContent } from './gallery/GalleryTabContent';
import { CraftingTabContent } from './gallery/CraftingTabContent';
import { ConversionTabContent } from './gallery/ConversionTabContent';
// Removed direct import of PackSelectionScreen as it will be in GalleryTabContent

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

export const GalleryModal = observer(({ isOpen, onClose, language, backgrounds, unlockedBackgrounds, waifuCoins, onGachaRoll, onGachaMultiRoll, hasRolledGacha, isRolling, gachaAnimationState, onAnimationEnd, onImageSelect, isNsfwEnabled }: GalleryModalProps) => {
    // Removed gachaStore access here, as galleryTabContentMode is now managed within GalleryTabContent
    const [activeTab, setActiveTab] = useState<'gallery' | 'crafting' | 'convert'>('gallery');

    useEffect(() => {
        if (isOpen && !isNsfwEnabled) {
            onClose();
        }
    }, [isOpen, isNsfwEnabled, onClose]);

    if (!isOpen || !isNsfwEnabled) {
        return null;
    }

    const T = translations[language];

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close} data-tutorial-id="gallery-close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                {isRolling && !gachaAnimationState.active && <GachaRollingAnimation />}
                {gachaAnimationState.active && gachaAnimationState.rarity && (
                    <GachaUnlockAnimation
                        rarity={gachaAnimationState.rarity}
                        onAnimationEnd={onAnimationEnd}
                    />
                )}
                
                <GalleryTabs language={language} activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="gallery-content">
                    {activeTab === 'gallery' && (
                        <GalleryTabContent // This component will now manage PackSelectionScreen internally
                            language={language}
                            backgrounds={backgrounds}
                            unlockedBackgrounds={unlockedBackgrounds}
                            waifuCoins={waifuCoins}
                            onGachaRoll={onGachaRoll}
                            onGachaMultiRoll={onGachaMultiRoll}
                            hasRolledGacha={hasRolledGacha}
                            isRolling={isRolling}
                            onImageSelect={onImageSelect}
                        />
                    )}
                    {activeTab === 'crafting' && (
                        <CraftingTabContent
                            language={language}
                        />
                    )}
                    {activeTab === 'convert' && (
                        <ConversionTabContent
                            language={language}
                        />
                    )}
                </div>
            </div>
        </div>
    );
});