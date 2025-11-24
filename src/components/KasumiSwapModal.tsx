/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Import React to use React.Fragment.
import React from 'react';
import { translations } from '../core/translations';
import type { Card, Language, CardDeckStyle } from '../core/types';
import { CardView } from './CardView';
import { CloseIcon } from './icons/CloseIcon';

interface KasumiSwapModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCardSelect: (card: Card) => void;
    briscolaCard: Card | null;
    hand: Card[];
    language: Language;
    cardDeckStyle: CardDeckStyle;
}

export const KasumiSwapModal = ({ isOpen, onClose, onCardSelect, briscolaCard, hand, language, cardDeckStyle }: KasumiSwapModalProps) => {
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
                    <h2>{T.kasumiSwapTitle}</h2>
                    <p>{T.kasumiSwapMessage}</p>
                    <div className="kasumi-swap-cards">
                        <CardView card={briscolaCard} lang={language} cardDeckStyle={cardDeckStyle} />
                    </div>
                    <div className="hand">
                        {hand.map(card => (
                            // FIX: Wrap CardView in React.Fragment to solve key prop type error.
                            <React.Fragment key={card.id}>
                                <CardView card={card} lang={language} isPlayable onClick={() => onCardSelect(card)} cardDeckStyle={cardDeckStyle} />
                            </React.Fragment>
                        ))}
                    </div>
                     <div className="modal-actions">
                        <button onClick={onClose}>{T.close}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};