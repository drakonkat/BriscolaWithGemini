/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import { getImageUrl } from '../core/utils';
import type { Language, Waifu } from '../core/types';
import { CachedImage } from './CachedImage';
import { CloseIcon } from './icons/CloseIcon';
import { RandomWaifuIcon } from './icons/RandomWaifuIcon';

interface WaifuDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    waifu: Waifu;
    language: Language;
}

export const WaifuDetailsModal = ({ isOpen, onClose, waifu, language }: WaifuDetailsModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language];
    const isRandom = waifu.name === T.randomOpponent;

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal waifu-details-modal"  onClick={(e) => e.stopPropagation()}>
                    <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <CloseIcon />
                </button>
            
                {isRandom ? (
                    <div className="waifu-details-image random-avatar-placeholder">
                        <RandomWaifuIcon />
                    </div>
                ) : (
                    <CachedImage imageUrl={getImageUrl(waifu.avatar)} alt={waifu.name} className="waifu-details-image" />
                )}
                <h3>{waifu.name}</h3>
                <p>{waifu.fullDescription[language]}</p>
                <div className="modal-actions">
                    <button onClick={onClose}>{T.close}</button>
                </div>
            </div>
        </div>
    );
};