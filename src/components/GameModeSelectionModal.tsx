/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { observer } from 'mobx-react-lite';
import { translations } from '../core/translations';
import type { Language, GameplayMode } from '../core/types';

interface GameModeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    currentMode: GameplayMode;
    onSelect: (mode: GameplayMode) => void;
    daysUntilDungeonSeasonEnd: number | null;
    onDungeonRewardsClick: () => void;
}

export const GameModeSelectionModal = observer(({ isOpen, onClose, language, currentMode, onSelect, daysUntilDungeonSeasonEnd, onDungeonRewardsClick }: GameModeSelectionModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language];

    const gameModes: { mode: GameplayMode; label: string; icon: string }[] = [
        { mode: 'classic', label: T.gameModeClassic, icon: '👑' },
        { mode: 'roguelike', label: T.gameModeRoguelike, icon: '🗺️' },
        { mode: 'dungeon', label: T.gameModeDungeon, icon: '⚔️' },
    ];

    const handleSelect = (mode: GameplayMode) => {
        onSelect(mode);
        onClose();
    };

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="game-mode-selection-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <h2>{T.gameModeLabel}</h2>
                <div className="game-mode-selection-grid">
                    {gameModes.map((item) => (
                        <button
                            key={item.mode}
                            className={`game-mode-card ${currentMode === item.mode ? 'selected' : ''}`}
                            onClick={() => handleSelect(item.mode)}
                        >
                             {item.mode === 'dungeon' && daysUntilDungeonSeasonEnd !== null && daysUntilDungeonSeasonEnd > 0 && (
                                <div 
                                    className="dungeon-badge" 
                                    onClick={(e) => { e.stopPropagation(); onDungeonRewardsClick(); }} 
                                    role="button"
                                    tabIndex={0}
                                    aria-label={T.dungeonRewardsModal.title}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="dungeon-badge-icon"><path d="M19 10c0-1.1-.9-2-2-2h-3V5c0-1.1-.9-2-2-2s-2 .9-2 2v3H7c-1.1 0-2 .9-2 2v2h14v-2zm-2 2H7v-2h10v2zm-5 4c0-1.1-.9-2-2-2s-2 .9-2 2v2c0 1.1.9 2 2 2s2-.9 2-2v-2z"/></svg>
                                    <span className="dungeon-badge-countdown">{daysUntilDungeonSeasonEnd}</span>
                                </div>
                            )}
                            <span className="game-mode-icon">{item.icon}</span>
                            <h3>{item.label}</h3>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
});