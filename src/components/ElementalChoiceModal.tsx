/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { CardView } from './CardView';
import { translations } from '../core/translations';
import type { Card, Language } from '../core/types';

interface ElementalChoiceModalProps {
    card: Card;
    onConfirm: (activate: boolean) => void;
    onCancel: () => void;
    lang: Language;
}

export const ElementalChoiceModal = ({ card, onConfirm, onCancel, lang }: ElementalChoiceModalProps) => {
    const T = translations[lang];

    return (
        <div className="elemental-choice-overlay" onClick={onCancel}>
            <div className="elemental-choice-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{T.elementalChoiceTitle}</h3>
                <div className="elemental-choice-actions">
                    <CardView card={card} lang={lang} />
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