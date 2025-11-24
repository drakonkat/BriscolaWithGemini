/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { observer } from 'mobx-react-lite';
import { translations } from '../core/translations';
import { WAIFUS } from '../core/waifus';
import { getImageUrl } from '../core/utils';
import { CachedImage } from './CachedImage';
import type { Language, Waifu } from '../core/types';
import { CloseIcon } from './icons/CloseIcon';
import { RandomWaifuIcon } from './icons/RandomWaifuIcon';

interface WaifuSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    selectedWaifu: Waifu | null;
    isRandomSelected: boolean;
    onSelect: (waifu: Waifu | null) => void;
}

export const WaifuSelectionModal = observer(({ isOpen, onClose, language, selectedWaifu, isRandomSelected, onSelect }: WaifuSelectionModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language];

    const handleSelect = (waifu: Waifu | null) => {
        onSelect(waifu);
        onClose();
    };

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="waifu-selection-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <CloseIcon />
                </button>
                <h2>{T.chooseOpponent}</h2>
                <div className="waifu-selection-grid">
                    {WAIFUS.map((waifu) => (
                        <div 
                            key={waifu.name} 
                            className={`waifu-card ${selectedWaifu?.name === waifu.name ? 'selected' : ''}`}
                            onClick={() => handleSelect(waifu)}
                            role="button" 
                            tabIndex={0}
                            aria-label={waifu.name}
                        >
                            <CachedImage imageUrl={getImageUrl(waifu.avatar)} alt={T.waifuAvatarAlt(waifu.name)} />
                            <div>
                                <h3>{waifu.name}</h3>
                                <p>{waifu.personality[language]}</p>
                            </div>
                        </div>
                    ))}
                    <div 
                        className={`random-waifu-card ${isRandomSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(null)}
                        role="button" 
                        tabIndex={0}
                        aria-label={T.randomOpponent}
                    >
                        <RandomWaifuIcon />
                        <div>
                            <h3>{T.randomOpponent}</h3>
                            <p>{T.randomOpponentDesc}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});