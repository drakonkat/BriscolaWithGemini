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

interface GachaMultiUnlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

export const GachaMultiUnlockModal = observer(({ isOpen, onClose, language }: GachaMultiUnlockModalProps) => {
    const { gachaStore } = useStores();
    const { multiGachaResults, lastMultiGachaShards } = gachaStore;
    const T = translations[language];

    if (!isOpen) {
        return null;
    }
    
    const shardsGained = [
        lastMultiGachaShards.R > 0 ? `${lastMultiGachaShards.R} R` : '',
        lastMultiGachaShards.SR > 0 ? `${lastMultiGachaShards.SR} SR` : '',
        lastMultiGachaShards.SSR > 0 ? `${lastMultiGachaShards.SSR} SSR` : '',
    ].filter(Boolean).join(', ');

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="gacha-multi-unlock-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <CloseIcon />
                </button>
                <h2>{T.gallery.gachaMultiResultTitle}</h2>
                <p className="refund-info">
                    {T.gallery.gachaMultiUnlocked(multiGachaResults.length)}
                    {shardsGained && ` ${T.gallery.gachaMultiShards(shardsGained)}`}
                </p>
                
                <div className="multi-unlock-grid">
                    {multiGachaResults.map((item, index) => (
                        <div key={index} className="multi-unlock-item">
                            <CachedImage imageUrl={item.url} alt={`${T.gallery.backgroundAlt} ${index + 1}`} loading="lazy" />
                            <div className={`multi-unlock-rarity rarity-${item.rarity.toLowerCase()}`}>{item.rarity}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});