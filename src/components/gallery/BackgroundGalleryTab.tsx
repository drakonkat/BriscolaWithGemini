import React from 'react';
import { translations } from '../../core/translations';
import { BackgroundGrid } from './BackgroundGrid';
import type { Language } from '../../core/types';

type BackgroundItem = {
    url: string;
    rarity: 'R' | 'SR' | 'SSR';
};

interface BackgroundGalleryTabProps {
    language: Language;
    backgrounds: BackgroundItem[];
    unlockedBackgrounds: string[];
    onImageSelect: (url: string) => void;
}

export const BackgroundGalleryTab: React.FC<BackgroundGalleryTabProps> = ({ language, backgrounds, unlockedBackgrounds, onImageSelect }) => {
    const T = translations[language];

    return (
        <div className="gallery-tab-content">
            <h2 className="gallery-section-title">{T.gallery.backgroundsTabTitle}</h2>
            <BackgroundGrid
                language={language}
                backgrounds={backgrounds}
                unlockedBackgrounds={unlockedBackgrounds}
                onImageSelect={onImageSelect}
            />
        </div>
    );
};