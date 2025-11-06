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
}

export const PackSelectionScreen: React.FC<PackSelectionScreenProps> = observer(({ language, onSelectPack }) => {
    const T = translations[language];
    const T_gallery = T.gallery;

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
                        onClick={() => onSelectPack(pack.id)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectPack(pack.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${T_gallery.selectPack} ${pack.title}`}
                    >
                        <CachedImage imageUrl={pack.imageUrl} alt={pack.title} className="pack-card-image" />
                        <div className="pack-card-details">
                            <h3>{pack.title}</h3>
                            <p>{pack.description}</p>
                            <button className="select-pack-button" aria-hidden="true">{T_gallery.selectPack}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});