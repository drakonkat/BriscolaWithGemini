/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language, Waifu } from '../core/types';
import { WaifuSelector } from './WaifuSelector';

interface MenuProps {
    language: Language;
    backgroundUrl: string;
    onLanguageChange: (lang: Language) => void;
    onWaifuSelected: (waifu: Waifu | null) => void;
    onShowRules: () => void;
    onShowPrivacy: () => void;
    onShowTerms: () => void;
}

export const Menu = ({ language, backgroundUrl, onLanguageChange, onWaifuSelected, onShowRules, onShowPrivacy, onShowTerms }: MenuProps) => {
    const T = translations[language];

    return (
        <div className="menu">
            <img src={backgroundUrl} alt="Game background" className="menu-background" />
            <div className="menu-content">
                <div className="menu-title-container">
                    <h1>{T.title}</h1>
                    <button className="rules-button" onClick={onShowRules} aria-label={T.rulesTitle}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        </svg>
                    </button>
                </div>
                <p>{T.subtitle}</p>
                
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