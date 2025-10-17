/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { translations } from '../core/translations';

export const TermsAndConditionsModal = ({ isOpen, onClose, language }) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language];
    const content = T.termsAndConditions;

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal legal-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <h2>{content.title}</h2>
                <p><strong>{content.lastUpdatedPrefix}</strong> {content.lastUpdatedDate}</p>
                <p><strong>{content.contactPrefix}</strong> {content.contactName}</p>
                <p>{content.intro}</p>

                <h3>{content.acceptance.title}</h3>
                <p>{content.acceptance.text}</p>

                <h3>{content.usage.title}</h3>
                <p>{content.usage.text}</p>
                
                <h3>{content.aiContent.title}</h3>
                <p>{content.aiContent.intro}</p>
                <ul>
                    {content.aiContent.points.map((point, index) => <li key={index}>{point}</li>)}
                </ul>

                <h3>{content.liability.title}</h3>
                <p>{content.liability.text}</p>
                
                <h3>{content.changes.title}</h3>
                <p>{content.changes.text}</p>

                <h3>{content.governingLaw.title}</h3>
                <p>{content.governingLaw.text}</p>

                <div className="modal-actions">
                    <button onClick={onClose}>{T.close}</button>
                </div>
            </div>
        </div>
    );
};