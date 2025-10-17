/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { CachedImage } from '../shared/CachedImage';
import { getImageUrl } from '../../core/utils.js';

/**
 * WaifuDetails - A microcomponent for displaying waifu details with collapsible functionality
 *
 * @param {Object} props - Component props
 * @param {Object|null} props.selectedWaifu - Currently selected waifu object
 * @param {boolean} props.isRandomSelected - Whether random opponent is selected
 * @param {string} props.difficulty - Current difficulty level for styling
 * @param {string} props.language - Current language for translations
 * @param {Object} props.translations - Translation object (T)
 * @param {boolean} props.isOpen - Whether the details section is expanded
 * @param {Function} props.onToggle - Handler for toggle button click
 */
export const WaifuDetails = ({
    selectedWaifu,
    isRandomSelected,
    difficulty,
    language,
    translations: T,
    isOpen,
    onToggle
}) => {
    const getWaifuTitle = () => {
        if (selectedWaifu) {
            return T.waifuDetails(selectedWaifu.name);
        }
        if (isRandomSelected) {
            return T.waifuDetails(T.randomOpponent);
        }
        return T.waifuDetails('...');
    };

    const renderWaifuDisplay = () => {
        if (selectedWaifu) {
            return (
                <div className="featured-waifu-display fade-in-up">
                    <CachedImage
                        imageUrl={getImageUrl(selectedWaifu.avatar)}
                        alt={selectedWaifu.name}
                        className="featured-waifu-avatar"
                    />
                    <p className="featured-waifu-desc">
                        {selectedWaifu.fullDescription[language]}
                    </p>
                </div>
            );
        }

        if (isRandomSelected) {
            return (
                <div className="featured-waifu-display random fade-in-up">
                    <div className="featured-waifu-avatar random-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 6.25a6.25 6.25 0 0 0-4.6 10.98c.2-.28.34-.6.4-.95.14-.77.2-1.57.14-2.43-.05-.8-.18-1.63-.4-2.45-.1-.38-.2-.77-.28-1.16-.07-.32-.1-.63-.12-.95 0-.28.02-.55.06-.82.09-.54.27-.99.5-1.39.43-.76 1.05-1.28 1.8-1.55.37-.13.76-.2 1.15-.2.43 0 .85.08 1.25.25.72.3 1.28.82 1.63 1.5.3.58.46 1.24.46 1.95 0 .3-.03.6-.08.88-.05.28-.13.56-.23.85-.09.28-.2.56-.3.85-.14.41-.28.83-.4 1.25-.13.43-.23.86-.3 1.3-.07.41-.1.83-.1 1.25 0 .23.03.45.08.66.03.14.06.28.1.41.3.92.74 1.63 1.25 2.25A6.25 6.25 0 0 0 12 6.25zM12 4c1.89 0 3.63.66 5 1.75.52.41.97.9 1.34 1.45.24.36.45.75.6 1.15.2.5.34 1.02.4 1.55.08.55.1 1.1.1 1.65s-.02 1.1-.08 1.65c-.06.53-.2 1.05-.38 1.55-.18.49-.4.95-.68 1.4-.35.56-.78 1.05-1.28 1.45-1.38 1.1-3.13 1.75-5.03 1.75s-3.65-.65-5-1.75c-.5-.4-1-1-1.35-1.5-.27-.45-.5-.9-.68-1.4-.18-.5-.32-1.02-.38-1.55-.06-1.1-.06-2.2 0-3.3.06-.53.2-1.05.4-1.55.15-.4.35-.8.6-1.15.37-.55.82-1.04 1.34-1.45C8.37 4.66 10.11 4 12 4z"/>
                        </svg>
                    </div>
                    <p className="featured-waifu-desc">{T.randomOpponentDesc}</p>
                </div>
            );
        }

        return <div className="featured-waifu-placeholder" />;
    };

    return (
        <div className="menu-section">
            <button
                className="menu-section-header"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <h2>{getWaifuTitle()}</h2>
                <span className={`collapse-icon ${isOpen ? 'open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                        <path d="M0 0h24v24H0V0z" fill="none"/>
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                    </svg>
                </span>
            </button>
            <div className={`collapsible-content ${isOpen ? 'open' : ''}`}>
                <div>
                    <div className={`featured-waifu-container difficulty-${difficulty}`}>
                        {renderWaifuDisplay()}
                    </div>
                </div>
            </div>
        </div>
    );
};