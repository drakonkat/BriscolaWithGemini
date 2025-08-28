/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { CardView } from './CardView';
import { getCardId } from '../core/utils';
import { translations } from '../core/translations';
import type { Card, Language, Player } from '../core/types';

interface GameBoardProps {
    aiName: string;
    aiScore: number;
    aiHand: Card[];
    humanScore: number;
    humanHand: Card[];
    deck: Card[];
    briscolaCard: Card | null;
    cardsOnTable: Card[];
    message: string;
    isProcessing: boolean;
    isAiThinkingMove: boolean; // Nuovo prop
    turn: Player;
    onPlayCard: (card: Card) => void;
    onGoToMenu: () => void;
    language: Language;
    backgroundUrl: string;
}

export const GameBoard = ({
    aiName,
    aiScore,
    aiHand,
    humanScore,
    humanHand,
    deck,
    briscolaCard,
    cardsOnTable,
    message,
    isProcessing,
    isAiThinkingMove,
    turn,
    onPlayCard,
    onGoToMenu,
    language,
    backgroundUrl
}: GameBoardProps) => {

    const T = translations[language];

    // Calcola il livello di sfocatura in base al punteggio più alto
    const maxScore = Math.max(humanScore, aiScore);
    const winningScore = 60;
    const maxBlur = 25; // px
    // La sfocatura diminuisce linearmente da maxBlur a 0 man mano che maxScore si avvicina a winningScore
    const blurValue = Math.max(0, maxBlur * (1 - Math.min(maxScore, winningScore) / winningScore));

    const backgroundStyle = {
        filter: `blur(${blurValue}px) brightness(0.7)`
    };

    return (
        <main className="game-board">
            <img 
                src={backgroundUrl} 
                alt={T.gameBoardBackground} 
                className="game-board-background"
                style={backgroundStyle}
            />
            
            <button className="back-button" onClick={onGoToMenu} aria-label={T.backToMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
            </button>
            
            <div className="message-log" aria-live="polite">{message}</div>

            <div className="player-area ai-area">
                <div className="score">{aiName}: {aiScore}</div>
                <div className="hand">
                    {aiHand.map((_, index) => <CardView key={index} card={{ suit: 'Spade', value: '2' }} isFaceDown lang={language} />)}
                </div>
            </div>

            <div className="table-area">
                <div className="deck-pile">
                    {deck.length > 0 && <CardView card={{ suit: 'Spade', value: '2' }} isFaceDown lang={language} />}
                    {briscolaCard && <CardView card={briscolaCard} lang={language} />}
                    <span className="deck-count" aria-live="polite">{deck.length}</span>
                </div>
                <div className="played-cards">
                    {cardsOnTable.map((card) => <CardView key={getCardId(card, language)} card={card} lang={language} />)}
                    {isAiThinkingMove && <div className="spinner" aria-label="L'IA sta pensando"></div>}
                </div>
            </div>

            <div className="player-area human-area">
                <div className="score">{T.scoreYou}: {humanScore}</div>
                <div className="hand">
                    {humanHand.map(card => (
                        <CardView
                            key={getCardId(card, language)}
                            card={card}
                            isPlayable={turn === 'human' && !isProcessing}
                            onClick={() => onPlayCard(card)}
                            lang={language}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};