/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { observer } from 'mobx-react-lite';
import { translations } from '../core/translations';
import type { Language, Difficulty } from '../core/types';
import { CloseIcon } from './icons/CloseIcon';

interface DifficultySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    currentDifficulty: Difficulty;
    onSelect: (diff: Difficulty) => void;
}

export const DifficultySelectionModal = observer(({ isOpen, onClose, language, currentDifficulty, onSelect }: DifficultySelectionModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language];

    const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'nightmare', 'apocalypse'];

    const handleSelect = (diff: Difficulty) => {
        onSelect(diff);
        onClose();
    };

    const getIcon = (diff: Difficulty) => {
        switch (diff) {
            case 'easy': return '❤️';
            case 'medium': return '❤️❤️';
            case 'hard': return '❤️❤️❤️';
            case 'nightmare': return '🖤🖤🖤';
            case 'apocalypse': return '💀💀💀';
            default: return '';
        }
    };

    const getTitle = (diff: Difficulty) => {
        switch (diff) {
            case 'easy': return T.difficultyEasy;
            case 'medium': return T.difficultyMedium;
            case 'hard': return T.difficultyHard;
            case 'nightmare': return T.difficultyNightmare;
            case 'apocalypse': return T.difficultyApocalypse;
            default: return '';
        }
    };

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="difficulty-selection-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <CloseIcon />
                </button>
                <h2>{T.difficultyLabel}</h2>
                <div className="difficulty-selection-grid">
                    {difficulties.map((diff) => (
                        <button
                            key={diff}
                            className={`difficulty-card ${currentDifficulty === diff ? 'selected' : ''}`}
                            onClick={() => handleSelect(diff)}
                        >
                            <span className={`difficulty-icon ${diff === 'nightmare' ? 'nightmare-icon' : ''}`}>
                                {getIcon(diff)}
                            </span>
                            <h3>{getTitle(diff)}</h3>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
});