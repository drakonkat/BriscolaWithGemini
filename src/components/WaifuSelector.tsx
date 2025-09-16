/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { translations } from '../core/translations';
import { getImageUrl } from '../core/utils';
import type { Language, Waifu } from '../core/types';
import { WAIFUS } from '../core/waifus';
import { CachedImage } from './CachedImage';

interface WaifuSelectorProps {
    language: Language;
    onWaifuSelected: (waifu: Waifu | null) => void;
    selectedWaifu: Waifu | null;
    isRandomSelected: boolean;
    disabled?: boolean;
}

export const WaifuSelector = ({ language, onWaifuSelected, selectedWaifu, isRandomSelected, disabled = false }: WaifuSelectorProps) => {
    const T = translations[language];

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;
        if (selectedName === 'random') {
            onWaifuSelected(null);
        } else {
            const waifu = WAIFUS.find(w => w.name === selectedName);
            if (waifu) {
                onWaifuSelected(waifu);
            }
        }
    };

    const selectedValue = isRandomSelected ? 'random' : selectedWaifu?.name || 'random';
    
    const avatar = selectedWaifu ? (
        <CachedImage imageUrl={getImageUrl(selectedWaifu.avatar)} alt={T.waifuAvatarAlt(selectedWaifu.name)} />
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 6.25a6.25 6.25 0 0 0-4.6 10.98c.2-.28.34-.6.4-.95.14-.77.2-1.57.14-2.43-.05-.8-.18-1.63-.4-2.45-.1-.38-.2-.77-.28-1.16-.07-.32-.1-.63-.12-.95 0-.28.02-.55.06-.82.09-.54.27-.99.5-1.39.43-.76 1.05-1.28 1.8-1.55.37-.13.76-.2 1.15-.2.43 0 .85.08 1.25.25.72.3 1.28.82 1.63 1.5.3.58.46 1.24.46 1.95 0 .3-.03.6-.08.88-.05.28-.13.56-.23.85-.09.28-.2.56-.3.85-.14.41-.28.83-.4 1.25-.13.43-.23.86-.3 1.3-.07.41-.1.83-.1 1.25 0 .23.03.45.08.66.03.14.06.28.1.41.3.92.74 1.63 1.25 2.25A6.25 6.25 0 0 0 12 6.25zM12 4c1.89 0 3.63.66 5 1.75.52.41.97.9 1.34 1.45.24.36.45.75.6 1.15.2.5.34 1.02.4 1.55.08.55.1 1.1.1 1.65s-.02 1.1-.08 1.65c-.06.53-.2 1.05-.38 1.55-.18.49-.4.95-.68 1.4-.35.56-.78 1.05-1.28 1.45-1.38 1.1-3.13 1.75-5.03 1.75s-3.65-.65-5-1.75c-.5-.4-1-1-1.35-1.5-.27-.45-.5-.9-.68-1.4-.18-.5-.32-1.02-.38-1.55-.06-1.1-.06-2.2 0-3.3.06-.53.2-1.05.4-1.55.15-.4.35-.8.6-1.15.37-.55.82-1.04 1.34-1.45C8.37 4.66 10.11 4 12 4z"/>
        </svg>
    );

    return (
        <div className="waifu-selection">
            <h2>{T.chooseOpponent}</h2>

            {/* Desktop Card Grid */}
            <div className="waifu-selector-container">
                {WAIFUS.map(waifu => (
                    <div 
                        key={waifu.name} 
                        className={`waifu-card ${selectedWaifu?.name === waifu.name ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                        onClick={disabled ? undefined : () => onWaifuSelected(waifu)} 
                        role="button" 
                        tabIndex={disabled ? -1 : 0}
                        aria-label={waifu.name}
                        aria-pressed={selectedWaifu?.name === waifu.name}
                        aria-disabled={disabled}
                    >
                        <CachedImage imageUrl={getImageUrl(waifu.avatar)} alt={T.waifuAvatarAlt(waifu.name)} />
                        <div>
                            <h3>{waifu.name}</h3>
                            <p>{waifu.personality[language]}</p>
                        </div>
                    </div>
                ))}
                <div 
                    className={`random-waifu-card ${isRandomSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={disabled ? undefined : () => onWaifuSelected(null)} 
                    role="button" 
                    tabIndex={disabled ? -1 : 0}
                    aria-label={T.randomOpponent}
                    aria-pressed={isRandomSelected}
                    aria-disabled={disabled}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 6.25a6.25 6.25 0 0 0-4.6 10.98c.2-.28.34-.6.4-.95.14-.77.2-1.57.14-2.43-.05-.8-.18-1.63-.4-2.45-.1-.38-.2-.77-.28-1.16-.07-.32-.1-.63-.12-.95 0-.28.02-.55.06-.82.09-.54.27-.99.5-1.39.43-.76 1.05-1.28 1.8-1.55.37-.13.76-.2 1.15-.2.43 0 .85.08 1.25.25.72.3 1.28.82 1.63 1.5.3.58.46 1.24.46 1.95 0 .3-.03.6-.08.88-.05.28-.13.56-.23.85-.09.28-.2.56-.3.85-.14.41-.28.83-.4 1.25-.13.43-.23.86-.3 1.3-.07.41-.1.83-.1 1.25 0 .23.03.45.08.66.03.14.06.28.1.41.3.92.74 1.63 1.25 2.25A6.25 6.25 0 0 0 12 6.25zM12 4c1.89 0 3.63.66 5 1.75.52.41.97.9 1.34 1.45.24.36.45.75.6 1.15.2.5.34 1.02.4 1.55.08.55.1 1.1.1 1.65s-.02 1.1-.08 1.65c-.06.53-.2 1.05-.38 1.55-.18.49-.4.95-.68 1.4-.35.56-.78 1.05-1.28 1.45-1.38 1.1-3.13 1.75-5.03 1.75s-3.65-.65-5-1.75c-.5-.4-1-1-1.35-1.5-.27-.45-.5-.9-.68-1.4-.18-.5-.32-1.02-.38-1.55-.06-1.1-.06-2.2 0-3.3.06-.53.2-1.05.4-1.55.15-.4.35-.8.6-1.15.37-.55.82-1.04 1.34-1.45C8.37 4.66 10.11 4 12 4z"/>
                    </svg>
                    <h3>{T.randomOpponent}</h3>
                </div>
            </div>

            {/* Mobile Dropdown */}
            <div className="waifu-selector-mobile">
                <div className="waifu-selector-mobile-picker">
                    <div className="waifu-selector-mobile-avatar">
                        {avatar}
                    </div>
                    <select 
                        value={selectedValue} 
                        onChange={handleSelectChange}
                        disabled={disabled}
                        aria-label={T.chooseOpponent}
                    >
                        <option value="random">{T.randomOpponent}</option>
                        {WAIFUS.map(waifu => (
                            <option key={waifu.name} value={waifu.name}>{waifu.name}</option>
                        ))}
                    </select>
                </div>
                <p className="waifu-personality">
                    {selectedWaifu ? selectedWaifu.personality[language] : ''}
                </p>
            </div>
        </div>
    );
};