/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState } from 'react';
import { CardView } from './CardView';
import { getCardId, getImageUrl } from '../core/utils';
import { translations } from '../core/translations';
import type { Card, Element, ElementalClashResult, GameplayMode, Language, Player, Suit, Waifu, AbilityType, TrickHistoryEntry, RoguelikeState } from '../core/types';
import { CachedImage } from './CachedImage';
import { ElementIcon } from './ElementIcon';
import { ElementalChoiceModal } from './ElementalChoiceModal';

const abilityToElement: Record<AbilityType, Element> = {
    'incinerate': 'fire',
    'tide': 'water',
    'cyclone': 'air',
    'fortify': 'earth',
};

type ElementalEffectStatus = 'active' | 'inactive' | 'unset';

const AbilityIndicator = ({ player, ability, charges, onActivate, lang, disabled = false }: { player: Player, ability: AbilityType, charges: number, onActivate?: () => void, lang: Language, disabled?: boolean }) => {
    const T = translations[lang];
    const isReady = charges >= 2;
    const element = abilityToElement[ability];

    const title = `${T.ability}: ${T[ability]}\n${T[`${ability}Description`]}${isReady ? ` (${T.abilityReady})` : ''}`;

    const handleClick = () => {
        if (player === 'human' && isReady && onActivate && !disabled) {
            onActivate();
        }
    };

    return (
        <div 
            className={`ability-indicator player-${player} ${isReady ? 'ready' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={handleClick}
            title={title}
            role={player === 'human' && isReady ? 'button' : undefined}
            tabIndex={player === 'human' && isReady && !disabled ? 0 : -1}
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
    turn: Player;
    trickStarter: Player;
    onSelectCardForPlay: (card: Card) => void;
    onConfirmCardPlay: (activate: boolean) => void;
    onCancelCardPlay: () => void;
    onGoToMenu: () => void;
    onOpenSupportModal: () => void;
    onOpenHistoryModal: () => void;
    onCloseElementalClash: () => void;
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
    abilityUsedThisTurn: { ability: AbilityType; originalCard: Card } | null;
    onTargetCardInHand: (card: Card) => void;
    onTargetCardOnTable: () => void;
    onCancelAbility: () => void;
    onUndoAbilityUse: () => void;
    revealedAiHand: Card[] | null;
    cardForElementalChoice: Card | null;
    elementalClash: ElementalClashResult | null;
    lastTrickHighlights: { human: ElementalEffectStatus, ai: ElementalEffectStatus };
    lastTrick: TrickHistoryEntry | null;
    activeElements: Element[];
    roguelikeState: RoguelikeState;
    onActivateFollowerAbility: (waifuName: string) => void;
    onCancelFollowerAbility: () => void;
    abilityArmed: 'fortify' | 'sakura_blessing' | 'rei_analysis' | 'kasumi_gambit' | null;
    isMusicEnabled: boolean;
    onToggleMusic: () => void;
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
    turn,
    trickStarter,
    onSelectCardForPlay,
    onConfirmCardPlay,
    onCancelCardPlay,
    onGoToMenu,
    onOpenSupportModal,
    onOpenHistoryModal,
    onCloseElementalClash,
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
    abilityUsedThisTurn,
    onTargetCardInHand,
    onTargetCardOnTable,
    onCancelAbility,
    onUndoAbilityUse,
    revealedAiHand,
    cardForElementalChoice,
    elementalClash,
    lastTrickHighlights,
    lastTrick,
    activeElements,
    roguelikeState,
    onActivateFollowerAbility,
    onCancelFollowerAbility,
    abilityArmed,
    isMusicEnabled,
    onToggleMusic,
}: GameBoardProps) => {

    const T = translations[language];
    const TC = T.elementalClash;
    const [isLegendExpanded, setIsLegendExpanded] = useState(true);

    const winningScore = 60;
    const maxBlur = 25;
    const blurValue = Math.max(0, maxBlur * (1 - Math.min(humanScore, winningScore) / winningScore));

    const backgroundStyle = {
        filter: `blur(${blurValue}px) brightness(0.7)`
    };

    const waifuIconAriaLabel = isChatEnabled ? T.chatWith(aiName) : T.waifuDetails(aiName);
    
    const humanCardOnTable = cardsOnTable.length > 0 ? (trickStarter === 'human' ? cardsOnTable[0] : cardsOnTable[1]) : null;
    const aiCardOnTable = cardsOnTable.length > 0 ? (trickStarter === 'ai' ? cardsOnTable[0] : cardsOnTable[1]) : null;

    const isAbilityUnusable = isProcessing || !!abilityTargetingState || !!abilityUsedThisTurn || !!abilityArmed;
    let isFireAbilityDisabled = true;
    if (humanAbility === 'incinerate') {
        isFireAbilityDisabled = (cardsOnTable.length !== 1 || trickStarter === 'human');
    }

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
                    <CardView card={animatingCard.card} lang={language} />
                </div>
            )}
            
            <div className="top-bar">
                 <div className="player-info-group">
                    <div className="player-score ai-score">
                        <span>{aiName}: {aiScore}</span>
                    </div>
                    {aiAbility && (
                        <AbilityIndicator player="ai" ability={aiAbility} charges={aiAbilityCharges} lang={language} />
                    )}
                </div>
            </div>

            <div className="waifu-status-container">
                {currentWaifu && (
                    <button className="waifu-status-button" onClick={onWaifuIconClick} aria-label={waifuIconAriaLabel}>
                        <CachedImage imageUrl={getImageUrl(currentWaifu.avatar)} alt={aiName} className="waifu-status-avatar" />
                        {isChatEnabled && unreadMessageCount > 0 && !isAiTyping && <span className="waifu-status-badge">{unreadMessageCount}</span>}
                        {isChatEnabled && isAiTyping && <span className="waifu-status-badge typing"></span>}
                    </button>
                )}
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
                <button className={`music-button ${isMusicEnabled ? 'active' : ''}`} onClick={onToggleMusic} aria-label={T.toggleMusic}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        {isMusicEnabled ? 
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/> :
                            <path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6.18l-2-2H4.27zM14 7h4v3.61l-2-2V7h-2v1.18l-2-2V3h4v4z"/>
                        }
                    </svg>
                </button>
            </div>
            
            {gameplayMode === 'roguelike' && activeElements.length > 0 && (
                <div className={`elemental-powers-panel ${!isLegendExpanded ? 'collapsed' : ''}`} title={T.elementalPowersTitle}>
                    <button className="elemental-powers-toggle" onClick={() => setIsLegendExpanded(!isLegendExpanded)} title={T.toggleLegend}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                        </svg>
                    </button>
                    {activeElements.map(element => {
                        const descriptionKey = `${element}Description` as 'fireDescription' | 'waterDescription' | 'airDescription' | 'earthDescription';
                        return (
                            <div key={element} className="elemental-power-row">
                               <ElementIcon element={element} />
                               <div className="elemental-power-description">
                                   <strong>{T[element]}:</strong>
                                   <span>{T[descriptionKey] as string}</span>
                               </div>
                            </div>
                        );
                    })}

                    {(humanAbility || aiAbility) && (
                        <>
                            <h3 className="abilities-subtitle">{T.abilitiesTitle}</h3>
                            {humanAbility && (
                                <div className="elemental-power-row">
                                    <ElementIcon element={abilityToElement[humanAbility]} />
                                    <div className="elemental-power-description">
                                        <strong>{T.scoreYou}:</strong>
                                        <span> {T[`${humanAbility}Description` as keyof typeof T] as string}</span>
                                    </div>
                                </div>
                            )}
                            {aiAbility && (
                                <div className="elemental-power-row">
                                    <ElementIcon element={abilityToElement[aiAbility]} />
                                    <div className="elemental-power-description">
                                        <strong>{aiName}:</strong>
                                        <span> {T[`${aiAbility}Description` as keyof typeof T] as string}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
            
            <div className="deck-area-wrapper">
                {briscolaCard && (
                    <div className="deck-container" title={`${T.briscolaLabel}: ${getCardId(briscolaCard, language)}`}>
                        <div className="deck-pile-wrapper">
                            {deckSize > 1 && (
                                <CardView card={{ id: 'facedown', suit: 'Spade', value: '2' }} isFaceDown lang={language} />
                            )}
                            {deckSize > 0 && <span className="deck-size-indicator">{deckSize}</span>}
                        </div>
                        <div className="briscola-card-rotated">
                            <CardView card={briscolaCard} lang={language} />
                        </div>
                    </div>
                )}
            </div>

            {gameplayMode === 'roguelike' && roguelikeState.followers.length > 0 && (
                <div className="followers-container">
                    {roguelikeState.followers.map(follower => {
                        const isUsed = roguelikeState.followerAbilitiesUsedThisMatch.includes(follower.name);
                        const abilityKey = `${follower.name.toLowerCase()}_${isUsed ? 'used' : 'ready'}`;
                        const abilityName = T[`${follower.name.toLowerCase()}_blessing` as keyof typeof T] || T[`${follower.name.toLowerCase()}_analysis` as keyof typeof T] || T[`${follower.name.toLowerCase()}_gambit` as keyof typeof T];
                        const abilityDesc = T[`${follower.name.toLowerCase()}_blessing_desc` as keyof typeof T] || T[`${follower.name.toLowerCase()}_analysis_desc` as keyof typeof T] || T[`${follower.name.toLowerCase()}_gambit_desc` as keyof typeof T];

                        return (
                            <div
                                key={follower.name}
                                className={`follower-waifu ${isUsed ? 'disabled' : ''} ${abilityArmed?.startsWith(follower.name.toLowerCase()) ? 'armed' : ''}`}
                                title={`${abilityName}: ${abilityDesc}`}
                                onClick={() => !isUsed && onActivateFollowerAbility(follower.name)}
                            >
                                {/* FIX: Changed the `src` prop to `imageUrl` to match the CachedImage component's expected props. */}
                                <CachedImage imageUrl={getImageUrl(follower.avatar)} alt={follower.name} className="follower-waifu-avatar" />
                            </div>
                        );
                    })}
                    {abilityArmed && ['sakura_blessing', 'rei_analysis', 'kasumi_gambit'].includes(abilityArmed) && (
                         <button className="cancel-follower-ability-button" onClick={onCancelFollowerAbility}>{T.cancelFollowerAbility}</button>
                    )}
                </div>
            )}


            <div className="player-area ai-area">
                <div className="hand">
                    {(revealedAiHand || aiHand).map((card) => 
                        <CardView 
                            key={card.id} 
                            card={card} 
                            isFaceDown={!revealedAiHand} 
                            lang={language}
                        />
                    )}
                </div>
            </div>

            <div className="table-area">
                {abilityTargetingState === 'incinerate' && (
                    <div className="incinerate-cancel-container">
                        <button className="cancel-ability-button" onClick={onCancelAbility}>
                            {T.cancelAbility}
                        </button>
                    </div>
                )}
                <div className="played-cards">
                    {cardsOnTable.map((card, index) => {
                        const owner = index === 0 ? trickStarter : (trickStarter === 'human' ? 'ai' : 'human');
                        const status = lastTrickHighlights[owner];
                        const isTargetForIncinerate = abilityTargetingState === 'incinerate' && index === 0;
                        return (
                            <CardView 
                                key={card.id} 
                                card={card} 
                                lang={language} 
                                elementalEffectStatus={status === 'unset' ? undefined : status}
                                className={isTargetForIncinerate ? 'targeting' : ''}
                                onClick={isTargetForIncinerate ? onTargetCardOnTable : undefined}
                                isPlayable={isTargetForIncinerate}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="player-area human-area">
                <div className="hand">
                    {humanHand.map(card => (
                        <CardView
                            key={card.id}
                            card={card}
                            isPlayable={turn === 'human' && !isProcessing && !abilityTargetingState && !abilityUsedThisTurn}
                            onClick={() => {
                                if (abilityTargetingState) {
                                    onTargetCardInHand(card);
                                } else {
                                    onSelectCardForPlay(card);
                                }
                            }}
                            lang={language}
                            className={abilityTargetingState && abilityTargetingState !== 'incinerate' ? 'targeting' : ''}
                        />
                    ))}
                </div>
            </div>
            
            <div className="bottom-bar">
                <div className="player-info-group">
                    <div className="player-score human-score">
                        <span>{T.scoreYou}: {humanScore}</span>
                    </div>
                    {humanAbility && (
                        <AbilityIndicator 
                            player="human" 
                            ability={humanAbility} 
                            charges={humanAbilityCharges} 
                            onActivate={onActivateHumanAbility} 
                            lang={language} 
                            disabled={isAbilityUnusable || (humanAbility === 'incinerate' && isFireAbilityDisabled)}
                        />
                    )}
                </div>

                {lastTrick && !abilityUsedThisTurn && !abilityArmed && (
                    <button className="last-trick-recap" onClick={onOpenHistoryModal} title={T.history.lastTrick}>
                        <CardView card={lastTrick.humanCard} lang={language} />
                        <CardView card={lastTrick.aiCard} lang={language} />
                        <span>{lastTrick.winner === 'human' ? T.scoreYou : aiName} +{lastTrick.points}</span>
                    </button>
                )}
                
                {abilityTargetingState && abilityTargetingState !== 'incinerate' && (
                    <button className="cancel-ability-button" onClick={onCancelAbility}>
                        {T.cancelAbility}
                    </button>
                )}

                {abilityUsedThisTurn?.ability === 'incinerate' && (
                    <button className="undo-ability-button" onClick={onUndoAbilityUse}>
                        {T.undoIncinerate}
                    </button>
                )}

                <div className="turn-message" aria-live="polite">
                    {message}
                </div>
            </div>

            {cardForElementalChoice && (
                <ElementalChoiceModal 
                    card={cardForElementalChoice}
                    onConfirm={onConfirmCardPlay}
                    onCancel={onCancelCardPlay}
                    lang={language}
                />
            )}

            {elementalClash && humanCardOnTable && aiCardOnTable && (
                <div className="elemental-clash-overlay">
                    {elementalClash.type === 'dice' ? (
                        <div className="elemental-clash-modal">
                             <button className="modal-close-button" onClick={onCloseElementalClash} aria-label={T.close}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                            <h2>{TC.title}</h2>
                            <div className="clash-results">
                                <div className={`clash-player-result ${elementalClash.winner === 'human' ? 'winner' : ''} ${elementalClash.winner === 'tie' ? 'tie' : ''}`}>
                                    <CardView card={humanCardOnTable} lang={language} />
                                    <h3>{TC.yourRoll}</h3>
                                    <div className="clash-roll">{elementalClash.humanRoll}</div>
                                </div>
                                <div className={`clash-player-result ${elementalClash.winner === 'ai' ? 'winner' : ''} ${elementalClash.winner === 'tie' ? 'tie' : ''}`}>
                                    <CardView card={aiCardOnTable} lang={language} />
                                    <h3>{TC.opponentRoll}</h3>
                                    <div className="clash-roll">{elementalClash.aiRoll}</div>
                                </div>
                            </div>
                            <div className="clash-outcome">
                                {elementalClash.winner !== 'tie' ? TC.winner : TC.tie}
                            </div>
                        </div>
                    ) : (
                         <div className="elemental-clash-modal weakness">
                             <button className="modal-close-button" onClick={onCloseElementalClash} aria-label={T.close}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                            <h2>{TC.weaknessTitle}</h2>
                            <div className="weakness-indicator">
                                <ElementIcon element={elementalClash.winningElement} />
                                <span>{TC.beats}</span>
                                <ElementIcon element={elementalClash.losingElement} />
                            </div>
                            <div className="clash-results">
                                <div className={`clash-player-result ${elementalClash.winner === 'human' ? 'winner' : ''}`}>
                                    <CardView card={humanCardOnTable} lang={language} />
                                    <h3>{T.scoreYou}</h3>
                                </div>
                                <div className={`clash-player-result ${elementalClash.winner === 'ai' ? 'winner' : ''}`}>
                                    <CardView card={aiCardOnTable} lang={language} />
                                    <h3>{aiName}</h3>
                                </div>
                            </div>
                            <div className="clash-outcome">
                                {TC.winner}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
};
