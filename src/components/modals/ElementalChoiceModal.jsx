/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { CardView } from './CardView';
import { translations } from '../core/translations';

export const ElementalChoiceModal = ({ card, onConfirm, onCancel, lang, cardDeckStyle }) => {
    const T = translations[lang];

    return (
        <div className="elemental-choice-overlay" onClick={onCancel}>
            <div className="elemental-choice-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{T.elementalChoiceTitle}</h3>
                <div className="elemental-choice-actions">
                    <CardView card={card} lang={lang} cardDeckStyle={cardDeckStyle} />
                    <div className="button-group">
                        <button onClick={() => onConfirm(true)} className="button-primary">
                            {T.activatePower}
                        </button>
                        <button onClick={() => onConfirm(false)} className="button-secondary">
                            {T.playNormally}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};