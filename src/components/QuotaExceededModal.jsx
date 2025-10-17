/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { translations } from '../core/translations';

export const QuotaExceededModal = ({ language, onContinue }) => {
    const T = translations[language].quotaExceeded;
    const T_common = translations[language];

    const buttonText = encodeURIComponent(T_common.buyWaifuCoffee);
    const imageUrl = `https://img.buymeacoffee.com/button-api/?text=${buttonText}&emoji=&slug=waifubriscola&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff`;


    return (
        <div className="game-over-overlay">
            <div className="game-over-modal">
                <button className="modal-close-button" onClick={onContinue} aria-label={T.continueGame}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
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