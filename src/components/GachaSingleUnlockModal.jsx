/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';

export const GachaSingleUnlockModal = observer(({ isOpen, onClose, language }) => {
    const { gachaStore } = useStores();
    const { lastGachaResult } = gachaStore;
    const T = translations[language];

    if (!isOpen || !lastGachaResult) {
        return null;
    }

    const rarity = lastGachaResult.rarity;

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="gacha-unlock-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <h2 className={`unlocked-rarity-banner rarity-${rarity.toLowerCase()}`}>
                    {T.gallery.rarityUnlocked(rarity)}
                </h2>
                <CachedImage imageUrl={lastGachaResult.url} alt={T.gallery.backgroundAlt} className="unlocked-image" />
            </div>
        </div>
    );
});