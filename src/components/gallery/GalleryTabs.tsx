import React from 'react';
import { translations } from '../../core/translations';
import type { Language } from '../../core/types';

interface GalleryTabsProps {
    language: Language;
    activeTab: 'gallery' | 'crafting' | 'convert';
    setActiveTab: (tab: 'gallery' | 'crafting' | 'convert') => void;
}

export const GalleryTabs: React.FC<GalleryTabsProps> = ({ language, activeTab, setActiveTab }) => {
    const T = translations[language];
    const T_gallery = T.gallery;

    return (
        <div className="gallery-tabs" data-tutorial-id="gallery-tabs">
            <button className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                <span>{T_gallery.promoButton}</span>
            </button>
            <button className={`tab-button ${activeTab === 'crafting' ? 'active' : ''}`} onClick={() => setActiveTab('crafting')}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><g><rect fill="none" height="24" width="24"/><path d="M12,2c-5.52,0-10,4.48-10,10s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8 s8,3.59,8,8S16.41,20,12,20z M14.3,13.88L12,15.4V6.5c0-0.28-0.22-0.5-0.5-0.5h-2c-0.28,0-0.5,0.22-0.5,0.5V10H8v1.5h1V15l-3.5-2.8v1.61 l3.5,2.8v1.89h1v-1.89l5-4v-1.61L14.3,13.88z"/></g></svg>
                <span>{T_gallery.craftingTitle}</span>
            </button>
            <button className={`tab-button ${activeTab === 'convert' ? 'active' : ''}`} onClick={() => setActiveTab('convert')}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>
                <span>{T_gallery.convertTitle}</span>
            </button>
        </div>
    );
};