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
import { CloseIcon } from './icons/CloseIcon';

// Import new sub-components
import { GalleryTabs } from './gallery/GalleryTabs';
import { GachaTabContent } from './gallery/GachaTabContent'; // Renamed from GalleryTabContent
import { CraftingTabContent } from './gallery/CraftingTabContent';
import { ConversionTabContent } from './gallery/ConversionTabContent';
import { BackgroundGalleryTab } from './gallery/BackgroundGalleryTab'; // New: dedicated background gallery tab


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
    // Renamed 'gallery' to 'gacha' for clarity matching the new tab structure
    const [activeTab, setActiveTab] = useState<'gacha' | 'backgrounds' | 'crafting' | 'convert'>('gacha');

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
                    <CloseIcon />
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
                    {activeTab === 'gacha' && (
                        <GachaTabContent // This component now manages PackSelectionScreen internally
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
                    {activeTab === 'backgrounds' && (
                        <BackgroundGalleryTab
                            language={language}
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