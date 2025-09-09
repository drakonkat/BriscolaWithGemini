/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';
import type { Language } from '../core/types';

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
                <h2 className={`unlocked-rarity-banner rarity-${rarity.toLowerCase()}`}>
                    {T.gallery.rarityUnlocked(rarity)}
                </h2>
                <CachedImage imageUrl={lastGachaResult.url} alt={T.gallery.backgroundAlt} className="unlocked-image" />
                <div className="modal-actions">
                    <button onClick={onClose}>{T.close}</button>
                </div>
            </div>
        </div>
    );
});
