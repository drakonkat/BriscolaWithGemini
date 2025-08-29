/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language, Waifu, GameplayMode } from '../core/types';
import { WaifuSelector } from './WaifuSelector';
import { CachedImage } from './CachedImage';

interface MenuProps {
    language: Language;
    gameplayMode: GameplayMode;
    isChatEnabled: boolean;
    waitForWaifuResponse: boolean;
    backgroundUrl: string;
    waifuCoins: number;
    onLanguageChange: (lang: Language) => void;
    onGameplayModeChange: (mode: GameplayMode) => void;
    onChatEnabledChange: (enabled: boolean) => void;
    onWaitForWaifuResponseChange: (enabled: boolean) => void;
    onWaifuSelected: (waifu: Waifu | null) => void;
    onShowRules: () => void;
    onShowPrivacy: () => void;
    onShowTerms: () => void;
    onShowSupport: () => void;
    onRefreshBackground: () => void;
    onShowGallery: () => void;
}

export const Menu = ({ 
    language, 
    gameplayMode,
    isChatEnabled,
    waitForWaifuResponse,
    backgroundUrl, 
    waifuCoins,
    onLanguageChange, 
    onGameplayModeChange,
    onChatEnabledChange,
    onWaitForWaifuResponseChange,
    onWaifuSelected, 
    onShowRules, 
    onShowPrivacy, 
    onShowTerms, 
    onShowSupport, 
    onRefreshBackground,
    onShowGallery,
}: MenuProps) => {
    const T = translations[language];

    return (
        <div className="menu">
            <CachedImage imageUrl={backgroundUrl} alt="Game background" className="menu-background" />
            <div className="menu-content">
                <div className="waifu-coins-display">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 16.5v-1c0-.83.67-1.5 1.5-1.5H12v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5H12V7h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1H9z"/>
                    </svg>
                    <span>{waifuCoins}</span>
                </div>
                <div className="menu-title-container">
                    <h1>{T.title}</h1>
                    <button className="rules-button" onClick={onShowRules} aria-label={T.rulesTitle}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        </svg>
                    </button>
                    <button className="rules-button" onClick={onShowSupport} aria-label={T.supportModal.title}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                    <a href="mailto:service@tnl.one" className="rules-button" aria-label={T.supportEmail}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                    </a>
                    <button className="rules-button" onClick={onRefreshBackground} aria-label={T.refreshBackground}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
                    </button>
                </div>
                <p>{T.subtitle}</p>
                <p>{T.projectDescription1}</p>
                <p>{T.projectDescription2}</p>

                <div className="gallery-promo-container">
                    <button className="gallery-promo-button" onClick={onShowGallery}>
                        {T.gallery.promoButton}
                    </button>
                </div>
                
                <WaifuSelector language={language} onWaifuSelected={onWaifuSelected} />

                <div className="menu-settings">
                    <div className="settings-selector">
                        <label htmlFor="chat-toggle">{T.toggleChatLabel}:</label>
                        <label className="toggle-switch">
                            <input id="chat-toggle" type="checkbox" checked={isChatEnabled} onChange={(e) => onChatEnabledChange(e.target.checked)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className={`settings-selector ${!isChatEnabled ? 'disabled' : ''}`}>
                        <label htmlFor="wait-toggle">{T.toggleWaitForWaifuLabel}:</label>
                        <label className="toggle-switch">
                            <input id="wait-toggle" type="checkbox" checked={waitForWaifuResponse} onChange={(e) => onWaitForWaifuResponseChange(e.target.checked)} disabled={!isChatEnabled} />
                            <span className="slider"></span>
                        </label>
                    </div>
                     <div className="settings-selector">
                        <label htmlFor="game-mode-select">{T.gameModeLabel}:</label>
                        <select id="game-mode-select" value={gameplayMode} onChange={(e) => onGameplayModeChange(e.target.value as GameplayMode)}>
                            <option value="classic">{T.gameModeClassic}</option>
                            <option value="roguelike" disabled title={T.comingSoonTooltip}>
                                {T.gameModeRoguelike}{T.comingSoon}
                            </option>
                        </select>
                    </div>
                     <div className="settings-selector">
                        <label htmlFor="language-select">{T.language}:</label>
                        <select id="language-select" value={language} onChange={(e) => onLanguageChange(e.target.value as Language)}>
                            <option value="it">Italiano</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>

                <footer className="menu-footer">
                    <button className="link-button" onClick={onShowPrivacy}>{T.privacyPolicy.linkText}</button>
                    <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                    <button className="link-button" onClick={onShowTerms}>{T.termsAndConditions.linkText}</button>
                </footer>
            </div>
        </div>
    );
};