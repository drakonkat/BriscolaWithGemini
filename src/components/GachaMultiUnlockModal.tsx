/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';
import type { Language } from '../core/types';

interface GachaMultiUnlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

export const GachaMultiUnlockModal = observer(({ isOpen, onClose, language }: GachaMultiUnlockModalProps) => {
    const { gachaStore } = useStores();
    const { multiGachaResults, lastMultiGachaRefund } = gachaStore;
    const T = translations[language];

    if (!isOpen) {
        return null;
    }

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="gacha-multi-unlock-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <h2>{T.gallery.gachaMultiResultTitle}</h2>
                <p className="refund-info">
                    {T.gallery.gachaMultiUnlocked(multiGachaResults.length)}
                    {lastMultiGachaRefund > 0 && ` ${T.gallery.gachaMultiRefund(lastMultiGachaRefund)}`}
                </p>
                
                <div className="multi-unlock-grid">
                    {multiGachaResults.map((item, index) => (
                        <div key={index} className="multi-unlock-item">
                            <CachedImage imageUrl={item.url} alt={`${T.gallery.backgroundAlt} ${index + 1}`} loading="lazy" />
                            <div className={`multi-unlock-rarity rarity-${item.rarity.toLowerCase()}`}>{item.rarity}</div>
                        </div>
                    ))}
                </div>

                 <div className="modal-actions">
                    <button onClick={onClose}>{T.close}</button>
                </div>
            </div>
        </div>
    );
});
