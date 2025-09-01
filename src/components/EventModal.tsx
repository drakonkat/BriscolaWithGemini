/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language, RoguelikeEvent } from '../core/types';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    events: RoguelikeEvent[];
    onChoiceSelected: (choice: () => void) => void;
    language: Language;
}

export const EventModal = ({ isOpen, onClose, events, onChoiceSelected, language }: EventModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language];
    const TR = T.roguelike;

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="event-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <h2>{TR.crossroadsTitle}</h2>
                <p>{TR.crossroadsMessage}</p>

                <div className="event-choices">
                    {events.map((event, index) => (
                        <div key={index}>
                            <h3>{event.title}</h3>
                            <p>{event.description}</p>
                            {event.choices.map((choice, choiceIndex) => (
                                <button key={choiceIndex} className="event-choice-button" onClick={() => onChoiceSelected(choice.action)}>
                                    <strong>{choice.text}</strong>
                                    {choice.description && <span>{choice.description}</span>}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};