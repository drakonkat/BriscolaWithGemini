

import React from 'react';
import { translations } from '../../core/translations';
import type { Language } from '../../core/types';
import { WaifuCoinIcon } from '../icons/WaifuCoinIcon';
import { GalleryIcon } from '../icons/GalleryIcon';
import { CraftingIcon } from '../icons/CraftingIcon';
import { ConvertIcon } from '../icons/ConvertIcon';

interface GalleryTabsProps {
    language: Language;
    activeTab: 'gacha' | 'backgrounds' | 'crafting' | 'convert';
    setActiveTab: (tab: 'gacha' | 'backgrounds' | 'crafting' | 'convert') => void;
}

export const GalleryTabs: React.FC<GalleryTabsProps> = ({ language, activeTab, setActiveTab }) => {
    const T = translations[language];
    const T_gallery = T.gallery;

    return (
        <div className="gallery-tabs" data-tutorial-id="gallery-tabs">
            <button className={`tab-button ${activeTab === 'gacha' ? 'active' : ''}`} onClick={() => setActiveTab('gacha')} aria-label={T_gallery.gachaTabTitle}>
                <WaifuCoinIcon height="24px" width="24px" />
                <span>{T_gallery.gachaTabTitle}</span>
            </button>
            <button className={`tab-button ${activeTab === 'backgrounds' ? 'active' : ''}`} onClick={() => setActiveTab('backgrounds')} aria-label={T_gallery.backgroundsTabTitle}>
                <GalleryIcon height="24px" width="24px" />
                <span>{T_gallery.backgroundsTabTitle}</span>
            </button>
            <button className={`tab-button ${activeTab === 'crafting' ? 'active' : ''}`} onClick={() => setActiveTab('crafting')} aria-label={T_gallery.craftingTitle}>
                <CraftingIcon height="24px" width="24px" />
                <span>{T_gallery.craftingTitle}</span>
            </button>
            <button className={`tab-button ${activeTab === 'convert' ? 'active' : ''}`} onClick={() => setActiveTab('convert')} aria-label={T_gallery.convertTitle}>
                <ConvertIcon height="24px" width="24px" />
                <span>{T_gallery.convertTitle}</span>
            </button>
        </div>
    );
};