/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import { getImageUrl } from '../core/utils';
import type { Language, Waifu } from '../core/types';
import { CachedImage } from './CachedImage';

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

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="waifu-details-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <CachedImage imageUrl={getImageUrl(waifu.avatar)} alt={waifu.name} className="waifu-details-image" />
                <h3>{waifu.name}</h3>
                <p>{waifu.fullDescription[language]}</p>
                <button onClick={onClose}>{T.close}</button>
            </div>
        </div>
    );
};