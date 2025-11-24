/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language } from '../core/types';
import { CloseIcon } from './icons/CloseIcon';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    language: Language;
}

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, language }: ConfirmationModalProps) => {
    if (!isOpen) {
        return null;
    }
    const T = translations[language];

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <CloseIcon />
                </button>
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="modal-actions">
                    {cancelText && <button className="button-secondary" onClick={onClose}>{cancelText}</button>}
                    <button className="button-danger" onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};