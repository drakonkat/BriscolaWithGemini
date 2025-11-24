/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language } from '../core/types';
import { CloseIcon } from './icons/CloseIcon';

interface QuotaExceededModalProps {
    language: Language;
    onContinue: () => void;
}

export const QuotaExceededModal = ({ language, onContinue }: QuotaExceededModalProps) => {
    const T = translations[language].quotaExceeded;
    const T_common = translations[language];

    const buttonText = encodeURIComponent(T_common.buyWaifuCoffee);
    const imageUrl = `https://img.buymeacoffee.com/button-api/?text=${buttonText}&emoji=&slug=waifubriscola&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff`;


    return (
        <div className="game-over-overlay">
            <div className="game-over-modal">
                <button className="modal-close-button" onClick={onContinue} aria-label={T.continueGame}>
                    <CloseIcon />
                </button>
                <h2>{T.title}</h2>
                <p>{T.message}</p>
                <div className="modal-actions">
                    <a href="https://www.buymeacoffee.com/waifubriscola" target="_blank" rel="noopener noreferrer">
                        <img src={imageUrl} alt={T_common.buyWaifuCoffee} />
                    </a>
                    <button onClick={onContinue}>{T.continueGame}</button>
                </div>
                <p className="quota-info">{T.quotaInfo}</p>
            </div>
        </div>
    );
};