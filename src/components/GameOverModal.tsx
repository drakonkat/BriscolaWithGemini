/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language } from '../core/types';

interface GameOverModalProps {
    humanScore: number;
    aiScore: number;
    aiName: string;
    onPlayAgain: () => void;
    language: Language;
}

export const GameOverModal = ({ humanScore, aiScore, aiName, onPlayAgain, language }: GameOverModalProps) => {
    const T = translations[language];
    const finalMessage = humanScore > 60 ? T.youWin : (aiScore > 60 ? T.aiWins(aiName) : (humanScore === 60 ? T.tie : `${T.scoreYou}: ${humanScore} - ${aiName}: ${aiScore}`));

    return (
        <div className="game-over-overlay">
            <div className="game-over-modal">
                <h2>{T.gameOverTitle}</h2>
                <p>{T.finalScore}</p>
                <p>{T.scoreYou}: {humanScore} - {aiName}: {aiScore}</p>
                <h3>{finalMessage}</h3>
                <button onClick={onPlayAgain}>{T.playAgain}</button>
            </div>
        </div>
    );
};
