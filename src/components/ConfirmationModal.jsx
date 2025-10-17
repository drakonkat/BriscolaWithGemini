/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { translations } from '../core/translations';

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, language }) => {
    if (!isOpen) {
        return null;
    }
    const T = translations[language];

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="button-secondary" onClick={onClose}>{cancelText}</button>
                    <button className="button-danger" onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};