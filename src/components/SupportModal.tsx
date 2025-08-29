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
    const T_common = translations[language];

    const buttonText = encodeURIComponent(T_common.buyWaifuCoffee);
    const imageUrl = `https://img.buymeacoffee.com/button-api/?text=${buttonText}&emoji=&slug=waifubriscola&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff`;

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="game-over-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{T.title}</h2>
                <p>{T.message}</p>
                <div className="modal-actions">
                    <a 
                        href="https://www.buymeacoffee.com/waifubriscola" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={onClose}
                    >
                        <img src={imageUrl} alt={T_common.buyWaifuCoffee} />
                    </a>
                    <button onClick={onSubscriptionInterest}>
                        {T.subscriptionButton}
                    </button>
                </div>
            </div>
        </div>
    );
};