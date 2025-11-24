/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useEffect } from 'react';
import { translations } from '../core/translations';
import { getImageUrl } from '../core/utils';
import type { Language, Waifu } from '../core/types';
import { WAIFUS } from '../core/waifus';
import { CachedImage } from './CachedImage';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { RandomWaifuIcon } from './icons/RandomWaifuIcon';

interface WaifuSelectorProps {
    language: Language;
    onWaifuSelected: (waifu: Waifu | null) => void;
    selectedWaifu: Waifu | null;
    isRandomSelected: boolean;
    disabled?: boolean;
}

export const WaifuSelector = ({ language, onWaifuSelected, selectedWaifu, isRandomSelected, disabled = false }: WaifuSelectorProps) => {
    const T = translations[language];
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const selectedIndex = selectedWaifu
            ? WAIFUS.findIndex(w => w.name === selectedWaifu.name)
            : isRandomSelected ? WAIFUS.length : -1;

        if (selectedIndex !== -1 && cardRefs.current[selectedIndex]) {
            const selectedCard = cardRefs.current[selectedIndex];
            if (selectedCard) {
                const scrollLeft = selectedCard.offsetLeft + (selectedCard.offsetWidth / 2) - (container.offsetWidth / 2);
                
                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [selectedWaifu, isRandomSelected]);

    const changeWaifuSelection = (direction: number) => {
        if (disabled) return;
    
        const items = [...WAIFUS, null]; // null represents the random card
        const totalItems = items.length;
    
        const currentIndex = isRandomSelected
            ? totalItems - 1
            : selectedWaifu
            ? WAIFUS.findIndex(w => w.name === selectedWaifu.name)
            : 0; 
        
        const newIndex = (currentIndex + direction + totalItems) % totalItems;
        onWaifuSelected(items[newIndex]);
    };

    return (
        <div className="waifu-selection">
            <div className="waifu-carousel-wrapper">
                <button 
                    className="carousel-nav-button prev" 
                    onClick={() => changeWaifuSelection(-1)}
                    aria-label="Previous waifu"
                >
                    <ArrowLeftIcon height="24px" width="24px" />
                </button>

                <div className="waifu-selector-container" ref={containerRef}>
                    {WAIFUS.map((waifu, index) => (
                        <div 
                            key={waifu.name} 
                            // FIX: Changed ref from implicit return to a block to match expected void return type.
                            ref={el => { cardRefs.current[index] = el; }}
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
                        // FIX: Changed ref from implicit return to a block to match expected void return type.
                        ref={el => { cardRefs.current[WAIFUS.length] = el; }}
                        className={`random-waifu-card ${isRandomSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                        onClick={disabled ? undefined : () => onWaifuSelected(null)} 
                        role="button" 
                        tabIndex={disabled ? -1 : 0}
                        aria-label={T.randomOpponent}
                        aria-pressed={isRandomSelected}
                        aria-disabled={disabled}
                    >
                        <RandomWaifuIcon />
                        <h3>{T.randomOpponent}</h3>
                    </div>
                </div>

                <button 
                    className="carousel-nav-button next" 
                    onClick={() => changeWaifuSelection(1)}
                    aria-label="Next waifu"
                >
                    <ArrowRightIcon height="24px" width="24px" />
                </button>
            </div>
        </div>
    );
};