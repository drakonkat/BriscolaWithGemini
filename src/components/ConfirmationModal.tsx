/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
}

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }: ConfirmationModalProps) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
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
