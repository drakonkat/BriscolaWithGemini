import React from 'react';
import { translations } from '../../core/translations';
import { CachedImage } from '../CachedImage';
import type { Language } from '../../core/types';
import { LockIcon } from '../icons/LockIcon';

type BackgroundItem = {
    url: string;
    rarity: 'R' | 'SR' | 'SSR';
};

interface BackgroundGridProps {
    language: Language;
    backgrounds: BackgroundItem[];
    unlockedBackgrounds: string[];
    onImageSelect: (url: string) => void;
}

export const BackgroundGrid: React.FC<BackgroundGridProps> = ({ language, backgrounds, unlockedBackgrounds, onImageSelect }) => {
    const T = translations[language];
    const T_gallery = T.gallery;

    return (
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
                        aria-label={isUnlocked ? `${T_gallery.backgroundAlt} ${index + 1} (${item.rarity}). ${T_gallery.fullscreenView}` : `${T_gallery.locked} (${item.rarity})`}
                    >
                        {isUnlocked ? (
                            <CachedImage imageUrl={item.url} alt={`${T_gallery.backgroundAlt} ${index + 1}`} loading="lazy" />
                        ) : (
                            <div className="locked-overlay">
                                <LockIcon />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};