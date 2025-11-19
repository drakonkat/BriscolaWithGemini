
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { translations } from '../core/translations';
import { VALUES_IT, ROGUELIKE_REWARDS } from '../core/constants';
import type { Language, Difficulty, RoguelikePowerUpId, GameplayMode } from '../core/types';
import { POWER_UP_DEFINITIONS, ALL_POWER_UP_IDS } from '../core/roguelikePowers';

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    difficulty: Difficulty;
    gameplayMode: GameplayMode;
    context: 'full' | 'gameMode';
}

const ClassicRules = ({ T }: { T: typeof translations['it'] }) => {
    const pointValues = [
        { value: T.values[VALUES_IT.indexOf('Asso')], points: 11 },
        { value: T.values[VALUES_IT.indexOf('3')], points: 10 },
        { value: T.values[VALUES_IT.indexOf('Re')], points: 4 },
        { value: T.values[VALUES_IT.indexOf('Cavallo')], points: 3 },
        { value: T.values[VALUES_IT.indexOf('Fante')], points: 2 },
    ];
    return (
        <>
            <h3 className="rules-subtitle">{T.gameModeClassic}</h3>
            <p>{T.winCondition}</p>
            <ul className="rules-points-list">
                {pointValues.map(item => (
                    <li key={item.value} className="rules-point-item">
                        <span>{item.value}</span>
                        <span>{T.scorePoints(item.points)}</span>
                    </li>
                ))}
                <li className="rules-point-item">
                    <span>{T.otherCards} (7, 6, 5, 4, 2)</span>
                    <span>{T.scorePoints(0)}</span>
                </li>
            </ul>
        </>
    );
};

const RoguelikeRules = ({ T, difficulty, language }: { T: typeof translations['it'], difficulty: Difficulty, language: Language }) => (
    <>
        <h3 className="rules-subtitle">{T.roguelike.roguelikeRulesTitle}</h3>
        <p>{T.roguelike.roguelikeRulesDescription}</p>
        <p>{T.roguelike.essenceMultiplierRule}</p>
        <ul className="rules-info-list">
            <li className="rules-info-item">{`${T.difficultyEasy}: x1`}</li>
            <li className="rules-info-item">{`${T.difficultyMedium}: x1.25`}</li>
            <li className="rules-info-item">{`${T.difficultyHard}: x1.5`}</li>
            <li className="rules-info-item">{`${T.difficultyNightmare}: x2`}</li>
            <li className="rules-info-item">{`${T.difficultyApocalypse}: x2.5`}</li>
        </ul>

        <h4 className="rules-subtitle" style={{ fontSize: '1.3rem', marginTop: '1.5rem' }}>{T.roguelike.rewardsTitle}</h4>
        <div className="roguelike-rewards-rules-grid">
            {(['easy', 'medium', 'hard', 'nightmare', 'apocalypse'] as Difficulty[]).map(diff => {
                const rewards = ROGUELIKE_REWARDS[diff];
                const difficultyKey = `difficulty${diff.charAt(0).toUpperCase() + diff.slice(1)}` as keyof typeof T;
                return (
                    <div key={diff} className={`reward-difficulty-column difficulty-${diff}`}>
                        <strong>{T[difficultyKey] as string}</strong>
                        <ul>
                            <li><span>{T.roguelike.rewardWinRun}:</span> <span>+{rewards.win} WC</span></li>
                            {rewards.loss.slice(1).map((loss, i) => (
                                <li key={i}><span>{T.roguelike.rewardLossLevel(i + 1)}:</span> <span>+{loss} WC</span></li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>

        <h4 className="rules-subtitle" style={{ fontSize: '1.3rem', marginTop: '1.5rem' }}>{T.roguelike.roguelikePowersTitle}</h4>
        <div className="roguelike-powers-rules-list">
            {ALL_POWER_UP_IDS.map(powerId => {
                const powerDef = POWER_UP_DEFINITIONS[powerId as RoguelikePowerUpId];
                return (
                    <div key={powerId} className="power-rule-entry">
                        <strong>{powerDef.name(language)}</strong>
                        <ul>
                            {Array.from({ length: powerDef.maxLevel }, (_, i) => i + 1).map(level => (
                                <li key={level}>
                                    <span>Lv. {level}:</span> {powerDef.description(language, level)}
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>
    </>
);

const DungeonRules = ({ T }: { T: typeof translations['it'] }) => (
    <>
        <h3 className="rules-subtitle">{T.dungeonRules.title}</h3>
        <ul className="rules-info-list">
            <li className="rules-info-item">{T.dungeonRules.description}</li>
            <li className="rules-info-item">{T.dungeonRules.keyCrafting}</li>
            <li className="rules-info-item">{T.dungeonRules.runStructure}</li>
            <li className="rules-info-item">{T.dungeonRules.modifiers}</li>
            <li className="rules-info-item">{T.dungeonRules.rewards}</li>
        </ul>
    </>
);


export const RulesModal = ({ isOpen, onClose, language, difficulty, gameplayMode, context }: RulesModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language] as typeof translations['it'];

    const getModalTitle = () => {
        if (context === 'gameMode') {
            switch (gameplayMode) {
                case 'classic': return T.gameModeClassic;
                case 'roguelike': return T.roguelike.roguelikeRulesTitle;
                case 'dungeon': return T.dungeonRules.title;
            }
        }
        return T.rulesTitle;
    };

    const renderContent = () => {
        if (context === 'gameMode') {
            switch (gameplayMode) {
                case 'classic': return <ClassicRules T={T} />;
                case 'roguelike': return <RoguelikeRules T={T} difficulty={difficulty} language={language} />;
                case 'dungeon': return <DungeonRules T={T} />;
                default: return null;
            }
        }
        
        // Full context
        return (
            <>
                <ClassicRules T={T} />
                <RoguelikeRules T={T} difficulty={difficulty} language={language} />
                <DungeonRules T={T} />
            </>
        );
    };

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <h2>{getModalTitle()}</h2>
                {renderContent()}
            </div>
        </div>
    );
};
