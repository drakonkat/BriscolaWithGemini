/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import { VALUES_IT } from '../core/constants';
import type { Language, Difficulty, GameplayMode } from '../core/types';

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    difficulty: Difficulty;
    gameplayMode: GameplayMode;
}

export const RulesModal = ({ isOpen, onClose, language, difficulty, gameplayMode }: RulesModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language];
    const pointValues = [
        { value: T.values[VALUES_IT.indexOf('Asso')], points: 11 },
        { value: T.values[VALUES_IT.indexOf('3')], points: 10 },
        { value: T.values[VALUES_IT.indexOf('Re')], points: 4 },
        { value: T.values[VALUES_IT.indexOf('Cavallo')], points: 3 },
        { value: T.values[VALUES_IT.indexOf('Fante')], points: 2 },
    ];

    let difficultyMultiplier = 1.0;
    if (difficulty === 'easy') {
        difficultyMultiplier = 0.5;
    } else if (difficulty === 'hard') {
        difficultyMultiplier = 1.5;
    }
    
    const classicRewards = {
        loss: 20,
        win61: 45,
        win81: 70,
        win101: 100,
    };
    
    const roguelikeRewards = {
        loss: 25,
        win61: 50,
        win81: 80,
        win101: 120,
    };
    
    const baseRewards = gameplayMode === 'roguelike' ? roguelikeRewards : classicRewards;

    const rewards = {
        loss: Math.round(baseRewards.loss * difficultyMultiplier),
        win61: Math.round(baseRewards.win61 * difficultyMultiplier),
        win81: Math.round(baseRewards.win81 * difficultyMultiplier),
        win101: Math.round(baseRewards.win101 * difficultyMultiplier),
    };

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{T.rulesTitle}</h2>
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

                <h3 className="rules-subtitle">{T.waifuCoinRulesTitle}</h3>
                <ul className="rules-info-list">
                    <li className="rules-info-item">{T.waifuCoinRuleLoss(rewards.loss)}</li>
                    <li className="rules-info-item">{T.waifuCoinRuleWin61(rewards.win61)}</li>
                    <li className="rules-info-item">{T.waifuCoinRuleWin81(rewards.win81)}</li>
                    <li className="rules-info-item">{T.waifuCoinRuleWin101(rewards.win101)}</li>
                </ul>

                <h3 className="rules-subtitle">{T.waifuCoinDifficultyMultiplier}</h3>
                <p>{T.waifuCoinDifficultyMultiplierInfo}</p>
                <ul className="rules-info-list">
                    <li className={`rules-info-item ${difficulty === 'easy' ? 'active-difficulty' : ''}`}>{T.waifuCoinDifficultyMultiplierEasy}</li>
                    <li className={`rules-info-item ${difficulty === 'medium' ? 'active-difficulty' : ''}`}>{T.waifuCoinDifficultyMultiplierMedium}</li>
                    <li className={`rules-info-item ${difficulty === 'hard' ? 'active-difficulty' : ''}`}>{T.waifuCoinDifficultyMultiplierHard}</li>
                </ul>

                <h3 className="rules-subtitle">{T.gachaRulesTitle}</h3>
                <p>{T.gachaRule50Percent}</p>
                <p>{T.gachaRuleRarityTitle}</p>
                <ul className="rules-info-list">
                    <li className="rules-info-item">{T.gachaRuleRarityR}</li>
                    <li className="rules-info-item">{T.gachaRuleRaritySR}</li>
                    <li className="rules-info-item">{T.gachaRuleRaritySSR}</li>
                </ul>

                <div className="modal-actions">
                    <button onClick={onClose}>{T.close}</button>
                </div>
            </div>
        </div>
    );
};