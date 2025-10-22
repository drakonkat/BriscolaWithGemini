/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

export const GachaControls = ({ T_gallery, GACHA_COST, GACHA_COST_X10, isFirstRoll, allUnlocked, canAfford, canAffordX10, isRolling, onGachaRoll, onGachaMultiRoll }) => {
    const buttonText = isFirstRoll ? T_gallery.gachaButtonFree : T_gallery.gachaButton(GACHA_COST);

    return (
        <div className="gacha-controls" data-tutorial-id="gacha-controls">
            <button onClick={onGachaRoll} disabled={allUnlocked || (!isFirstRoll && !canAfford) || isRolling}>
                {buttonText}
            </button>
            <button onClick={onGachaMultiRoll} disabled={allUnlocked || isFirstRoll || !canAffordX10 || isRolling}>
                {T_gallery.gachaButtonX10(GACHA_COST_X10)}
            </button>
        </div>
    );
};