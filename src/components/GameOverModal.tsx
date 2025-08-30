/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language, GameplayMode, GameResult } from '../core/types';

interface GameOverModalProps {
    humanScore: number;
    aiScore: number;
    aiName: string;
    winner: 'human' | 'ai' | 'tie';
    gameResult: GameResult;
    onPlayAgain: () => void;
    onGoToMenu: () => void;
    onContinueRun: () => void;
    language: Language;
    winnings: number;
    bonusWinnings: number;
    gameplayMode: GameplayMode;
    roguelikeStage: number;
}

export const GameOverModal = ({ 
    humanScore, 
    aiScore, 
    aiName, 
    winner, 
    gameResult,
    onPlayAgain, 
    onGoToMenu, 
    onContinueRun,
    language, 
    winnings,
    bonusWinnings,
    gameplayMode,
    roguelikeStage,
}: GameOverModalProps) => {
    const T = translations[language];

    let title = T.gameOverTitle;
    let message: string;

    switch (winner) {
        case 'human': message = T.youWin; break;
        case 'ai': message = T.aiWins(aiName); break;
        case 'tie': message = T.tie; break;
        default: message = '';
    }

    if (gameResult === 'stageWon') {
        title = T.stageCompleteTitle;
        message = T.stageCompleteMessage(roguelikeStage);
    } else if (gameplayMode === 'roguelike' && winner === 'human') {
        title = T.runCompleteTitle;
        message = T.runCompleteMessage;
    } else if (gameplayMode === 'roguelike' && (winner === 'ai' || winner === 'tie')) {
        title = T.runFailedTitle;
        message = T.runFailedMessage(roguelikeStage);
    }

    return (
        <div className="game-over-overlay">
            <div className="game-over-modal">
                <h2>{title}</h2>
                <p>{T.finalScore}</p>
                <p>{T.scoreYou}: {humanScore} - {aiName}: {aiScore}</p>
                {winnings > 0 && <p className="game-over-winnings">{T.coinsEarned(winnings)}</p>}
                {bonusWinnings > 0 && <p className="game-over-winnings bonus">{T.bonusCoins(bonusWinnings)}</p>}
                <h3>{message}</h3>
                <div className="modal-actions">
                    {gameResult === 'stageWon' ? (
                        <button onClick={onContinueRun}>{T.continueRun}</button>
                    ) : (
                        <button onClick={onPlayAgain}>{T.playAgain}</button>
                    )}
                    <button onClick={onGoToMenu} className="button-secondary">{T.backToMenu}</button>
                </div>
            </div>
        </div>
    );
};
