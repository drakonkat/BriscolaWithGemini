/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { CardView } from './CardView';
import { getCardId, getImageUrl } from '../core/utils';
import { translations } from '../core/translations';
import { defaultSoundSettings } from '../core/soundManager';
import type { Card } from '../core/types';
import { CachedImage } from './CachedImage';
import { ElementIcon } from './ElementIcon';
import { POWER_UP_DEFINITIONS } from '../core/roguelikePowers';
import { DiceRollAnimation } from './DiceRollAnimation';

export const GameBoard = observer(() => {
    const { gameStateStore, uiStore, gameSettingsStore } = useStores();
    const { 
        currentWaifu, aiScore, aiHand, humanScore, humanHand, briscolaCard, deck, cardsOnTable, message,
        isProcessing, turn, trickStarter, backgroundUrl, lastTrick, lastTrickHighlights, activeElements,
        roguelikeState, powerAnimation, elementalClash,
        revealedAiHand, lastTrickInsightCooldown, activateLastTrickInsight,
        briscolaSwapCooldown, openBriscolaSwapModal,
        draggingCardInfo, clonePosition, currentDropZone,
        handleDragStart, handleDragMove, handleDragEnd,
    } = gameStateStore;
    const { animatingCard, drawingCards, unreadMessageCount, waifuBubbleMessage } = uiStore;
    const { language, isChatEnabled, gameplayMode, isMusicEnabled, cardDeckStyle, isDiceAnimationEnabled } = gameSettingsStore;
    
    const T = translations[language];
    const T_roguelike = T.roguelike;
    const TH = T.history;
    const [isDiceRolling, setIsDiceRolling] = useState(false);
    const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);
    const playerMenuRef = useRef<HTMLDivElement>(null);

    const normalZoneRef = useRef<HTMLDivElement>(null);
    const powerZoneRef = useRef<HTMLDivElement>(null);
    const cancelZoneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (elementalClash?.type === 'dice' && isDiceAnimationEnabled) {
            setIsDiceRolling(true);
        }
    }, [elementalClash, isDiceAnimationEnabled]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (playerMenuRef.current && !playerMenuRef.current.contains(event.target as Node)) {
                setIsPlayerMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const zoneElements = {
            normal: normalZoneRef.current,
            power: powerZoneRef.current,
            cancel: cancelZoneRef.current,
        };

        const moveHandler = (e: MouseEvent | TouchEvent) => {
            gameStateStore.handleDragMove(e, zoneElements);
        };

        const endHandler = () => {
            gameStateStore.handleDragEnd();
        };

        if (draggingCardInfo) {
            window.addEventListener('mousemove', moveHandler, { passive: false });
            window.addEventListener('touchmove', moveHandler, { passive: false });
            window.addEventListener('mouseup', endHandler);
            window.addEventListener('touchend', endHandler);
            window.addEventListener('touchcancel', endHandler);
            document.addEventListener('mouseleave', endHandler);
        }

        return () => {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('touchmove', moveHandler);
            window.removeEventListener('mouseup', endHandler);
            window.removeEventListener('touchend', endHandler);
            window.removeEventListener('touchcancel', endHandler);
            document.removeEventListener('mouseleave', endHandler);
        };
    }, [draggingCardInfo, gameStateStore]);


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
    
    const insightPower = roguelikeState.activePowers.find(p => p.id === 'last_trick_insight');
    const swapPower = roguelikeState.activePowers.find(p => p.id === 'value_swap');

    const handleMusicButtonClick = () => {
        const isMusicConfigured = JSON.stringify(gameSettingsStore.soundEditorSettings) !== JSON.stringify(defaultSoundSettings);
        if (isMusicConfigured) {
            gameSettingsStore.setIsMusicEnabled(!isMusicEnabled);
        } else {
            uiStore.openModal('soundEditor');
        }
    };

    return (
        <main className="game-board" data-tutorial-id="end-tutorial">
            <CachedImage 
                imageUrl={backgroundUrl} 
                alt={T.gameBoardBackground} 
                className="game-board-background"
                style={backgroundStyle}
            />
            
            {draggingCardInfo && clonePosition && (
                <div 
                    className="card-drag-clone"
                    style={{ 
                        position: 'fixed',
                        left: clonePosition.x,
                        top: clonePosition.y,
                        transform: 'translate(-50%, -50%) scale(1.15)',
                        pointerEvents: 'none',
                        zIndex: 1000,
                        willChange: 'transform'
                    }}
                >
                    <CardView card={draggingCardInfo.card} lang={language} cardDeckStyle={cardDeckStyle} />
                </div>
            )}

            {draggingCardInfo && (
                <>
                    <div className="drop-zones-container">
                        <div
                            ref={normalZoneRef}
                            className={`drop-zone left ${currentDropZone === 'normal' ? 'active' : ''}`}
                        >
                            <div className="drop-zone-content">
                                <h3>{T.playNormally}</h3>
                            </div>
                        </div>
                        <div
                            ref={powerZoneRef}
                            className={`drop-zone right ${currentDropZone === 'power' ? 'active' : ''}`}
                        >
                            <div className="drop-zone-content">
                                <h3>{T.activatePower}</h3>
                            </div>
                        </div>
                    </div>
                     <div 
                        ref={cancelZoneRef}
                        className={`drop-zone cancel ${currentDropZone === 'cancel' ? 'active' : ''}`}
                    >
                        <div className="drop-zone-content">
                            <h3>{T.cancelAbility}</h3> 
                        </div>
                    </div>
                </>
            )}

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
                <button className={`music-button ${isMusicEnabled ? 'active' : ''}`} onClick={handleMusicButtonClick} aria-label={T.toggleMusic}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        {isMusicEnabled ? 
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/> :
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3z"></path>
                        }
                    </svg>
                </button>
            </div>
            
            {gameplayMode === 'roguelike' && (activeElements.length > 0 || roguelikeState.activePowers.length > 0) && (
                <div className="bottom-left-actions">
                    <button className="legend-button" onClick={() => uiStore.openModal('legend')} aria-label={T.elementalPowersTitle}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99l1.5 1.5z"/></svg>
                    </button>
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
                        const abilityNameKey = `${follower.name.toLowerCase()}_blessing` as const || `${follower.name.toLowerCase()}_analysis` as const || `${follower.name.toLowerCase()}_gambit` as const;
                        const abilityName = T[abilityNameKey];
                        const abilityDescKey = `${abilityNameKey}_desc` as const;
                        const abilityDesc = T[abilityDescKey];
                        const isDisabled = isUsed || (follower.name === 'Rei' && aiScore < 5);

                        return (
                            <button
                                key={follower.name}
                                className={`follower-ability-button ${isDisabled ? 'disabled' : ''}`}
                                title={`${abilityName}: ${abilityDesc}`}
                                onClick={() => !isDisabled && gameStateStore.activateFollowerAbility(follower.name)}
                                aria-label={`Activate ${abilityName}`}
                                disabled={isDisabled}
                            >
                                <CachedImage imageUrl={getImageUrl(follower.avatar)} alt={follower.name} className="follower-waifu-avatar" />
                                <span className="follower-ability-name">{abilityName}</span>
                                {isUsed && (
                                    <div className="used-overlay">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z"/>
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="human-abilities-container">
                {insightPower && insightPower.level === 2 && (
                    <button
                        className={`ability-indicator player-human ${lastTrickInsightCooldown === 0 ? 'ready' : 'disabled'}`}
                        onClick={activateLastTrickInsight}
                        disabled={lastTrickInsightCooldown > 0 || turn !== 'human'}
                        title={POWER_UP_DEFINITIONS['last_trick_insight'].name(language)}
                    >
                        <div className="ability-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/></svg>
                        </div>
                        {lastTrickInsightCooldown > 0 && (
                            <span className="cooldown-badge">{lastTrickInsightCooldown}</span>
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
                        {briscolaSwapCooldown > 0 && (
                           <span className="cooldown-badge">{briscolaSwapCooldown}</span>
                        )}
                    </button>
                )}
            </div>

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
            </div>

            <div className="player-area human-area">
                <div className="hand" data-tutorial-id="player-hand">
                    {humanHand.map(card => {
                        const isDraggable = turn === 'human' && !isProcessing && gameplayMode === 'roguelike' && !!card.element && !card.isTemporaryBriscola;
                        const isClickable = turn === 'human' && !isProcessing && !isDraggable;
                        const isBeingDragged = draggingCardInfo?.card.id === card.id;
                        
                        return (
                            <React.Fragment key={card.id}>
                                <CardView
                                    card={card}
                                    isPlayable={isClickable}
                                    onClick={isClickable ? () => gameStateStore.selectCardForPlay(card) : undefined}
                                    lang={language}
                                    cardDeckStyle={cardDeckStyle}
                                    isDraggable={isDraggable}
                                    className={isBeingDragged ? 'is-dragging' : ''}
                                    onMouseDown={isDraggable ? (e) => handleDragStart(card, e) : undefined}
                                    onTouchStart={isDraggable ? (e) => handleDragStart(card, e) : undefined}
                                />
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="bottom-bar">
                <div className="player-info-group">
                    <div className="human-score-container" ref={playerMenuRef}>
                        <button className="player-score human-score" data-tutorial-id="player-score" onClick={() => setIsPlayerMenuOpen(!isPlayerMenuOpen)} aria-haspopup="true" aria-expanded={isPlayerMenuOpen}>
                            <svg className="menu-burger-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
                            <span>{T.scoreYou}: {humanScore}</span>
                        </button>
                        {isPlayerMenuOpen && (
                            <div className="player-actions-popup">
                                <button className="popup-action-button" onClick={() => { uiStore.openModal('confirmLeave'); setIsPlayerMenuOpen(false); }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                                    </svg>
                                    <span>{T.backToMenu}</span>
                                </button>
                                <button className="popup-action-button" onClick={() => { uiStore.openModal('support'); setIsPlayerMenuOpen(false); }}>
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                    <span>{T.supportModal.title}</span>
                                </button>
                                {gameplayMode === 'roguelike' && (activeElements.length > 0 || roguelikeState.activePowers.length > 0) && (
                                    <button className="popup-action-button" onClick={() => { uiStore.openModal('legend'); setIsPlayerMenuOpen(false); }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99l1.5 1.5z"/></svg>
                                        <span>{T.elementalPowersTitle}</span>
                                    </button>
                                )}
                                <button className={`popup-action-button ${isMusicEnabled ? 'active' : ''}`} onClick={() => { handleMusicButtonClick(); setIsPlayerMenuOpen(false); }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        {isMusicEnabled ? 
                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/> :
                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3z"></path>
                                        }
                                    </svg>
                                    <span>{T.toggleMusic}</span>
                                </button>
                            </div>
                        )}
                    </div>
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
                        <span className="last-trick-text">{TH.lastTrick}</span>
                        <svg className="last-trick-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z"/></svg>
                        <CardView card={lastTrick.humanCard} lang={language} cardDeckStyle={cardDeckStyle} />
                        <CardView card={lastTrick.aiCard} lang={language} cardDeckStyle={cardDeckStyle} />
                    </button>
                )}
                
                <div className="turn-message-container">
                    <span className="turn-message">{message}</span>
                </div>
            </div>
            
            {elementalClash && humanCardForClash && aiCardForClash && (
                <div className={`elemental-clash-overlay ${elementalClash.type === 'weakness' ? 'weakness' : ''}`} onClick={gameStateStore.forceCloseClashModal}>
                     <div className={`elemental-clash-modal ${elementalClash.type === 'weakness' ? 'weakness' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-button" onClick={gameStateStore.forceCloseClashModal} aria-label={T.close}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
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
        </main>
    );
});