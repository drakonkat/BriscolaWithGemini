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
    isAiThinking: boolean;
    turn: Player;
    onPlayCard: (card: Card) => void;
    language: Language;
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
    isAiThinking,
    turn,
    onPlayCard,
    language
}: GameBoardProps) => {

    const T = translations[language];

    return (
        <main className="game-board">
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
                    {isAiThinking && <div className="spinner" aria-label="L'IA sta pensando"></div>}
                </div>
                <div className="message-log" aria-live="polite">{message}</div>
            </div>

            <div className="player-area human-area">
                <div className="score">{T.scoreYou}: {humanScore}</div>
                <div className="hand">
                    {humanHand.map(card => (
                        <CardView
                            key={getCardId(card, language)}
                            card={card}
                            isPlayable={turn === 'human' && !isAiThinking}
                            onClick={() => onPlayCard(card)}
                            lang={language}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};
