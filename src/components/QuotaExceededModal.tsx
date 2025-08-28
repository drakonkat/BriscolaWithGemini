/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language } from '../core/types';

interface QuotaExceededModalProps {
    language: Language;
    onContinue: () => void;
}

export const QuotaExceededModal = ({ language, onContinue }: QuotaExceededModalProps) => {
    const T = translations[language].quotaExceeded;

    return (
        <div className="game-over-overlay">
            <div className="game-over-modal">
                <h2>{T.title}</h2>
                <p>{T.message}</p>
                <div className="modal-actions">
                    <a href="https://ko-fi.com/waifubriscoladev" target="_blank" rel="noopener noreferrer" className="donation-link">
                        {T.donationText}
                    </a>
                    <button onClick={onContinue}>{T.continueGame}</button>
                </div>
                <p className="quota-info">{T.quotaInfo}</p>
            </div>
        </div>
    );
};
