/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import type { Waifu } from '../core/types';
import { WaifuSelector } from './WaifuSelector';
import { CachedImage } from './CachedImage';

export const Menu = observer(() => {
    const { gameSettingsStore, gameStateStore, uiStore, gachaStore } = useStores();
    const { language, gameplayMode, difficulty, isChatEnabled, waitForWaifuResponse, cardDeckStyle, isDiceAnimationEnabled } = gameSettingsStore;
    const { hasSavedGame } = gameStateStore;
    const { menuBackgroundUrl } = uiStore;
    const { waifuCoins } = gachaStore;

    const T = translations[language];
    const [selectedWaifu, setSelectedWaifu] = useState<Waifu | null>(null);
    const [isRandomCardSelected, setIsRandomCardSelected] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const moreMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (gameplayMode === 'roguelike') {
            setSelectedWaifu(null);
            setIsRandomCardSelected(true);
        } else {
            setSelectedWaifu(null);
            setIsRandomCardSelected(false);
        }
    }, [gameplayMode]);

    const handleWaifuSelection = (waifu: Waifu | null) => {
        if (waifu === null) {
            setSelectedWaifu(null);
            setIsRandomCardSelected(true);
        } else {
            setSelectedWaifu(waifu);
            setIsRandomCardSelected(false);
        }
    };
    
    return (
        <div className="menu">
            <CachedImage imageUrl={menuBackgroundUrl} alt="Game background" className="menu-background" />
            <div className="menu-content" data-tutorial-id="welcome">
                <div className="menu-title-container">
                    <div className="waifu-coins-display">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 16.5v-1c0-.83.67-1.5 1.5-1.5H12v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5H12V7h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1H9z"/>
                        </svg>
                        <span>{waifuCoins}</span>
                    </div>

                    <h1>{T.title}</h1>

                    <div className="menu-actions" ref={moreMenuRef}>
                        <button className="more-menu-button" onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} aria-label="More options" aria-haspopup="true" aria-expanded={isMoreMenuOpen}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"></path></svg>
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
                            <button className="rules-button" onClick={() => { uiStore.refreshMenuBackground(); setIsMoreMenuOpen(false); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                                </svg>
                                <span>{T.refreshBackground}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <p className="menu-subtitle">{T.subtitle}</p>
                
                <div className="start-game-container" data-tutorial-id="start-game">
                    {hasSavedGame && (
                        <button
                            className="start-game-button"
                            onClick={gameStateStore.resumeGame}
                        >
                            {T.resumeGame}
                        </button>
                    )}
                    <button 
                        className="start-game-button" 
                        onClick={() => gameStateStore.startGame(selectedWaifu)} 
                        disabled={false}
                    >
                        {T.startGame}
                    </button>
                </div>
                
                <div className="gallery-promo-container" data-tutorial-id="gallery">
                    <button className="gallery-promo-button" onClick={() => uiStore.openModal('gallery')}>
                        {T.gallery.promoButton}
                    </button>
                </div>
                
                 <div data-tutorial-id="waifu-selector">
                    <WaifuSelector 
                        language={language}
                        onWaifuSelected={handleWaifuSelection}
                        selectedWaifu={selectedWaifu}
                        isRandomSelected={isRandomCardSelected}
                        disabled={gameplayMode === 'roguelike'}
                    />
                </div>
                
                 <div className="menu-primary-settings">
                    <div className="settings-selector" data-tutorial-id="game-mode">
                        <label htmlFor="game-mode-select">{T.gameModeLabel}:</label>
                        <select 
                            id="game-mode-select" 
                            value={gameplayMode} 
                            onChange={(e) => gameSettingsStore.setGameplayMode(e.target.value as any)}
                        >
                            <option value="classic">{T.gameModeClassic}</option>
                            <option value="roguelike">{T.gameModeRoguelike}</option>
                        </select>
                    </div>
                     <div className="settings-selector" data-tutorial-id="difficulty">
                        <label htmlFor="difficulty-select">{T.difficultyLabel}:</label>
                        <select id="difficulty-select" value={difficulty} onChange={(e) => gameSettingsStore.setDifficulty(e.target.value as any)}>
                            <option value="easy">{T.difficultyEasy}</option>
                            <option value="medium">{T.difficultyMedium}</option>
                            <option value="hard">{T.difficultyHard}</option>
                            <option value="nightmare">{T.difficultyNightmare}</option>
                        </select>
                    </div>
                    <div className="settings-selector">
                        <label htmlFor="deck-style-select">{T.cardDeckStyleLabel}:</label>
                        <select
                            id="deck-style-select"
                            value={cardDeckStyle}
                            onChange={(e) => gameSettingsStore.setCardDeckStyle(e.target.value as any)}
                        >
                            <option value="classic">{T.cardDeckStyleClassic}</option>
                            <option value="poker">{T.cardDeckStylePoker}</option>
                        </select>
                    </div>
                </div>

                <div className="menu-settings">
                    <div className="settings-selector">
                        <label htmlFor="chat-toggle">{T.toggleChatLabel}:</label>
                        <label className="toggle-switch">
                            <input id="chat-toggle" type="checkbox" checked={isChatEnabled} onChange={(e) => gameSettingsStore.setIsChatEnabled(e.target.checked)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className={`settings-selector ${!isChatEnabled ? 'disabled' : ''}`}>
                        <label htmlFor="wait-toggle">{T.toggleWaitForWaifuLabel}:</label>
                        <label className="toggle-switch">
                            <input id="wait-toggle" type="checkbox" checked={waitForWaifuResponse} onChange={(e) => {
                                gameSettingsStore.setWaitForWaifuResponse(e.target.checked);
                                if (!e.target.checked) uiStore.showSnackbar(T.fastModeEnabled, 'success');
                            }} disabled={!isChatEnabled} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    {gameplayMode === 'roguelike' && (
                        <div className="settings-selector">
                            <label htmlFor="dice-animation-toggle">{T.diceAnimationLabel}:</label>
                            <label className="toggle-switch">
                                <input id="dice-animation-toggle" type="checkbox" checked={isDiceAnimationEnabled} onChange={(e) => gameSettingsStore.setIsDiceAnimationEnabled(e.target.checked)} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    )}
                     <div className="settings-selector">
                        <label htmlFor="language-select">{T.language}:</label>
                        <select id="language-select" value={language} onChange={(e) => gameSettingsStore.setLanguage(e.target.value as any)}>
                            <option value="it">Italiano</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>

                <footer className="menu-footer">
                    <div>
                        <button className="link-button" onClick={() => uiStore.openModal('privacy')}>{T.privacyPolicy.linkText}</button>
                        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                        <button className="link-button" onClick={() => uiStore.openModal('terms')}>{T.termsAndConditions.linkText}</button>
                    </div>
                    {process.env.APP_VERSION && <div className="app-version">v{process.env.APP_VERSION}</div>}
                </footer>
            </div>
        </div>
    );
});