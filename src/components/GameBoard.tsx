/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState } from 'react';
import { CardView } from './CardView';
import { getCardId } from '../core/utils';
import { translations } from '../core/translations';
import type { Card, Element, GameplayMode, Language, Player, Suit, Waifu, AbilityType } from '../core/types';
import { CachedImage } from './CachedImage';
import { ElementIcon } from './ElementIcon';

const suitIcons: Record<Suit, string> = {
    'Bastoni': 'https://s3.tebi.io/waifubriscola/suits/bastoni.png',
    'Coppe': 'https://s3.tebi.io/waifubriscola/suits/coppe.png',
    'Spade': 'https://s3.tebi.io/waifubriscola/suits/spade.png',
    'denara': 'https://s3.tebi.io/waifubriscola/suits/denara.png',
};

const abilityToElement: Record<AbilityType, Element> = {
    'incinerate': 'fire',
    'tide': 'water',
    'cyclone': 'air',
    'fortify': 'earth',
};

const AbilityIndicator = ({ player, ability, charges, onActivate, lang }: { player: Player, ability: AbilityType, charges: number, onActivate?: () => void, lang: Language }) => {
    const T = translations[lang];
    const isReady = charges >= 2;
    const element = abilityToElement[ability];

    const title = `${T.ability}: ${T[ability]}\n${T[`${ability}Description`]}${isReady ? ` (${T.abilityReady})` : ''}`;

    const handleClick = () => {
        if (player === 'human' && isReady && onActivate) {
            onActivate();
        }
    };

    return (
        <div 
            className={`ability-indicator player-${player} ${isReady ? 'ready' : ''}`}
            onClick={handleClick}
            title={title}
            role={player === 'human' && isReady ? 'button' : undefined}
            tabIndex={player === 'human' && isReady ? 0 : -1}
        >
            <div className="ability-icon">
                <ElementIcon element={element} />
            </div>
            <div className="ability-charges">
                <div className={`charge-dot ${charges >= 1 ? 'filled' : ''}`}></div>
                <div className={`charge-dot ${charges >= 2 ? 'filled' : ''}`}></div>
            </div>
        </div>
    );
};


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
    currentWaifu: Waifu | null;
    onWaifuIconClick: () => void;
    isChatEnabled: boolean;
    unreadMessageCount: number;
    isAiTyping: boolean;
    waifuBubbleMessage: string;
    onCloseBubble: () => void;
    gameplayMode: GameplayMode;
    powerAnimation: { type: Element; player: Player } | null;
    humanAbility: AbilityType | null;
    aiAbility: AbilityType | null;
    humanAbilityCharges: number;
    aiAbilityCharges: number;
    onActivateHumanAbility: () => void;
    abilityTargetingState: 'incinerate' | 'fortify' | 'cyclone' | null;
    onTargetCard: (card: Card) => void;
    revealedAiHand: Card[] | null;
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
    currentWaifu,
    onWaifuIconClick,
    isChatEnabled,
    unreadMessageCount,
    isAiTyping,
    waifuBubbleMessage,
    onCloseBubble,
    gameplayMode,
    powerAnimation,
    humanAbility,
    aiAbility,
    humanAbilityCharges,
    aiAbilityCharges,
    onActivateHumanAbility,
    abilityTargetingState,
    onTargetCard,
    revealedAiHand,
}: GameBoardProps) => {

    const T = translations[language];
    const [isLegendExpanded, setIsLegendExpanded] = useState(true);
    const elements: Element[] = ['fire', 'water', 'air', 'earth'];

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

            {powerAnimation && powerAnimation.type === 'fire' && (
                <div className={`power-animation ${powerAnimation.player}`}>{'+3'}</div>
            )}
            
            {drawingCards && drawingCards.map((draw, index) => (
                <div key={`draw-${index}`} className={`drawing-card-container destination-${draw.destination} order-${index}`}>
                    <CardView card={{ id: 'facedown', suit: 'Spade', value: '2' }} isFaceDown lang={language} />
                </div>
            ))}

            {animatingCard && (
                <div className={`animating-card-container player-${animatingCard.player} position-${cardsOnTable.length}`}>
                    <CardView card={animatingCard.card} lang={language} element={animatingCard.card.element} />
                </div>
            )}
            
            <div className="top-bar">
                <div className="player-score ai-score">
                    {aiAbility && (
                        <AbilityIndicator player="ai" ability={aiAbility} charges={aiAbilityCharges} lang={language} />
                    )}
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
            </div>
            
            {gameplayMode === 'roguelike' && (
                <div className={`elemental-powers-panel ${!isLegendExpanded ? 'collapsed' : ''}`} title={T.elementalPowersTitle}>
                    <button className="elemental-powers-toggle" onClick={() => setIsLegendExpanded(!isLegendExpanded)} title={T.toggleLegend}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                        </svg>
                    </button>
                    {elements.map(element => {
                        const descriptionKey = `${element}Description` as 'fireDescription' | 'waterDescription' | 'airDescription' | 'earthDescription';
                        return (
                            <div key={element} className="elemental-power-row">
                               <ElementIcon element={element} />
                               <div className="elemental-power-description">
                                   <strong>{T[element]}:</strong>
                                   <span>{T[descriptionKey]}</span>
                               </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            <div className="deck-area-wrapper">
                {briscolaCard && (
                    <div className="deck-container" title={`${T.briscolaLabel}: ${getCardId(briscolaCard, language)}`}>
                        <div className="deck-pile-wrapper">
                            {/* The deck pile is visible as long as there are cards left to draw before the briscola */}
                            {deckSize > 1 && (
                                <CardView card={{ id: 'facedown', suit: 'Spade', value: '2' }} isFaceDown lang={language} />
                            )}
                            {deckSize > 0 && <span className="deck-size-indicator">{deckSize}</span>}
                        </div>
                        <div className="briscola-card-rotated">
                            <CardView card={briscolaCard} lang={language} element={briscolaCard.element} />
                        </div>
                    </div>
                )}
            </div>


            <div className="player-area ai-area">
                <div className="hand">
                    {(revealedAiHand || aiHand).map((card) => 
                        <CardView 
                            key={card.id} 
                            card={card} 
                            isFaceDown={!revealedAiHand} 
                            lang={language}
                            isPlayable={abilityTargetingState === 'incinerate'}
                            onClick={abilityTargetingState === 'incinerate' ? () => onTargetCard(card) : undefined}
                            className={abilityTargetingState === 'incinerate' ? 'targeting' : ''}
                            element={card.element}
                        />
                    )}
                </div>
            </div>

            <div className="table-area">
                <div className="played-cards">
                    {cardsOnTable.map((card) => <CardView key={card.id} card={card} lang={language} element={card.element} />)}
                    {isAiThinkingMove && <div className="spinner" aria-label="L'IA sta pensando"></div>}
                </div>
            </div>

            <div className="player-area human-area">
                <div className="hand">
                    {humanHand.map(card => (
                        <CardView
                            key={card.id}
                            card={card}
                            isPlayable={
                                (turn === 'human' && !isProcessing && !animatingCard && !drawingCards && !abilityTargetingState) ||
                                (abilityTargetingState !== null && abilityTargetingState !== 'incinerate')
                            }
                            onClick={() => {
                                if (abilityTargetingState) {
                                    onTargetCard(card);
                                } else {
                                    onPlayCard(card);
                                }
                            }}
                            lang={language}
                            className={
                                `${card.isFortified ? 'fortified' : ''} 
                                 ${abilityTargetingState && abilityTargetingState !== 'incinerate' ? 'targeting' : ''}
                                 ${card.isBurned ? 'burned' : ''}`
                            }
                            element={card.element}
                        />
                    ))}
                </div>
            </div>
            
            <div className="bottom-bar">
                <div className="player-score human-score">
                    <span>{T.scoreYou}: {humanScore}</span>
                    {humanAbility && (
                        <AbilityIndicator player="human" ability={humanAbility} charges={humanAbilityCharges} onActivate={onActivateHumanAbility} lang={language} />
                    )}
                </div>
                <div className="turn-message" aria-live="polite">
                    {message}
                </div>
            </div>
        </main>
    );
};