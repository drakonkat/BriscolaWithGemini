/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language } from '../core/types';
import { CachedImage } from './CachedImage';

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    backgrounds: string[];
    unlockedBackgrounds: string[];
    waifuCoins: number;
    onGachaRoll: () => void;
    onImageSelect: (url: string) => void;
}

export const GalleryModal = ({ isOpen, onClose, language, backgrounds, unlockedBackgrounds, waifuCoins, onGachaRoll, onImageSelect }: GalleryModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language];
    const GACHA_COST = 100;
    const allUnlocked = unlockedBackgrounds.length >= backgrounds.length;
    const canAfford = waifuCoins >= GACHA_COST;

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{T.gallery.title}</h2>
                <div className="gallery-grid">
                    {backgrounds.map((url, index) => {
                        const isUnlocked = unlockedBackgrounds.includes(url);
                        return (
                            <div 
                                key={index} 
                                className={`gallery-item ${isUnlocked ? '' : 'locked'}`} 
                                onClick={isUnlocked ? () => onImageSelect(url) : undefined}
                                onKeyDown={isUnlocked ? (e) => (e.key === 'Enter' || e.key === ' ') && onImageSelect(url) : undefined}
                                role={isUnlocked ? 'button' : 'img'}
                                tabIndex={isUnlocked ? 0 : -1}
                                aria-label={isUnlocked ? `${T.gallery.backgroundAlt} ${index + 1}. ${T.gallery.fullscreenView}` : T.gallery.locked}
                            >
                                {isUnlocked ? (
                                    <CachedImage imageUrl={url} alt={`${T.gallery.backgroundAlt} ${index + 1}`} loading="lazy" />
                                ) : (
                                    <div className="locked-overlay">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="modal-actions">
                    <button onClick={onGachaRoll} disabled={allUnlocked || !canAfford}>
                        {T.gallery.gachaButton}
                    </button>
                    <button onClick={onClose} className="button-secondary">{T.close}</button>
                </div>
            </div>
        </div>
    );
};