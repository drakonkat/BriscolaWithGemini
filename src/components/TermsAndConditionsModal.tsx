/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language } from '../core/types';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

export const TermsAndConditionsModal = ({ isOpen, onClose, language }: LegalModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language];
    const content = T.termsAndConditions;

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal legal-modal" onClick={(e) => e.stopPropagation()}>
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