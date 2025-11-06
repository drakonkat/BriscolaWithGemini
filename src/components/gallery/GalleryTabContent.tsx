import React from 'react';
import { observer } from 'mobx-react-lite';
import { GachaControls } from './GachaControls';
import { BackgroundGrid } from './BackgroundGrid';
import { useStores } from '../../stores';
import type { Language } from '../../core/types';
import { PackSelectionScreen } from './PackSelectionScreen'; // Import PackSelectionScreen
import { translations } from '../../core/translations';

type BackgroundItem = {
    url: string;
    rarity: 'R' | 'SR' | 'SSR';
};

interface GalleryTabContentProps {
    language: Language;
    backgrounds: BackgroundItem[];
    unlockedBackgrounds: string[];
    waifuCoins: number;
    onGachaRoll: () => void;
    onGachaMultiRoll: () => void;
    hasRolledGacha: boolean;
    isRolling: boolean;
    onImageSelect: (url: string) => void;
}

export const GalleryTabContent: React.FC<GalleryTabContentProps> = observer(({ language, backgrounds, unlockedBackgrounds, waifuCoins, onGachaRoll, onGachaMultiRoll, hasRolledGacha, isRolling, onImageSelect }) => {
    const { gachaStore } = useStores(); // Access gachaStore to control view mode
    const T = translations[language];
    const allUnlocked = unlockedBackgrounds.length >= backgrounds.length;

    const handleSelectPack = (packId: string) => {
        // For now, always go to content view for any selected pack.
        // In the future, this could load specific content based on packId.
        gachaStore.setGalleryTabContentMode('content');
    };

    return (
        <div className="gallery-tab-content">
            {gachaStore.galleryTabContentMode === 'packSelection' ? (
                <PackSelectionScreen language={language} onSelectPack={handleSelectPack} />
            ) : (
                <>
                    <button 
                        className="back-to-packs-button" 
                        onClick={() => gachaStore.setGalleryTabContentMode('packSelection')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                        </svg>
                        <span>{T.gallery.backToPackPicker}</span>
                    </button>
                    <div className="gallery-content-wrapper"> {/* NEW WRAPPER */}
                        <GachaControls
                            language={language}
                            waifuCoins={waifuCoins}
                            onGachaRoll={onGachaRoll}
                            onGachaMultiRoll={onGachaMultiRoll}
                            hasRolledGacha={hasRolledGacha}
                            isRolling={isRolling}
                            allUnlocked={allUnlocked}
                        />
                        <BackgroundGrid
                            language={language}
                            backgrounds={backgrounds}
                            unlockedBackgrounds={unlockedBackgrounds}
                            onImageSelect={onImageSelect}
                        />
                    </div>
                </>
            )}
        </div>
    );
});