/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language, Waifu } from '../core/types';
import { WaifuSelector } from './WaifuSelector';
import { CachedImage } from './CachedImage';

interface MenuProps {
    language: Language;
    backgroundUrl: string;
    onLanguageChange: (lang: Language) => void;
    onWaifuSelected: (waifu: Waifu | null) => void;
    onShowRules: () => void;
    onShowPrivacy: () => void;
    onShowTerms: () => void;
    onShowSupport: () => void;
    onRefreshBackground: () => void;
}

export const Menu = ({ language, backgroundUrl, onLanguageChange, onWaifuSelected, onShowRules, onShowPrivacy, onShowTerms, onShowSupport, onRefreshBackground }: MenuProps) => {
    const T = translations[language];

    return (
        <div className="menu">
            <CachedImage imageUrl={backgroundUrl} alt="Game background" className="menu-background" />
            <div className="menu-content">
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
                    <button className="rules-button" onClick={onRefreshBackground} aria-label={T.refreshBackground}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
                    </button>
                </div>
                <p>{T.subtitle}</p>
                <p>{T.projectDescription1}</p>
                <p>{T.projectDescription2}</p>
                
                <WaifuSelector language={language} onWaifuSelected={onWaifuSelected} />

                <div className="language-selector">
                    <label htmlFor="language-select">{T.language}:</label>
                    <select id="language-select" value={language} onChange={(e) => onLanguageChange(e.target.value as Language)}>
                        <option value="it">Italiano</option>
                        <option value="en">English</option>
                    </select>
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
