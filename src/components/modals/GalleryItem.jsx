/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { CachedImage } from '../shared/CachedImage';

export const GalleryItem = ({ item, index, isUnlocked, T_gallery, onImageSelect }) => {
    const rarityClass = `rarity-${item.rarity.toLowerCase()}`;

    return (
        <div
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                </div>
            )}
        </div>
    );
};