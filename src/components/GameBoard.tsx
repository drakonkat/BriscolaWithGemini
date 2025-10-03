/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { CardView } from './CardView';
import { getCardId, getImageUrl } from '../core/utils';
import { translations } from '../core/translations';
import type { Card } from '../core/types';
import { CachedImage } from './CachedImage';
import { ElementIcon } from './ElementIcon';
import { ElementalChoiceModal } from './ElementalChoiceModal';
import { POWER_UP_DEFINITIONS } from '../core/roguelikePowers';
import { DiceRollAnimation } from './DiceRollAnimation';

export const GameBoard = observer(() => {
    const { gameStateStore, uiStore, gameSettingsStore } = useStores();
    const { 
        currentWaifu, aiScore, aiHand, humanScore, humanHand, briscolaCard, deck, cardsOnTable, message,
        isProcessing, turn, trickStarter, backgroundUrl, lastTrick, lastTrickHighlights, activeElements,
        roguelikeState, powerAnimation, cardForElementalChoice, elementalClash,
        revealedAiHand, lastTrickInsightCooldown, activateLastTrickInsight,
        briscolaSwapCooldown, openBriscolaSwapModal,
        confirmCardPlay, cancelCardPlay,
    } = gameStateStore;
    const { animatingCard, drawingCards, unreadMessageCount, waifuBubbleMessage } = uiStore;
    const { language, isChatEnabled, gameplayMode, isMusicEnabled, cardDeckStyle, isDiceAnimationEnabled } = gameSettingsStore;
    
    const T = translations[language];
    const T_roguelike = T.roguelike;
    const TH = T.history;
    const [isLegendExpanded, setIsLegendExpanded] = useState(true);
    const [isDiceRolling, setIsDiceRolling] = useState(false);

    useEffect(() => {
        if (elementalClash?.type === 'dice' && isDiceAnimationEnabled) {
            setIsDiceRolling(true);
        }
    }, [elementalClash, isDiceAnimationEnabled]);

    const winningScore = 60;
    const maxBlur = 25;
    const blurValue = Math.max(0, maxBlur * (1 - Math.min(humanScore, winningScore) / winningScore));

    const backgroundStyle = {
        filter: `blur(${blurValue}px) brightness(0.7)`
    };

    const waifuIconAriaLabel = isChatEnabled ? T.chatWith(currentWaifu?.name ?? '') : T.waifuDetails(currentWaifu?.name ?? '');
    
    const canSeeFullHistory = gameplayMode === 'classic' || (gameplayMode === 'roguelike' && roguelikeState.activePowers.some(p => p.id === 'third_eye'));
    const historyButtonTitle = canSeeFullHistory ? TH.title : T_roguelike.powers.third_eye.historyLockedDesc;

    const humanCardForClash = elementalClash ? (trickStarter === 'human' ? cardsOnTable[0] : cardsOnTable[1]) : null;
    const aiCardForClash = elementalClash ? (trickStarter === 'ai' ? cardsOnTable[0] : cardsOnTable[1]) : null;
    
    return (
        <main className="game-board" data-tutorial-id="end-tutorial">
            <CachedImage 
                imageUrl={backgroundUrl} 
                alt={T.gameBoardBackground} 
                className="game-board-background"
                style={backgroundStyle}
            />

            {powerAnimation && (
                <div className={`power-animation ${powerAnimation.player} element-${powerAnimation.type}`}>
                    {`+${powerAnimation.points}`}
                </div>
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
                        {waifuBubbleMessage.split('*').map((part, i) =>
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
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
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3z"></path>
                        }
                    </svg>
                </button>
            </div>
            
            {gameplayMode === 'roguelike' && (activeElements.length > 0 || roguelikeState.activePowers.length > 0) && (
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

                    {activeElements.length > 0 && (
                        <>
                           <h4 className="abilities-subtitle">{T.roguelike.elementalCycleTitle}</h4>
                           <div className="elemental-cycle-display">
                               <ElementIcon element="water" /> &gt; <ElementIcon element="fire" /> &gt; <ElementIcon element="air" /> &gt; <ElementIcon element="earth" /> &gt; <ElementIcon element="water" />
                           </div>
                        </>
                    )}

                    {roguelikeState.activePowers.length > 0 && (
                        <>
                            <h4 className="abilities-subtitle">{T.roguelike.allPowersTitle}</h4>
                            <div className="roguelike-powers-list">
                                {roguelikeState.activePowers.map(power => (
                                    <div key={power.id} className="roguelike-power-entry">
                                        <h5>{POWER_UP_DEFINITIONS[power.id].name(language)} (Lv. {power.level})</h5>
                                        <p>{POWER_UP_DEFINITIONS[power.id].description(language, power.level)}</p>
                                    </div>
                                ))}
                            </div>
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
                                className={`follower-waifu ${isUsed ? 'disabled' : ''}`}
                                title={`${abilityName}: ${abilityDesc}`}
                                onClick={() => !isUsed && gameStateStore.activateFollowerAbility(follower.name)}
                            >
                                <CachedImage imageUrl={getImageUrl(follower.avatar)} alt={follower.name} className="follower-waifu-avatar" />
                            </div>
                        );
                    })}
                </div>
            )}


            <div className="player-area ai-area">
                <div className="hand">
                    {(revealedAiHand || aiHand).map((card) => (
                        <React.Fragment key={card.id}>
                            <CardView 
                                card={card} 
                                isFaceDown={!revealedAiHand} 
                                lang={language}
                                cardDeckStyle={cardDeckStyle}
                            />
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="table-area">
                <div className="played-cards">
                    {cardsOnTable.map((card, index) => {
                        const owner = index === 0 ? trickStarter : (trickStarter === 'human' ? 'ai' : 'human');
                        const status = lastTrickHighlights[owner];
                        return (
                            <React.Fragment key={card.id}>
                                <CardView 
                                    card={card} 
                                    lang={language} 
                                    elementalEffectStatus={status === 'unset' ? undefined : status}
                                    className={''}
                                    cardDeckStyle={cardDeckStyle}
                                />
                            </React.Fragment>
                        );
                    })}
                </div>
                 {elementalClash && humanCardForClash && aiCardForClash && (
                    <div className={`elemental-clash-overlay ${elementalClash.type === 'weakness' ? 'weakness' : ''}`}>
                         <div className={`elemental-clash-modal ${elementalClash.type === 'weakness' ? 'weakness' : ''}`} onClick={gameStateStore.forceCloseClashModal}>
                            <h2>{elementalClash.type === 'weakness' ? T.elementalClash.weaknessTitle : T.elementalClash.title}</h2>
                            {isDiceRolling ? (
                                <div className="clash-rolling-container">
                                    <div className="clash-cards-preview">
                                        <CardView card={humanCardForClash} lang={language} cardDeckStyle={cardDeckStyle} />
                                        <CardView card={aiCardForClash} lang={language} cardDeckStyle={cardDeckStyle} />
                                    </div>
                                    <DiceRollAnimation onAnimationComplete={() => setIsDiceRolling(false)} />
                                </div>
                            ) : (
                                <>
                                    {elementalClash.type === 'weakness' ? (
                                        <>
                                            <div className="clash-cards-preview">
                                                <CardView card={humanCardForClash} lang={language} cardDeckStyle={cardDeckStyle} />
                                                <CardView card={aiCardForClash} lang={language} cardDeckStyle={cardDeckStyle} />
                                            </div>
                                            <div className="weakness-indicator">
                                                <ElementIcon element={elementalClash.winningElement} />
                                                <span>{T.elementalClash.beats}</span>
                                                <ElementIcon element={elementalClash.losingElement} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="clash-results">
                                            <div className="clash-player-result">
                                                <h3>{T.scoreYou}</h3>
                                                <CardView card={humanCardForClash} lang={language} cardDeckStyle={cardDeckStyle} />
                                                <div className="clash-roll">{elementalClash.humanRoll}</div>
                                            </div>
                                             <div className="clash-player-result">
                                                <h3>{currentWaifu?.name}</h3>
                                                <CardView card={aiCardForClash} lang={language} cardDeckStyle={cardDeckStyle} />
                                                <div className="clash-roll">{elementalClash.aiRoll}</div>
                                            </div>
                                        </div>
                                    )}
                                    <h3 className="clash-outcome">
                                        {elementalClash.winner === 'human' ? `${T.scoreYou} ${T.elementalClash.winner}` : elementalClash.winner === 'ai' ? `${currentWaifu?.name} ${T.elementalClash.winner}` : T.elementalClash.tie}
                                    </h3>
                                </>
                            )}
                        </div>
                    </div>
                 )}
            </div>

            <div className="player-area human-area">
                <div className="hand" data-tutorial-id="player-hand">
                    {humanHand.map(card => (
                        <React.Fragment key={card.id}>
                            <CardView
                                card={card}
                                isPlayable={turn === 'human' && !isProcessing}
                                onClick={() => gameStateStore.selectCardForPlay(card)}
                                lang={language}
                                className={''}
                                cardDeckStyle={cardDeckStyle}
                            />
                        </React.Fragment>
                    ))}
                </div>
            </div>
            
            <div className="bottom-bar">
                <div className="player-info-group">
                    <div className="player-score human-score" data-tutorial-id="player-score">
                        <span>{T.scoreYou}: {humanScore}</span>
                    </div>
                    {lastTrick && (
                        <button
                            className="last-trick-recap"
                            onClick={() => {
                                uiStore.openModal('history');
                            }}
                            title={historyButtonTitle}
                            disabled={!lastTrick}
                        >
                            <span>{TH.lastTrick}</span>
                            <CardView card={lastTrick.humanCard} lang={language} cardDeckStyle={cardDeckStyle} />
                            <CardView card={lastTrick.aiCard} lang={language} cardDeckStyle={cardDeckStyle} />
                        </button>
                    )}
                    {(() => {
                        const insightPower = roguelikeState.activePowers.find(p => p.id === 'last_trick_insight');
                        const swapPower = roguelikeState.activePowers.find(p => p.id === 'value_swap');

                        return (
                            <>
                                {insightPower && insightPower.level === 2 && (
                                    <button
                                        className={`ability-indicator player-human ${lastTrickInsightCooldown === 0 ? 'ready' : 'disabled'}`}
                                        onClick={activateLastTrickInsight}
                                        disabled={lastTrickInsightCooldown > 0 || turn !== 'human'}
                                        title={POWER_UP_DEFINITIONS['last_trick_insight'].name(language)}
                                    >
                                        <div className="ability-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5-4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/></svg>
                                        </div>
                                        {lastTrickInsightCooldown > 0 ? (
                                            <span>{T.abilities.onCooldown(lastTrickInsightCooldown)}</span>
                                        ) : (
                                            <span>{T.abilities.revealHand}</span>
                                        )}
                                    </button>
                                )}
                                {swapPower && (
                                    <button
                                        className={`ability-indicator player-human ${briscolaSwapCooldown === 0 ? 'ready' : 'disabled'}`}
                                        onClick={openBriscolaSwapModal}
                                        disabled={briscolaSwapCooldown > 0 || turn !== 'human'}
                                        title={POWER_UP_DEFINITIONS['value_swap'].name(language)}
                                    >
                                        <div className="ability-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.99 11 3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>
                                        </div>
                                        {briscolaSwapCooldown > 0 ? (
                                            <span>{T.abilities.onCooldown(briscolaSwapCooldown)}</span>
                                        ) : (
                                            <span>{POWER_UP_DEFINITIONS['value_swap'].name(language)}</span>
                                        )}
                                    </button>
                                )}
                            </>
                        );
                    })()}
                </div>
                <div className="turn-message">
                    {message}
                </div>
            </div>
             {cardForElementalChoice && (
                <ElementalChoiceModal
                    card={cardForElementalChoice}
                    onConfirm={confirmCardPlay}
                    onCancel={cancelCardPlay}
                    lang={language}
                    cardDeckStyle={cardDeckStyle}
                />
            )}
        </main>
    );
});