/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { CardView } from './CardView';
import { getCardId, getImageUrl } from '../core/utils';
import { translations } from '../core/translations';
import type { Card, Element, Player, Waifu, AbilityType, RoguelikeState } from '../core/types';
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

const AbilityIndicator = observer(({ player }: { player: Player }) => {
    const { gameStateStore, gameSettingsStore } = useStores();
    const { humanAbilityCharges, aiAbilityCharges, isProcessing, abilityTargetingState, abilityUsedThisTurn, abilityArmed } = gameStateStore;
    const T = translations[gameSettingsStore.language];
    
    const humanAbility = gameStateStore.roguelikeState.humanAbility;
    const aiAbility = gameStateStore.roguelikeState.aiAbility;

    if (player === 'ai' && aiAbility) {
        return (
            <div 
                className={`ability-indicator player-ai`}
                title={`${T.ability}: ${T[aiAbility]}\n${T[`${aiAbility}Description`]}`}
            >
                <div className="ability-icon">
                    <ElementIcon element={abilityToElement[aiAbility]} />
                </div>
                <div className="ability-charges">
                    <div className={`charge-dot ${aiAbilityCharges >= 1 ? 'filled' : ''}`}></div>
                    <div className={`charge-dot ${aiAbilityCharges >= 2 ? 'filled' : ''}`}></div>
                </div>
            </div>
        );
    }

    if (player === 'human' && humanAbility) {
        const isAbilityUnusable = isProcessing || !!abilityTargetingState || !!abilityUsedThisTurn || !!abilityArmed;
        let isFireAbilityDisabled = true;
        if (humanAbility === 'incinerate') {
            isFireAbilityDisabled = (gameStateStore.cardsOnTable.length !== 1 || gameStateStore.trickStarter === 'human');
        }
        return (
            <div 
                className={`ability-indicator player-human ${humanAbilityCharges >= 2 ? 'ready' : ''} ${isAbilityUnusable || (humanAbility === 'incinerate' && isFireAbilityDisabled) ? 'disabled' : ''}`}
                onClick={() => gameStateStore.activateHumanAbility()}
                title={`${T.ability}: ${T[humanAbility]}\n${T[`${humanAbility}Description`]}${humanAbilityCharges >= 2 ? ` (${T.abilityReady})` : ''}`}
                role={humanAbilityCharges >= 2 ? 'button' : undefined}
                tabIndex={humanAbilityCharges >= 2 && !isAbilityUnusable ? 0 : -1}
            >
                <div className="ability-icon">
                    <ElementIcon element={abilityToElement[humanAbility]} />
                </div>
                <div className="ability-charges">
                    <div className={`charge-dot ${humanAbilityCharges >= 1 ? 'filled' : ''}`}></div>
                    <div className={`charge-dot ${humanAbilityCharges >= 2 ? 'filled' : ''}`}></div>
                </div>
            </div>
        );
    }

    return null;
});


