/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PackSelection } from './PackSelection';
import { GachaControls } from './GachaControls';
import { GalleryGrid } from './GalleryGrid';

export const GalleryTabContent = ({
    packs,
    selectedPack,
    setSelectedPack,
    T_gallery,
    GACHA_COST,
    GACHA_COST_X10,
    isFirstRoll,
    allUnlocked,
    canAfford,
    canAffordX10,
    isRolling,
    onGachaRoll,
    onGachaMultiRoll,
    backgrounds,
    unlockedBackgrounds,
    onImageSelect
}) => (
    <div className="gallery-tab-content">
        <PackSelection packs={packs} selectedPack={selectedPack} setSelectedPack={setSelectedPack} />
        {selectedPack === 'Base Pack' && (
            <>
                <GachaControls
                    T_gallery={T_gallery}
                    GACHA_COST={GACHA_COST}
                    GACHA_COST_X10={GACHA_COST_X10}
                    isFirstRoll={isFirstRoll}
                    allUnlocked={allUnlocked}
                    canAfford={canAfford}
                    canAffordX10={canAffordX10}
                    isRolling={isRolling}
                    onGachaRoll={onGachaRoll}
                    onGachaMultiRoll={onGachaMultiRoll}
                />
                <GalleryGrid
                    backgrounds={backgrounds}
                    unlockedBackgrounds={unlockedBackgrounds}
                    T_gallery={T_gallery}
                    onImageSelect={onImageSelect}
                />
            </>
        )}
    </div>
);