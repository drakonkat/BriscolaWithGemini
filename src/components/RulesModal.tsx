/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import { VALUES_IT } from '../core/constants';
import type { Language } from '../core/types';

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

export const RulesModal = ({ isOpen, onClose, language }: RulesModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language];
    const pointValues = [
        { value: T.values[VALUES_IT.indexOf('Asso')], points: 11 },
        { value: T.values[VALUES_IT.indexOf('3')], points: 10 },
        { value: T.values[VALUES_IT.indexOf('Re')], points: 4 },
        { value: T.values[VALUES_IT.indexOf('Cavallo')], points: 3 },
        { value: T.values[VALUES_IT.indexOf('Fante')], points: 2 },
    ];

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{T.rulesTitle}</h2>
                <p>{T.winCondition}</p>
                <ul className="rules-points-list">
                    {pointValues.map(item => (
                        <li key={item.value} className="rules-point-item">
                            <span>{item.value}</span>
                            <span>{T.scorePoints(item.points)}</span>
                        </li>
                    ))}
                    <li className="rules-point-item">
                        <span>{T.otherCards} (7, 6, 5, 4, 2)</span>
                        <span>{T.scorePoints(0)}</span>
                    </li>
                </ul>
                <div className="modal-actions">
                    <button onClick={onClose}>{T.close}</button>
                </div>
            </div>
        </div>
    );
};