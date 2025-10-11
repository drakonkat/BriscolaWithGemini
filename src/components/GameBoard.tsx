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
import { Tooltip } from './Tooltip';
import { SUITS_IT } from '../core/constants';

export const GameBoard = observer(() => {
    const { gameStateStore, uiStore, gameSettingsStore } = useStores();
    const { 
        currentWaifu, aiScore, aiHand, humanScore, humanHand, briscolaCard, deck, cardsOnTable, message,
        isProcessing, turn, trickStarter, backgroundUrl, lastTrick, lastTrickHighlights, activeElements,
        roguelikeState, powerAnimation, elementalClash, briscolaSuit,
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
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                    </button>
                </div>
            )}

            <div className="human-abilities-container">
                {insightPower && insightPower.level === 2 && (
                    // FIX: The Tooltip component was updated to correctly handle children, fixing this error.
                    <Tooltip content={`${T.roguelike.powers.last_trick_insight.name} (${T.abilities.onCooldown(lastTrickInsightCooldown)})`}>
                        <div className={`ability-indicator player-human ${lastTrickInsightCooldown === 0 ? 'ready' : 'disabled'}`}>
                            <button className="ability-icon" onClick={activateLastTrickInsight} disabled={lastTrickInsightCooldown > 0}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                </svg>
                            </button>
                            {lastTrickInsightCooldown > 0 && <span className="cooldown-badge">{lastTrickInsightCooldown}</span>}
                        </div>
                    </Tooltip>
                )}
                {swapPower && (
                    // FIX: The Tooltip component was updated to correctly handle children, fixing this error.
                    <Tooltip content={`${T.roguelike.powers.value_swap.name} (${briscolaSwapCooldown > 0 ? T.abilities.onCooldown(briscolaSwapCooldown) : T.abilityReady})`}>
                        <div className={`ability-indicator player-human ${briscolaSwapCooldown === 0 ? 'ready' : 'disabled'}`}>
                            <button className="ability-icon" onClick={openBriscolaSwapModal} disabled={briscolaSwapCooldown > 0}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
                                </svg>
                            </button>
                            {briscolaSwapCooldown > 0 && <span className="cooldown-badge">{briscolaSwapCooldown}</span>}
                        </div>
                    </Tooltip>
                )}
            </div>
            
            <div className="followers-container">
                {roguelikeState.followers.map(follower => {
                    const isUsed = roguelikeState.followerAbilitiesUsedThisMatch.includes(follower.name);
                    const T_follower = T as any;
                    const abilityId = follower.followerAbilityId;
                    const abilityName = abilityId ? (T_follower[abilityId] ?? abilityId) : '';
                    const abilityDescKey = abilityId ? `${abilityId}_desc` : null;
                    const abilityDesc = abilityDescKey ? (T_follower[abilityDescKey] ?? '') : '';

                    return (
                        // FIX: Wrapped Tooltip in React.Fragment to solve key prop type error.
                        <React.Fragment key={follower.name}>
                            <Tooltip
                                content={
                                    <>
                                        <strong>{abilityName}</strong>
                                        <p>{abilityDesc}</p>
                                    </>
                                }
                            >
                                <button className="follower-ability-button" disabled={isUsed} onClick={() => gameStateStore.activateFollowerAbility(follower.name)}>
                                    <CachedImage imageUrl={getImageUrl(follower.avatar)} alt={follower.name} className="follower-waifu-avatar" />
                                    {isUsed && (
                                        <div className="used-overlay">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            </Tooltip>
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="table-area">
                <div className="deck-area-wrapper" data-tutorial-id="briscola-deck">
                    <div className="deck-container">
                        {deck.length > 0 && (
                            <div className="deck-pile-wrapper">
                                <CardView card={{ id: 'facedown', suit: 'Spade', value: '2' }} isFaceDown lang={language} cardDeckStyle={cardDeckStyle} />
                                <div className="deck-size-indicator" aria-label={T.remainingCardsLabel}>
                                    {deck.length}
                                </div>
                            </div>
                        )}
                        {briscolaCard && (
                            <div className="briscola-card-rotated" aria-label={`${T.briscolaLabel}: ${getCardId(briscolaCard, language)}`}>
                                <CardView card={briscolaCard} lang={language} cardDeckStyle={cardDeckStyle} isPlayable={briscolaSwapCooldown === 0 && !!roguelikeState.activePowers.find(p => p.id === 'value_swap')} onClick={openBriscolaSwapModal} />
                            </div>
                        )}
                        {deck.length === 0 && !briscolaCard && briscolaSuit && (
                            <div className="briscola-reminder">
                                <div className="briscola-reminder-label">{T.briscolaLabel}: {T.suits[SUITS_IT.indexOf(briscolaSuit)]}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="played-cards">
                    {cardsOnTable.map((card, index) => (
                        // FIX: Wrapped CardView in React.Fragment to solve key prop type error.
                        <React.Fragment key={card.id || index}>
                            <CardView card={card} lang={language} cardDeckStyle={cardDeckStyle} />
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="player-area ai-area">
                <div className="hand">
                    {aiHand.map((card, index) => (
                        // FIX: Wrapped CardView in React.Fragment to solve key prop type error.
                        <React.Fragment key={card.id || index}>
                            <CardView card={revealedAiHand ? card : { id: 'facedown', suit: 'Spade', value: '2' }} isFaceDown={!revealedAiHand} lang={language} cardDeckStyle={cardDeckStyle}/>
                        </React.Fragment>
                    ))}
                </div>
            </div>
            
            <div className="player-area human-area">
                 <div className="hand" data-tutorial-id="player-hand">
                    {humanHand.map((card, index) => (
                        // FIX: Wrapped CardView in React.Fragment to solve key prop type error.
                        <React.Fragment key={card.id || index}>
                            <CardView 
                                card={card} 
                                isPlayable={turn === 'human' && !isProcessing} 
                                lang={language} 
                                cardDeckStyle={cardDeckStyle}
                                className={draggingCardInfo?.card.id === card.id ? 'is-dragging' : ''}
                                onClick={() => gameStateStore.selectCardForPlay(card)}
                                isDraggable={gameplayMode === 'roguelike' && !!card.element && !card.isTemporaryBriscola}
                                onMouseDown={(e) => {
                                    if (gameplayMode === 'roguelike' && !!card.element && !card.isTemporaryBriscola) {
                                        handleDragStart(card, e);
                                    }
                                }}
                                onTouchStart={(e) => {
                                    if (gameplayMode === 'roguelike' && !!card.element && !card.isTemporaryBriscola) {
                                        handleDragStart(card, e);
                                    }
                                }}
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
                    <div ref={playerMenuRef} className="human-score-container">
                        <button className="player-score human-score" onClick={() => setIsPlayerMenuOpen(!isPlayerMenuOpen)}>
                             <svg className="menu-burger-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                            </svg>
                        </button>
                        {isPlayerMenuOpen && (
                            <div className="player-actions-popup">
                                <button className="popup-action-button" onClick={() => { uiStore.openModal('legend'); setIsPlayerMenuOpen(false); }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                    </svg>
                                    <span>{T.elementalPowersTitle}</span>
                                </button>
                                <button className="popup-action-button" onClick={() => { uiStore.openModal('settings'); setIsPlayerMenuOpen(false); }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                                        <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l-.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59-1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22-.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                                    </svg>
                                    <span>{T.settingsTitle}</span>
                                </button>
                                <button className={`popup-action-button ${isMusicEnabled ? 'active' : ''}`} onClick={() => { handleMusicButtonClick(); setIsPlayerMenuOpen(false); }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        {isMusicEnabled ? 
                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/> :
                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3z"></path>
                                        }
                                    </svg>
                                    <span>{T.toggleMusic}</span>
                                </button>
                                <button className="popup-action-button" onClick={() => { uiStore.openModal('support'); setIsPlayerMenuOpen(false); }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                    <span>{T.supportModal.title}</span>
                                </button>
                                <button className="popup-action-button" onClick={() => { uiStore.openModal('confirmLeave'); setIsPlayerMenuOpen(false); }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                                    </svg>
                                    <span>{T.backToMenu}</span>
                                </button>
                            </div>
                        )}
                    </div>
                 </div>

                <div className="turn-message-container">
                    <div className="player-score turn-message">{message}</div>
                </div>

                {lastTrick && (
                    // FIX: The Tooltip component was updated to correctly handle children, fixing this error.
                    <Tooltip content={canSeeFullHistory ? TH.title : T_roguelike.powers.third_eye.historyLockedDesc}>
                        <button className="last-trick-recap" title={historyButtonTitle} onClick={() => uiStore.openModal('history')}>
                            <span className="last-trick-text">{TH.lastTrick}:</span>
                            <CardView card={lastTrick.humanCard} lang={language} cardDeckStyle={cardDeckStyle} />
                            <CardView card={lastTrick.aiCard} lang={language} cardDeckStyle={cardDeckStyle} />
                            <svg className="last-trick-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 9-9c0-4.97-4.03-9-9-9zm-1 5v5l4.25 2.52.75-1.23-3.5-2.07V8H12z"></path></svg>
                        </button>
                    </Tooltip>
                )}
            </div>
        </main>
    );
});