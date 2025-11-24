/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { translations } from '../core/translations';
import type { Card, Language, CardDeckStyle } from '../core/types';
import { CardView } from './CardView';
import { CloseIcon } from './icons/CloseIcon';

interface BriscolaSwapModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCardSelect: (card: Card) => void;
    briscolaCard: Card | null;
    hand: Card[];
    language: Language;
    cardDeckStyle: CardDeckStyle;
}

export const BriscolaSwapModal = ({ isOpen, onClose, onCardSelect, briscolaCard, hand, language, cardDeckStyle }: BriscolaSwapModalProps) => {
    if (!isOpen || !briscolaCard) {
        return null;
    }

    const T = translations[language];

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="kasumi-swap-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <CloseIcon />
                </button>
                <div className="modal-content">
                    {/* FIX: `T.roguelike.powers.value_swap.name` is a string, not a function. Removed the incorrect function call. */}
                    <h2>{T.roguelike.powers.value_swap.name}</h2>
                    <p>{T.briscolaSwapMessage}</p>
                    <div className="kasumi-swap-cards">
                        <CardView card={briscolaCard} lang={language} cardDeckStyle={cardDeckStyle} />
                    </div>
                    <div className="hand">
                        {hand.map(card => (
                            <React.Fragment key={card.id}>
                                <CardView card={card} lang={language} isPlayable onClick={() => onCardSelect(card)} cardDeckStyle={cardDeckStyle} />
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};