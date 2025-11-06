import React from 'react';
import { translations } from '../../core/translations';
import type { Language } from '../../core/types';

interface GachaControlsProps {
    language: Language;
    waifuCoins: number;
    onGachaRoll: () => void;
    onGachaMultiRoll: () => void;
    hasRolledGacha: boolean;
    isRolling: boolean;
    allUnlocked: boolean;
}

export const GachaControls: React.FC<GachaControlsProps> = ({ language, waifuCoins, onGachaRoll, onGachaMultiRoll, hasRolledGacha, isRolling, allUnlocked }) => {
    const T = translations[language];
    const T_gallery = T.gallery;
    const GACHA_COST = 100;
    const GACHA_COST_X10 = 900;
    const isFirstRoll = !hasRolledGacha;
    const canAfford = waifuCoins >= GACHA_COST;
    const canAffordX10 = waifuCoins >= GACHA_COST_X10;
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
