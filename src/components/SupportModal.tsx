/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language } from '../core/types';
import { CloseIcon } from './icons/CloseIcon';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVote: (vote: boolean) => void;
    hasVoted: boolean;
    language: Language;
}

export const SupportModal = ({ isOpen, onClose, onVote, hasVoted, language }: SupportModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language].supportModal;
    const T_common = translations[language];

    const buttonText = encodeURIComponent(T_common.buyWaifuCoffee);
    const imageUrl = `https://img.buymeacoffee.com/button-api/?text=${buttonText}&emoji=&slug=waifubriscola&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff`;

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T_common.close}>
                    <CloseIcon />
                </button>
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
                </div>
                
                <div className="support-modal-poll">
                    {!hasVoted ? (
                        <>
                            <h3>{T.subscriptionPoll.title}</h3>
                            <p>{T.subscriptionPoll.description}</p>
                            <div className="poll-actions">
                                <button className="button-secondary" onClick={() => onVote(false)}>{T.subscriptionPoll.no}</button>
                                <button onClick={() => onVote(true)}>{T.subscriptionPoll.yes}</button>
                            </div>
                        </>
                    ) : (
                        <p className="poll-thanks">{T.subscriptionPoll.thanks}</p>
                    )}
                </div>
            </div>
        </div>
    );
};