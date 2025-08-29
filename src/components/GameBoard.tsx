/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { CardView } from './CardView';
import { getCardId } from '../core/utils';
import { translations } from '../core/translations';
import type { Card, Language, Player } from '../core/types';
import { CachedImage } from './CachedImage';

interface GameBoardProps {
    aiName: string;
    aiScore: number;
    aiHand: Card[];
    humanScore: number;
    humanHand: Card[];
    briscolaCard: Card | null;
    deckSize: number;
    cardsOnTable: Card[];
    message: string;
    isProcessing: boolean;
    isAiThinkingMove: boolean; // Nuovo prop
    turn: Player;
    onPlayCard: (card: Card) => void;
    onGoToMenu: () => void;
    onOpenSupportModal: () => void;
    language: Language;
    backgroundUrl: string;
    animatingCard: { card: Card; player: Player } | null;
    drawingCards: { destination: Player }[] | null;
}

export const GameBoard = ({
    aiName,
    aiScore,
    aiHand,
    humanScore,
    humanHand,
    briscolaCard,
    deckSize,
    cardsOnTable,
    message,
    isProcessing,
    isAiThinkingMove,
    turn,
    onPlayCard,
    onGoToMenu,
    onOpenSupportModal,
    language,
    backgroundUrl,
    animatingCard,
    drawingCards,
}: GameBoardProps) => {

    const T = translations[language];

    // Calcola il livello di sfocatura in base al punteggio del giocatore
    const winningScore = 60;
    const maxBlur = 25; // px
    // La sfocatura diminuisce linearmente da maxBlur a 0 man mano che il punteggio del giocatore si avvicina a winningScore
    const blurValue = Math.max(0, maxBlur * (1 - Math.min(humanScore, winningScore) / winningScore));

    const backgroundStyle = {
        filter: `blur(${blurValue}px) brightness(0.7)`
    };

    return (
        <main className="game-board">
            <CachedImage 
                imageUrl={backgroundUrl} 
                alt={T.gameBoardBackground} 
                className="game-board-background"
                style={backgroundStyle}
            />
            
            {drawingCards && drawingCards.map((draw, index) => (
                <div key={`draw-${index}`} className={`drawing-card-container destination-${draw.destination} order-${index}`}>
                    <CardView card={{ suit: 'Spade', value: '2' }} isFaceDown lang={language} />
                </div>
            ))}

            {animatingCard && (
                <div className={`animating-card-container player-${animatingCard.player} position-${cardsOnTable.length}`}>
                    <CardView card={animatingCard.card} lang={language} />
                </div>
            )}

            <div className="score-summary">
                <div className="score-line">
                    <span>{T.scoreYou}: {humanScore}</span>
                    <span>{aiName}: {aiScore}</span>
                </div>
                <div className="game-info">
                    {briscolaCard && (
                        <div>
                            <strong>{T.briscolaLabel}:</strong> {getCardId(briscolaCard, language)}
                        </div>
                    )}
                    <div>
                        <strong>{T.remainingCardsLabel}:</strong> {deckSize}
                    </div>
                </div>
                <div className="turn-message" aria-live="polite">{message}</div>
            </div>

            <button className="back-button" onClick={onGoToMenu} aria-label={T.backToMenu}>
                {/* FIX: Corrected a syntax error in the SVG tag's viewBox attribute. */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
            </button>
            <button className="support-button" onClick={onOpenSupportModal} aria-label={T.supportModal.title}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </button>
            
            {briscolaCard && (
                <div className="deck-container" title={`${T.briscolaLabel}: ${getCardId(briscolaCard, language)}`}>
                    {/* The deck pile is visible as long as there are cards in the deck state, which means deckSize > 1 */}
                    {deckSize > 1 && (
                        <div className="deck-pile-card">
                            <CardView card={{ suit: 'Spade', value: '2' }} isFaceDown lang={language} />
                        </div>
                    )}
                    <div className="briscola-card-rotated">
                        <CardView card={briscolaCard} lang={language} />
                    </div>
                </div>
            )}

            <div className="player-area ai-area">
                <div className="hand">
                    {aiHand.map((_, index) => <CardView key={index} card={{ suit: 'Spade', value: '2' }} isFaceDown lang={language} />)}
                </div>
            </div>

            <div className="table-area">
                <div className="played-cards">
                    {cardsOnTable.map((card) => <CardView key={getCardId(card, language)} card={card} lang={language} />)}
                    {isAiThinkingMove && <div className="spinner" aria-label="L'IA sta pensando"></div>}
                </div>
            </div>

            <div className="player-area human-area">
                <div className="hand">
                    {humanHand.map(card => (
                        <CardView
                            key={getCardId(card, language)}
                            card={card}
                            isPlayable={turn === 'human' && !isProcessing && !animatingCard && !drawingCards}
                            onClick={() => onPlayCard(card)}
                            lang={language}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};