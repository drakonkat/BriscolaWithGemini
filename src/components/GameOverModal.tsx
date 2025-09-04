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
                <button className="modal-close-button" onClick={onGoToMenu} aria-label={T.backToMenu}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
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