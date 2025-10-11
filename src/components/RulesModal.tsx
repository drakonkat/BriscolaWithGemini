/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import { VALUES_IT, ROGUELIKE_REWARDS } from '../core/constants';
import type { Language, Difficulty, RoguelikePowerUpId } from '../core/types';
import { POWER_UP_DEFINITIONS, ALL_POWER_UP_IDS } from '../core/roguelikePowers';

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    difficulty: Difficulty;
}

export const RulesModal = ({ isOpen, onClose, language, difficulty }: RulesModalProps) => {
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
    } else if (difficulty === 'hard' || difficulty === 'nightmare' || difficulty === 'apocalypse') {
        difficultyMultiplier = 1.5;
    }

    const rewards = {
        loss: Math.round(20 * difficultyMultiplier),
        win61: Math.round(45 * difficultyMultiplier),
        win81: Math.round(70 * difficultyMultiplier),
        win101: Math.round(100 * difficultyMultiplier),
    };

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
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
                
                <h3 className="rules-subtitle">{T.projectDescriptionTitle}</h3>
                <p>{T.projectDescription1}</p>
                <p>{T.projectDescription2}</p>

                <h3 className="rules-subtitle">{T.waifuCoinRulesTitle}</h3>
                <ul className="rules-info-list">
                    {difficulty === 'nightmare' ? (
                         <>
                            <li className="rules-info-item">{T.waifuCoinRuleLoss(rewards.loss)}</li>
                            <li className="rules-info-item">{T.waifuCoinRuleWinNightmare(750)}</li>
                        </>
                    ) : difficulty === 'apocalypse' ? (
                        <>
                            <li className="rules-info-item">{T.waifuCoinRuleLoss(rewards.loss)}</li>
                            <li className="rules-info-item">{T.waifuCoinRuleWinApocalypse(1000)}</li>
                       </>
                    ) : (
                        <>
                            <li className="rules-info-item">{T.waifuCoinRuleLoss(rewards.loss)}</li>
                            <li className="rules-info-item">{T.waifuCoinRuleWin61(rewards.win61)}</li>
                            <li className="rules-info-item">{T.waifuCoinRuleWin81(rewards.win81)}</li>
                            <li className="rules-info-item">{T.waifuCoinRuleWin101(rewards.win101)}</li>
                        </>
                    )}
                </ul>

                <h3 className="rules-subtitle">{T.waifuCoinDifficultyMultiplier}</h3>
                <p>{T.waifuCoinDifficultyMultiplierInfo}</p>
                <ul className="rules-info-list">
                    <li className={`rules-info-item ${difficulty === 'easy' ? 'active-difficulty' : ''}`}>{T.waifuCoinDifficultyMultiplierEasy}</li>
                    <li className={`rules-info-item ${difficulty === 'medium' ? 'active-difficulty' : ''}`}>{T.waifuCoinDifficultyMultiplierMedium}</li>
                    <li className={`rules-info-item ${difficulty === 'hard' ? 'active-difficulty' : ''}`}>{T.waifuCoinDifficultyMultiplierHard}</li>
                    <li className={`rules-info-item ${difficulty === 'nightmare' ? 'active-difficulty' : ''}`}>{T.waifuCoinDifficultyMultiplierNightmare}</li>
                    <li className={`rules-info-item ${difficulty === 'apocalypse' ? 'active-difficulty' : ''}`}>{T.waifuCoinDifficultyMultiplierApocalypse}</li>
                </ul>

                <h3 className="rules-subtitle">{T.gachaRulesTitle}</h3>
                <ul className="rules-info-list">
                    <li className="rules-info-item">{T.gachaFreeFirstRoll}</li>
                    <li className="rules-info-item">{T.gachaCostSingle}</li>
                    <li className="rules-info-item">{T.gachaCostMulti}</li>
                    <li className="rules-info-item">{T.gachaRule50Percent}</li>
                    <li className="rules-info-item">{T.gachaRefundDescription}</li>
                    <li className="rules-info-item">{T.gachaRuleRarityTitle}
                        <ul style={{ listStyle: 'circle', paddingLeft: '20px', marginTop: '0.5rem' }}>
                            <li>{T.gachaRuleRarityR}</li>
                            <li>{T.gachaRuleRaritySR}</li>
                            <li>{T.gachaRuleRaritySSR}</li>
                        </ul>
                    </li>
                    <li className="rules-info-item">{T.gachaPitySystem}</li>
                </ul>

                <h3 className="rules-subtitle">{T.roguelike.roguelikeRulesTitle}</h3>
                <p>{T.roguelike.roguelikeRulesDescription}</p>

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
            </div>
        </div>
    );
};