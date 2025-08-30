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
    winner: 'human' | 'ai' | 'tie';
    onPlayAgain: () => void;
    onGoToMenu: () => void;
    language: Language;
    winnings: number;
}

export const GameOverModal = ({ humanScore, aiScore, aiName, winner, onPlayAgain, onGoToMenu, language, winnings }: GameOverModalProps) => {
    const T = translations[language];

    let finalMessage: string;
    switch (winner) {
        case 'human':
            finalMessage = T.youWin;
            break;
        case 'ai':
            finalMessage = T.aiWins(aiName);
            break;
        case 'tie':
            finalMessage = T.tie;
            break;
    }

    return (
        <div className="game-over-overlay">
            <div className="game-over-modal">
                <h2>{T.gameOverTitle}</h2>
                <p>{T.finalScore}</p>
                <p>{T.scoreYou}: {humanScore} - {aiName}: {aiScore}</p>
                {winnings > 0 && <p className="game-over-winnings">{T.coinsEarned(winnings)}</p>}
                <h3>{finalMessage}</h3>
                <div className="modal-actions">
                    <button onClick={onPlayAgain}>{T.playAgain}</button>
                    <button onClick={onGoToMenu} className="button-secondary">{T.backToMenu}</button>
                </div>
            </div>
        </div>
    );
};
