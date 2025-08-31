/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Card, Language } from '../core/types';
import { CardView } from './CardView';

interface KasumiSwapModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCardSelect: (card: Card) => void;
    briscolaCard: Card | null;
    hand: Card[];
    language: Language;
}

export const KasumiSwapModal = ({ isOpen, onClose, onCardSelect, briscolaCard, hand, language }: KasumiSwapModalProps) => {
    if (!isOpen || !briscolaCard) {
        return null;
    }

    const T = translations[language];

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="kasumi-swap-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <div className="modal-content">
                    <h2>{T.kasumiSwapTitle}</h2>
                    <p>{T.kasumiSwapMessage}</p>
                    <div className="kasumi-swap-cards">
                        <CardView card={briscolaCard} lang={language} />
                    </div>
                    <div className="hand">
                        {hand.map(card => (
                            <CardView key={card.id} card={card} lang={language} isPlayable onClick={() => onCardSelect(card)} />
                        ))}
                    </div>
                     <div className="modal-actions">
                        <button onClick={onClose} className="button-secondary">{T.close}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};