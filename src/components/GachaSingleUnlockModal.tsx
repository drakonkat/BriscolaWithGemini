/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';
import type { Language } from '../core/types';
import { CloseIcon } from './icons/CloseIcon';

interface GachaSingleUnlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

export const GachaSingleUnlockModal = observer(({ isOpen, onClose, language }: GachaSingleUnlockModalProps) => {
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
                    <CloseIcon />
                </button>
                <h2 className={`unlocked-rarity-banner rarity-${rarity.toLowerCase()}`}>
                    {T.gallery.rarityUnlocked(rarity)}
                </h2>
                <CachedImage imageUrl={lastGachaResult.url} alt={T.gallery.backgroundAlt} className="unlocked-image" />
            </div>
        </div>
    );
});