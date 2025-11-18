/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import { ROGUELIKE_REWARDS } from '../core/constants';
import type { Language, Difficulty, GameplayMode } from '../core/types';

interface WaifuCoinRulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    difficulty: Difficulty;
    gameplayMode: GameplayMode;
}

export const WaifuCoinRulesModal = ({ isOpen, onClose, language, difficulty, gameplayMode }: WaifuCoinRulesModalProps) => {
    if (!isOpen) {
        return null;
    }

    const T = translations[language];

    let content;

    if (gameplayMode === 'roguelike') {
        const rewards = ROGUELIKE_REWARDS[difficulty];
        const essenceMultipliers: Record<Difficulty, string> = {
            easy: 'x1',
            medium: 'x1.25',
            hard: 'x1.5',
            nightmare: 'x2',
            apocalypse: 'x2.5',
        };
        const difficultyDescKey = `difficulty${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}Desc` as keyof typeof T;
        const difficultyDesc = T[difficultyDescKey] as string;
        content = (
            <div className="difficulty-details-panel fade-in-up" key={`${difficulty}-roguelike`}>
                <p className="difficulty-description">{difficultyDesc}</p>
                <div className="difficulty-rewards roguelike">
                    <div className="reward-item">
                        <span>{T.roguelike.rewardWinRun}</span>
                        <strong>+{rewards.win} WC</strong>
                    </div>
                    {rewards.loss.slice(1).map((lossAmount, index) => (
                        <div className="reward-item" key={index}>
                            <span>{T.roguelike.rewardLossLevel(index + 1)}</span>
                            <strong>+{lossAmount} WC</strong>
                        </div>
                    ))}
                    <div className="reward-item multiplier">
                        <span>{T.rewardEssenceMultiplier}</span>
                        <strong>{essenceMultipliers[difficulty]}</strong>
                    </div>
                </div>
            </div>
        );
    } else { // classic or dungeon
        const details = {
            easy: { desc: T.difficultyEasyDesc, multiplier: '50%', multiplierVal: 0.5, isSpecial: false },
            medium: { desc: T.difficultyMediumDesc, multiplier: '100%', multiplierVal: 1.0, isSpecial: false },
            hard: { desc: T.difficultyHardDesc, multiplier: '150%', multiplierVal: 1.5, isSpecial: false },
            nightmare: { desc: T.difficultyNightmareDesc, multiplier: T.rewardSpecial, multiplierVal: 1.5, isSpecial: true, winAmount: 250 },
            apocalypse: { desc: T.difficultyApocalypseDesc, multiplier: T.rewardSpecial, multiplierVal: 1.5, isSpecial: true, winAmount: 500 }
        }[difficulty];
        const rewards = {
            loss: details.isSpecial ? Math.round(20 * 1.5) : Math.round(20 * details.multiplierVal),
            win_min: details.isSpecial ? details.winAmount : Math.round(45 * details.multiplierVal),
            win_max: details.isSpecial ? details.winAmount : Math.round(100 * details.multiplierVal),
        };
        content = (
            <div className="difficulty-details-panel fade-in-up" key={difficulty}>
                <p className="difficulty-description">{details.desc}</p>
                <div className="difficulty-rewards">
                    <div className="reward-item multiplier">
                        <span>{T.rewardCoinMultiplier}</span>
                        <strong>{details.multiplier}</strong>
                    </div>
                    <div className="reward-item">
                        <span>{T.rewardWin}</span>
                        <strong>
                            {details.isSpecial ? `+${rewards.win_min} WC` : `+${rewards.win_min} - ${rewards.win_max} WC`}
                        </strong>
                    </div>
                    <div className="reward-item">
                        <span>{T.rewardLoss}</span>
                        <strong>+{rewards.loss} WC</strong>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <h2>{T.waifuCoinRulesTitle}</h2>
                {content}
            </div>
        </div>
    );
};