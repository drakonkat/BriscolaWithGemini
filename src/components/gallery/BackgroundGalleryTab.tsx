import React, { useState } from 'react';
import { translations } from '../../core/translations';
import { BackgroundGrid } from './BackgroundGrid';
import type { Language } from '../../core/types';
import { useStores } from '../../stores';

type BackgroundItem = {
    url: string;
    rarity: 'R' | 'SR' | 'SSR';
};

interface BackgroundGalleryTabProps {
    language: Language;
    onImageSelect: (url: string) => void;
}

export const BackgroundGalleryTab: React.FC<BackgroundGalleryTabProps> = ({ language, onImageSelect }) => {
    const T = translations[language];
    const { gachaStore } = useStores();
    const [activeCarouselTab, setActiveCarouselTab] = useState<'packBase' | 'dungeonBase'>('packBase');

    const packBaseBackgrounds = gachaStore.BACKGROUNDS;
    const packBaseUnlocked = gachaStore.unlockedBackgrounds;

    const dungeonBaseBackgrounds = Object.values(gachaStore.DUNGEON_REWARD_BACKGROUNDS);
    const dungeonBaseUnlocked = gachaStore.unlockedDungeonBackgrounds;

    return (
        <div className="gallery-tab-content">
            <h2 className="gallery-section-title">{T.gallery.backgroundsTabTitle}</h2>
            <div className="carousel-tabs-container">
                <button
                    className={`carousel-tab-button ${activeCarouselTab === 'packBase' ? 'active' : ''}`}
                    onClick={() => setActiveCarouselTab('packBase')}
                >
                    {T.gallery.packBaseGalleryTitle}
                </button>
                <button
                    className={`carousel-tab-button ${activeCarouselTab === 'dungeonBase' ? 'active' : ''}`}
                    onClick={() => setActiveCarouselTab('dungeonBase')}
                >
                    {T.gallery.dungeonBaseGalleryTitle}
                </button>
            </div>

            {activeCarouselTab === 'packBase' && (
                <BackgroundGrid
                    language={language}
                    backgrounds={packBaseBackgrounds}
                    unlockedBackgrounds={packBaseUnlocked}
                    onImageSelect={onImageSelect}
                />
            )}
            {activeCarouselTab === 'dungeonBase' && (
                <BackgroundGrid
                    language={language}
                    backgrounds={dungeonBaseBackgrounds}
                    unlockedBackgrounds={dungeonBaseUnlocked}
                    onImageSelect={onImageSelect}
                />
            )}
        </div>
    );
};