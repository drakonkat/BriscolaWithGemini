import React from 'react';
import { observer } from 'mobx-react-lite';
import { GachaControls } from './GachaControls';
import { BackgroundGrid } from './BackgroundGrid';
import { useStores } from '../../stores';
import type { Language } from '../../core/types';

type BackgroundItem = {
    url: string;
    rarity: 'R' | 'SR' | 'SSR';
};

interface GalleryTabContentProps {
    language: Language;
    backgrounds: BackgroundItem[];
    unlockedBackgrounds: string[];
    waifuCoins: number;
    onGachaRoll: () => void;
    onGachaMultiRoll: () => void;
    hasRolledGacha: boolean;
    isRolling: boolean;
    onImageSelect: (url: string) => void;
}

export const GalleryTabContent: React.FC<GalleryTabContentProps> = observer(({ language, backgrounds, unlockedBackgrounds, waifuCoins, onGachaRoll, onGachaMultiRoll, hasRolledGacha, isRolling, onImageSelect }) => {
    const allUnlocked = unlockedBackgrounds.length >= backgrounds.length;

    return (
        <div className="gallery-tab-content">
            <GachaControls
                language={language}
                waifuCoins={waifuCoins}
                onGachaRoll={onGachaRoll}
                onGachaMultiRoll={onGachaMultiRoll}
                hasRolledGacha={hasRolledGacha}
                isRolling={isRolling}
                allUnlocked={allUnlocked}
            />
            <BackgroundGrid
                language={language}
                backgrounds={backgrounds}
                unlockedBackgrounds={unlockedBackgrounds}
                onImageSelect={onImageSelect}
            />
        </div>
    );
});
