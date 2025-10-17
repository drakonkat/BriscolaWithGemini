/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { translations } from '../core/translations';

export const GameOverModal = ({ humanScore, aiScore, aiName, winner, onPlayAgain, onGoToMenu, language, winnings, challengeMatchRarity }) => {
    const T = translations[language];

    const isChallengeLoss = challengeMatchRarity && (winner === 'ai' || winner === 'tie');
    const isChallengeWin = challengeMatchRarity && winner === 'human';

    let title = T.gameOverTitle;
    let finalMessage;
    let playAgainText = T.playAgain;

    if (isChallengeLoss) {
        title = T.challengeMatch.challengeLossTitle;
        finalMessage = T.challengeMatch.challengeLossMessage(aiName);
        playAgainText = T.challengeMatch.playAgainChallenge;
    } else if (isChallengeWin) {
        title = T.challengeMatch.challengeWinTitle;
        finalMessage = T.challengeMatch.challengeWinMessage;
    }
    else {
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
    }

    return (
        <div className="game-over-overlay">
            <div className="game-over-modal">
                <h2>{title}</h2>
                <p>{T.finalScore}</p>
                <p>{T.scoreYou}: {humanScore} - {aiName}: {aiScore}</p>
                {winnings > 0 && <p className="game-over-winnings">{T.coinsEarned(winnings)}</p>}
                <h3>{finalMessage}</h3>
                <div className="modal-actions">
                    <button onClick={onPlayAgain}>{playAgainText}</button>
                    <button onClick={onGoToMenu} className="button-secondary">{T.backToMenu}</button>
                </div>
            </div>
        </div>
    );
};