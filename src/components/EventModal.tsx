/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language, RoguelikeEvent } from '../core/types';

interface EventModalProps {
    events: RoguelikeEvent[];
    onChoiceSelected: (choice: () => void) => void;
    language: Language;
}

export const EventModal = ({ events, onChoiceSelected, language }: EventModalProps) => {
    const T = translations[language].roguelike;

    return (
        <div className="game-over-overlay">
            <div className="event-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{T.crossroadsTitle}</h2>
                <p>{T.crossroadsMessage}</p>

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