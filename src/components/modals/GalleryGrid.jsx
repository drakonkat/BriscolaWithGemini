/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { GalleryItem } from './GalleryItem';

export const GalleryGrid = ({ backgrounds, unlockedBackgrounds, T_gallery, onImageSelect }) => (
    <div className="gallery-grid">
        {backgrounds.map((item, index) => (
            <GalleryItem
                key={index}
                item={item}
                index={index}
                isUnlocked={unlockedBackgrounds.includes(item.url)}
                T_gallery={T_gallery}
                onImageSelect={onImageSelect}
            />
        ))}
    </div>
);