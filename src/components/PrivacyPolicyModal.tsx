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

export const PrivacyPolicyModal = ({ isOpen, onClose, language }: LegalModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language];
    const content = T.privacyPolicy;

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal legal-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{content.title}</h2>
                <p><strong>{content.lastUpdatedPrefix}</strong> {content.lastUpdatedDate}</p>
                <p><strong>{content.contactPrefix}</strong> {content.contactName}</p>
                <p>{content.intro}</p>
                
                <h3>{content.collection.title}</h3>
                <p>{content.collection.intro}</p>
                <ul>
                    <li><strong>{content.collection.posthog.title}</strong> {content.collection.posthog.text}</li>
                    <li><strong>{content.collection.gemini.title}</strong> <span dangerouslySetInnerHTML={{ __html: content.collection.gemini.text }} /></li>
                </ul>

                <h3>{content.usage.title}</h3>
                <p>{content.usage.intro}</p>
                <ul>
                    {content.usage.points.map((point, index) => <li key={index}>{point}</li>)}
                </ul>

                <h3>{content.sharing.title}</h3>
                <p>{content.sharing.text}</p>
                
                <h3>{content.security.title}</h3>
                <p>{content.security.text}</p>

                <h3>{content.changes.title}</h3>
                <p>{content.changes.text}</p>
                
                <h3>{content.contact.title}</h3>
                <p>{content.contact.text}</p>

                <div className="modal-actions">
                    <button onClick={onClose}>{T.close}</button>
                </div>
            </div>
        </div>
    );
};