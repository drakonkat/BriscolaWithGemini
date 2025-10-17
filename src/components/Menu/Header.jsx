/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef, useEffect } from 'react';
import { translations } from '../../core/translations';

export const Header = ({ title, isNsfwEnabled, language, uiStore, onRefreshBackground }) => {
    const T = translations[language];
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const moreMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setIsMoreMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="menu-title-container">
            <h1>{title}</h1>

            <div className="menu-actions" ref={moreMenuRef}>
                <button
                    className="more-menu-button"
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    aria-label="More options"
                    aria-haspopup="true"
                    aria-expanded={isMoreMenuOpen}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                        <path d="M0 0h24v24H0V0z" fill="none"/>
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                </button>
                <div className={`actions-popup ${isMoreMenuOpen ? 'open' : ''}`}>
                    <button className="rules-button" onClick={() => { uiStore.openModal('rules'); setIsMoreMenuOpen(false); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        </svg>
                        <span>{T.rulesTitle}</span>
                    </button>
                    <button className="rules-button" onClick={() => { uiStore.openModal('support'); setIsMoreMenuOpen(false); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span>{T.supportModal.title}</span>
                    </button>
                    <a href="mailto:service@tnl.one" className="rules-button">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        <span>{T.supportEmail}</span>
                    </a>
                    <button className="rules-button" onClick={() => { uiStore.openModal('soundEditor'); setIsMoreMenuOpen(false); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
                        </svg>
                        <span>{T.soundEditorTitle}</span>
                    </button>
                    <button className="rules-button" onClick={() => { uiStore.openModal('settings'); setIsMoreMenuOpen(false); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l-.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59-1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22-.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                        </svg>
                        <span>{T.settingsTitle}</span>
                    </button>
                    {isNsfwEnabled && (
                        <button className="rules-button" onClick={() => { onRefreshBackground(); setIsMoreMenuOpen(false); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                            </svg>
                            <span>{T.refreshBackground}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};