export const GameBoard = observer(() => {
    const { gameStateStore, uiStore, gameSettingsStore } = useStores();
    const { 
        currentWaifu, aiScore, aiHand, humanScore, humanHand, briscolaCard, deck, cardsOnTable, message,
        isProcessing, turn, trickStarter, backgroundUrl, lastTrick, lastTrickHighlights, activeElements,
        roguelikeState, abilityArmed, powerAnimation, cardForElementalChoice, elementalClash,
        abilityTargetingState, abilityUsedThisTurn, revealedAiHand, 
// FIX: Property 'isTutorialGame' does not exist on type 'GameStateStore'.
isTutorialGame,
    } = gameStateStore;
    const { animatingCard, drawingCards, unreadMessageCount, waifuBubbleMessage } = uiStore;
    const { language, isChatEnabled, gameplayMode, isMusicEnabled, cardDeckStyle } = gameSettingsStore;
    
    const T = translations[language];
    const TC = T.elementalClash;
    const [isLegendExpanded, setIsLegendExpanded] = useState(true);

    const winningScore = 60;
    const maxBlur = 25;
    const blurValue = Math.max(0, maxBlur * (1 - Math.min(humanScore, winningScore) / winningScore));

    const backgroundStyle = {
        filter: `blur(${blurValue}px) brightness(0.7)`
    };

    const waifuIconAriaLabel = isChatEnabled ? T.chatWith(currentWaifu?.name ?? '') : T.waifuDetails(currentWaifu?.name ?? '');
    
    const humanCardOnTable = cardsOnTable.length > 0 ? (trickStarter === 'human' ? cardsOnTable[0] : cardsOnTable[1]) : null;
    const aiCardOnTable = cardsOnTable.length > 0 ? (trickStarter === 'ai' ? cardsOnTable[0] : cardsOnTable[1]) : null;

    return (
        <main className="game-board" data-tutorial-id="end-tutorial">
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
                    <CardView card={{ id: 'facedown', suit: 'Spade', value: '2' }} isFaceDown lang={language} cardDeckStyle={cardDeckStyle} />
                </div>
            ))}

            {animatingCard && (
                <div className={`animating-card-container player-${animatingCard.player} position-${cardsOnTable.length}`}>
                    <CardView card={animatingCard.card} lang={language} cardDeckStyle={cardDeckStyle} />
                </div>
            )}
            
            <div className="top-bar">
                 <div className="player-info-group">
                    <div className="player-score ai-score">
                        <span>{currentWaifu?.name ?? 'AI'}: {aiScore}</span>
                    </div>
                    {roguelikeState.aiAbility && <AbilityIndicator player="ai" />}
                </div>
            </div>

            <div className="waifu-status-container" data-tutorial-id="waifu-status">
                {currentWaifu && (
                    <button className="waifu-status-button" onClick={() => isChatEnabled ? uiStore.openModal('chat') : uiStore.openModal('waifuDetails')} aria-label={waifuIconAriaLabel}>
                        <CachedImage imageUrl={getImageUrl(currentWaifu.avatar)} alt={currentWaifu.name} className="waifu-status-avatar" />
                        {isChatEnabled && unreadMessageCount > 0 && <span className="waifu-status-badge">{unreadMessageCount}</span>}
                    </button>
                )}
                 {waifuBubbleMessage && (
                    <div className="waifu-message-bubble">
                        {waifuBubbleMessage}
                        <button className="bubble-close-button" onClick={uiStore.closeWaifuBubble} aria-label={T.close}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div className="top-left-actions">
                <button className="back-button" onClick={() => uiStore.openModal('confirmLeave')} aria-label={T.backToMenu}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                </button>
                <button className="support-button" onClick={() => uiStore.openModal('support')} aria-label={T.supportModal.title}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
                <button className={`music-button ${isMusicEnabled ? 'active' : ''}`} onClick={() => gameSettingsStore.setIsMusicEnabled(!isMusicEnabled)} aria-label={T.toggleMusic}>
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

                    {(roguelikeState.humanAbility || roguelikeState.aiAbility) && (
                        <>
                            <h3 className="abilities-subtitle">{T.abilitiesTitle}</h3>
                            {roguelikeState.humanAbility && (
                                <div className="elemental-power-row">
                                    <ElementIcon element={abilityToElement[roguelikeState.humanAbility]} />
                                    <div className="elemental-power-description">
                                        <strong>{T.scoreYou}:</strong>
                                        <span> {T[`${roguelikeState.humanAbility}Description` as keyof typeof T] as string}</span>
                                    </div>
                                </div>
                            )}
                            {roguelikeState.aiAbility && (
                                <div className="elemental-power-row">
                                    <ElementIcon element={abilityToElement[roguelikeState.aiAbility]} />
                                    <div className="elemental-power-description">
                                        <strong>{currentWaifu?.name}:</strong>
                                        <span> {T[`${roguelikeState.aiAbility}Description` as keyof typeof T] as string}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
            
            <div className="deck-area-wrapper" data-tutorial-id="briscola-deck">
                {briscolaCard && (
                    <div className="deck-container" title={`${T.briscolaLabel}: ${getCardId(briscolaCard, language)}`}>
                        <div className="deck-pile-wrapper">
                            {deck.length > 0 && (
                                <CardView card={{ id: 'facedown', suit: 'Spade', value: '2' }} isFaceDown lang={language} cardDeckStyle={cardDeckStyle} />
                            )}
                            {(deck.length + (briscolaCard ? 1 : 0)) > 0 && <span className="deck-size-indicator">{deck.length + (briscolaCard ? 1 : 0)}</span>}
                        </div>
                        <div className="briscola-card-rotated">
                            <CardView card={briscolaCard} lang={language} cardDeckStyle={cardDeckStyle} />
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
                                onClick={() => !isUsed && gameStateStore.activateFollowerAbility(follower.name)}
                            >
                                <CachedImage imageUrl={getImageUrl(follower.avatar)} alt={follower.name} className="follower-waifu-avatar" />
                            </div>
                        );
                    })}
                    {abilityArmed && ['sakura_blessing', 'rei_analysis', 'kasumi_gambit'].includes(abilityArmed) && (
                         <button className="cancel-follower-ability-button" onClick={gameStateStore.cancelFollowerAbility}>{T.cancelFollowerAbility}</button>
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
                            cardDeckStyle={cardDeckStyle}
                        />
                    )}
                </div>
            </div>

            <div className="table-area">
                {abilityTargetingState === 'incinerate' && (
                    <div className="incinerate-cancel-container">
                        <button className="cancel-ability-button" onClick={gameStateStore.cancelAbilityTargeting}>
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
                                onClick={isTargetForIncinerate ? gameStateStore.targetCardOnTableForAbility : undefined}
                                isPlayable={isTargetForIncinerate}
                                cardDeckStyle={cardDeckStyle}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="player-area human-area">
                <div className="hand" data-tutorial-id="player-hand">
                    {humanHand.map(card => (
                        <CardView
                            key={card.id}
                            card={card}
                            isPlayable={turn === 'human' && !isProcessing && !abilityTargetingState && !abilityUsedThisTurn}
                            onClick={() => {
                                // FIX: Property 'playTutorialCard' does not exist on type 'GameStateStore'.
                                if (isTutorialGame) {
                                    gameStateStore.playTutorialCard(card);
                                } else if (abilityTargetingState) {
                                    gameStateStore.targetCardInHandForAbility(card);
                                } else {
                                    gameStateStore.selectCardForPlay(card);
                                }
                            }}
                            lang={language}
                            className={abilityTargetingState && abilityTargetingState !== 'incinerate' ? 'targeting' : ''}
                            cardDeckStyle={cardDeckStyle}
                        />
                    ))}
                </div>
            </div>
            
            <div className="bottom-bar">
                <div className="player-info-group">
                    <div className="player-score human-score" data-tutorial-id="player-score">
                        <span>{T.scoreYou}: {humanScore}</span>
                    </div>
                    {roguelikeState.humanAbility && <AbilityIndicator player="human" />}
                </div>

                {lastTrick && !abilityUsedThisTurn && !abilityArmed && (
                    <button className="last-trick-recap" onClick={() => uiStore.openModal('history')} title={T.history.lastTrick}>
                        <CardView card={lastTrick.humanCard} lang={language} cardDeckStyle={cardDeckStyle} />
                        <CardView card={lastTrick.aiCard} lang={language} cardDeckStyle={cardDeckStyle} />
                        <span>{lastTrick.winner === 'human' ? T.scoreYou : currentWaifu?.name} +{lastTrick.points}</span>
                    </button>
                )}
                
                {abilityTargetingState && abilityTargetingState !== 'incinerate' && (
                    <button className="cancel-ability-button" onClick={gameStateStore.cancelAbilityTargeting}>
                        {T.cancelAbility}
                    </button>
                )}

                {abilityUsedThisTurn?.ability === 'incinerate' && (
                    <button className="undo-ability-button" onClick={gameStateStore.onUndoAbilityUse}>
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
                    onConfirm={gameStateStore.confirmCardPlay}
                    onCancel={gameStateStore.cancelCardPlay}
                    lang={language}
                    cardDeckStyle={cardDeckStyle}
                />
            )}

            {elementalClash && humanCardOnTable && aiCardOnTable && (
                <div className="elemental-clash-overlay">
                    {elementalClash.type === 'dice' ? (
                        <div className="elemental-clash-modal">
                             <button className="modal-close-button" onClick={gameStateStore.forceCloseClashModal} aria-label={T.close}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                            <h2>{TC.title}</h2>
                            <div className="clash-results">
                                <div className={`clash-player-result ${elementalClash.winner === 'human' ? 'winner' : ''} ${elementalClash.winner === 'tie' ? 'tie' : ''}`}>
                                    <CardView card={humanCardOnTable} lang={language} cardDeckStyle={cardDeckStyle} />
                                    <h3>{TC.yourRoll}</h3>
                                    <div className="clash-roll">{elementalClash.humanRoll}</div>
                                </div>
                                <div className={`clash-player-result ${elementalClash.winner === 'ai' ? 'winner' : ''} ${elementalClash.winner === 'tie' ? 'tie' : ''}`}>
                                    <CardView card={aiCardOnTable} lang={language} cardDeckStyle={cardDeckStyle} />
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
                             <button className="modal-close-button" onClick={gameStateStore.forceCloseClashModal} aria-label={T.close}>
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
                                    <CardView card={humanCardOnTable} lang={language} cardDeckStyle={cardDeckStyle} />
                                    <h3>{T.scoreYou}</h3>
                                </div>
                                <div className={`clash-player-result ${elementalClash.winner === 'ai' ? 'winner' : ''}`}>
                                    <CardView card={aiCardOnTable} lang={language} cardDeckStyle={cardDeckStyle} />
                                    <h3>{currentWaifu?.name}</h3>
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
});