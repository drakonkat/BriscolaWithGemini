/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language } from '../core/types';

interface MenuProps {
    language: Language;
    onLanguageChange: (lang: Language) => void;
    onStartGame: () => void;
}

export const Menu = ({ language, onLanguageChange, onStartGame }: MenuProps) => {
    const T = translations[language];

    return (
        <div className="menu">
            <h1>{T.title}</h1>
            <p>{T.subtitle}</p>
            <div className="language-selector">
                <label htmlFor="language-select">{T.language}:</label>
                <select id="language-select" value={language} onChange={(e) => onLanguageChange(e.target.value as Language)}>
                    <option value="it">Italiano</option>
                    <option value="en">English</option>
                </select>
            </div>
            <button onClick={onStartGame}>{T.startGame}</button>
            <div className="rules">
                <h2>{T.rulesTitle}</h2>
                <ul>
                    <li><strong>{T.values[0]}:</strong> {T.scorePoints(11)}</li>
                    <li><strong>{T.values[1]}:</strong> {T.scorePoints(10)}</li>
                    <li><strong>{T.values[2]}:</strong> {T.scorePoints(4)}</li>
                    <li><strong>{T.values[3]}:</strong> {T.scorePoints(3)}</li>
                    <li><strong>{T.values[4]}:</strong> {T.scorePoints(2)}</li>
                    <li><strong>{T.otherCards}:</strong> {T.scorePoints(0)}</li>
                </ul>
                <p className="win-condition">{T.winCondition}</p>
            </div>
        </div>
    );
};
