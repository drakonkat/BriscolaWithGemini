import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { translations } from '../../core/translations';
import { CachedImage } from '../CachedImage';
import { getImageUrl } from '../../core/utils';
import type { Language } from '../../core/types';

interface PackSelectionScreenProps {
    language: Language;
    onSelectPack: (packId: string) => void;
    waifuCoins: number;
    onGachaRoll: () => void; // Added for single roll
    onGachaMultiRoll: () => void;
    isRolling: boolean;
    allUnlocked: boolean;
    hasRolledGacha: boolean; // Added for free first roll logic
}

export const PackSelectionScreen: React.FC<PackSelectionScreenProps> = observer(({ language, onSelectPack, waifuCoins, onGachaRoll, onGachaMultiRoll, isRolling, allUnlocked, hasRolledGacha }) => {
    const T = translations[language];
    const T_gallery = T.gallery;
    const GACHA_COST = 100;
    const GACHA_COST_X10 = 900;
    const isFirstRoll = !hasRolledGacha;
    const canAffordSingle = isFirstRoll || waifuCoins >= GACHA_COST;
    const canAffordX10 = waifuCoins >= GACHA_COST_X10;

    // For now, only the Base Pack is available
    const packs = [
        {
            id: 'base_pack',
            title: T_gallery.basePackTitle,
            description: T_gallery.basePackDescription,
            imageUrl: getImageUrl('/packs/BasePack_NoBG.png'), // Placeholder image
        },
        // Add more packs here in the future
    ];

    return (
        <div className="pack-selection-screen">
            <h2 className="pack-selection-title">{T_gallery.packSelectionTitle}</h2>
            <div className="pack-cards-container">
                {packs.map((pack) => (
                    <div
                        key={pack.id}
                        className="pack-card"
                        role="article" // Changed from button as it contains multiple buttons
                    >
                        <CachedImage imageUrl={pack.imageUrl} alt={pack.title} className="pack-card-image" />
                        <div className="pack-card-details">
                            <h3>{pack.title}</h3>
                            <p>{pack.description}</p>
                            <button 
                                className="select-pack-button" // Reuse styling class for consistency
                                onClick={onGachaRoll} // Single roll
                                disabled={allUnlocked || !canAffordSingle || isRolling}
                                style={{ marginBottom: '10px' }} // Add some spacing between buttons
                            >
                                {isFirstRoll ? T_gallery.gachaButtonFree : T_gallery.gachaButton(GACHA_COST)}
                            </button>
                            <button 
                                className="select-pack-button" 
                                onClick={onGachaMultiRoll} // Multi roll
                                disabled={allUnlocked || !canAffordX10 || isRolling}
                            >
                                {T_gallery.gachaButtonX10(GACHA_COST_X10)}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});