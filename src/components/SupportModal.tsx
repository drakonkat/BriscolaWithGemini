/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language } from '../core/types';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubscriptionInterest: () => void;
    language: Language;
}

export const SupportModal = ({ isOpen, onClose, onSubscriptionInterest, language }: SupportModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language].supportModal;

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="game-over-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{T.title}</h2>
                <p>{T.message}</p>
                <div className="modal-actions">
                    <a 
                        href="https://ko-fi.com/waifubriscoladev" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="donation-link"
                        onClick={onClose}
                    >
                        {T.donateButton}
                    </a>
                    <button onClick={onSubscriptionInterest}>
                        {T.subscriptionButton}
                    </button>
                </div>
            </div>
        </div>
    );
};
