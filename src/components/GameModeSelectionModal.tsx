/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { observer } from 'mobx-react-lite';
import { translations } from '../core/translations';
import type { Language, GameplayMode } from '../core/types';
import { CloseIcon } from './icons/CloseIcon';
import { DungeonBadgeIcon } from './icons/DungeonBadgeIcon';

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
                    <CloseIcon />
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
                                    <DungeonBadgeIcon className="dungeon-badge-icon" />
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