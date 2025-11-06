import React from 'react';
import { observer } from 'mobx-react-lite';
import { BackgroundGrid } from './BackgroundGrid';
import { useStores } from '../../stores';
import type { Language } from '../../core/types';
import { PackSelectionScreen } from './PackSelectionScreen';
import { translations } from '../../core/translations';

type BackgroundItem = {
    url: string;
    rarity: 'R' | 'SR' | 'SSR';
};

interface GachaTabContentProps { // Renamed from GalleryTabContentProps
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

export const GachaTabContent: React.FC<GachaTabContentProps> = observer(({ language, backgrounds, unlockedBackgrounds, waifuCoins, onGachaRoll, onGachaMultiRoll, hasRolledGacha, isRolling, onImageSelect }) => {
    const { gachaStore } = useStores();
    const T = translations[language];
    const allUnlocked = unlockedBackgrounds.length >= backgrounds.length;

    const handleSelectPack = (packId: string) => {
        // This function is still here for conceptual clarity, but the actual rolls
        // are now initiated directly from PackSelectionScreen.
        // After a roll, gachaStore.galleryTabContentMode will be set to 'gachaResults'.
        // FIX: setGalleryTabContentMode is a method on gachaStore.
        gachaStore.setGalleryTabContentMode('gachaResults');
    };

    return (
        <div className="gallery-tab-content">
            {gachaStore.galleryTabContentMode === 'gachaPacks' ? (
                <PackSelectionScreen 
                    language={language} 
                    onSelectPack={handleSelectPack} // This will now typically set mode to 'gachaResults'
                    waifuCoins={waifuCoins}
                    onGachaMultiRoll={onGachaMultiRoll}
                    onGachaRoll={onGachaRoll} // Pass single roll handler
                    isRolling={isRolling}
                    allUnlocked={allUnlocked}
                    hasRolledGacha={hasRolledGacha}
                />
            ) : ( // gachaStore.galleryTabContentMode === 'gachaResults'
                <>
                    <button 
                        className="back-to-packs-button" 
                        // FIX: setGalleryTabContentMode is a method on gachaStore.
                        onClick={() => gachaStore.setGalleryTabContentMode('gachaPacks')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                        </svg>
                        <span>{T.gallery.backToPackPicker}</span>
                    </button>
                    <div className="gallery-content-wrapper">
                         {/* When in gachaResults mode, display the grid of backgrounds with a way to go back */}
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