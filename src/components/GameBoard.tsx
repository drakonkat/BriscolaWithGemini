/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { CardView } from './CardView';
import { getCardId } from '../core/utils';
import { translations } from '../core/translations';
import type { Card, Language, Player, Waifu } from '../core/types';
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
    isMuted: boolean;
    onPlayCard: (card: Card) => void;
    onGoToMenu: () => void;
    onOpenSupportModal: () => void;
    language: Language;
    backgroundUrl: string;
    animatingCard: { card: Card; player: Player } | null;
    drawingCards: { destination: Player }[] | null;
    currentWaifu: Waifu | null;
    onWaifuIconClick: () => void;
    isChatEnabled: boolean;
    unreadMessageCount: number;
    isAiTyping: boolean;
    waifuBubbleMessage: string;
    onCloseBubble: () => void;
    onToggleMute: () => void;
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
    isMuted,
    onPlayCard,
    onGoToMenu,
    onOpenSupportModal,
    language,
    backgroundUrl,
    animatingCard,
    drawingCards,
    currentWaifu,
    onWaifuIconClick,
    isChatEnabled,
    unreadMessageCount,
    isAiTyping,
    waifuBubbleMessage,
    onCloseBubble,
    onToggleMute,
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

    const waifuIconAriaLabel = isChatEnabled ? T.chatWith(aiName) : T.waifuDetails(aiName);

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
            
            <div className="top-bar">
                <div className="player-score ai-score">
                    <span>{aiName}: {aiScore}</span>
                </div>
                <div className="waifu-status-container">
                    {currentWaifu && (
                        <button className="waifu-status-button" onClick={onWaifuIconClick} aria-label={waifuIconAriaLabel}>
                            <CachedImage imageUrl={currentWaifu.avatar} alt={aiName} className="waifu-status-avatar" />
                            {isChatEnabled && unreadMessageCount > 0 && !isAiTyping && <span className="waifu-status-badge">{unreadMessageCount}</span>}
                            {isChatEnabled && isAiTyping && <span className="waifu-status-badge typing"></span>}
                        </button>
                    )}
                </div>
                {waifuBubbleMessage && (
                    <div className="waifu-message-bubble">
                        {waifuBubbleMessage}
                        <button className="bubble-close-button" onClick={onCloseBubble} aria-label={T.close}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div className="top-left-actions">
                <button className="back-button" onClick={onGoToMenu} aria-label={T.backToMenu}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                </button>
                <button className="support-button" onClick={onOpenSupportModal} aria-label={T.supportModal.title}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
                <button className="music-button" onClick={onToggleMute} aria-label={T.toggleMusic}>
                    {isMuted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.28 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                    )}
                </button>
            </div>
            
            <div className="deck-area-wrapper">
                {briscolaCard && (
                    <div className="deck-container" title={`${T.briscolaLabel}: ${getCardId(briscolaCard, language)}`}>
                        <div className="deck-pile-wrapper">
                            {/* The deck pile is visible as long as there are cards left to draw before the briscola */}
                            {deckSize > 1 && (
                                <CardView card={{ suit: 'Spade', value: '2' }} isFaceDown lang={language} />
                            )}
                            {deckSize > 0 && <span className="deck-size-indicator">{deckSize}</span>}
                        </div>
                        <div className="briscola-card-rotated">
                            <CardView card={briscolaCard} lang={language} />
                        </div>
                    </div>
                )}
            </div>


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
            
            <div className="bottom-bar">
                <div className="player-score human-score">
                    <span>{T.scoreYou}: {humanScore}</span>
                </div>
                <div className="turn-message" aria-live="polite">
                    {message}
                </div>
            </div>
        </main>
    );
};