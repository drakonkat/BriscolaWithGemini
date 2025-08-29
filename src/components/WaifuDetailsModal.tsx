/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
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
                <CachedImage imageUrl={waifu.avatar} alt={waifu.name} className="waifu-details-image" />
                <h3>{waifu.name}</h3>
                <p>{waifu.fullDescription[language]}</p>
                <button onClick={onClose}>{T.close}</button>
            </div>
        </div>
    );
};
