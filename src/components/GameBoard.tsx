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
                    <button className="legend-button" onClick={() => uiStore.openModal('legend')} aria-label={T.elementalPowers