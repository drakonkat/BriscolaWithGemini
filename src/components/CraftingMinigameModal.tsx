/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { playSound } from '../core/soundManager';

interface CraftingMinigameModalProps {
    isOpen: boolean;
}

export const CraftingMinigameModal = observer(({ isOpen }: CraftingMinigameModalProps) => {
    const { gachaStore, gameSettingsStore } = useStores();
    const { craftingAttempt, resolveCraftingAttempt, cancelCraftingAttempt } = gachaStore;
    const { language } = gameSettingsStore;

    const [position, setPosition] = useState(0); // 0 to 100
    const [result, setResult] = useState<'success' | 'failure' | null>(null);
    const [minigamePhase, setMinigamePhase] = useState<'idle' | 'countdown' | 'playing' | 'result'>('idle');
    const [countdown, setCountdown] = useState(3);
    const [gameTimer, setGameTimer] = useState(15);

    const animationFrameId = useRef<number>();
    const countdownIntervalRef = useRef<number>();
    const gameTimerIntervalRef = useRef<number>();
    const directionRef = useRef(1);
    
    const T = translations[language];
    
    const config = {
        R: { speed: 0.5, successZone: { start: 35, end: 65 } }, // 30% width
        SR: { speed: 0.8, successZone: { start: 40, end: 60 } }, // 20% width
        SSR: { speed: 1.2, successZone: { start: 45, end: 55 } }, // 10% width
    };

    const currentConfig = craftingAttempt ? config[craftingAttempt.rarity] : config.R;

    const cleanupTimers = () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        if (gameTimerIntervalRef.current) clearInterval(gameTimerIntervalRef.current);
    };

    const handleStop = (isTimeout = false) => {
        if (minigamePhase !== 'playing') return;
        
        cleanupTimers();
        setMinigamePhase('result');
        
        const isSuccess = !isTimeout && position >= currentConfig.successZone.start && position <= currentConfig.successZone.end;
        setResult(isSuccess ? 'success' : 'failure');
        
        resolveCraftingAttempt(isSuccess);

        setTimeout(() => {
            cancelCraftingAttempt();
        }, 2000);
    };

    // Main effect to start and cleanup the game
    useEffect(() => {
        if (isOpen && craftingAttempt) {
            setResult(null);
            setPosition(0);
            directionRef.current = 1;
            setGameTimer(15);
            setCountdown(3);
            setMinigamePhase('countdown');

            playSound('chat-notify');
            countdownIntervalRef.current = window.setInterval(() => {
                setCountdown(prev => {
                    const next = prev - 1;
                    if (next > 0) {
                        playSound('chat-notify');
                    } else if (next === 0) {
                        playSound('trick-win');
                    }
                    return next;
                });
            }, 1000);

        } else {
            cleanupTimers();
            setMinigamePhase('idle');
        }

        return cleanupTimers;
    }, [isOpen, craftingAttempt]);

    // Effect to transition from countdown to playing
    useEffect(() => {
        if (minigamePhase === 'countdown' && countdown <= 0) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            
            setMinigamePhase('playing');
            
            const animate = () => {
                setPosition(prevPosition => {
                    let newPos = prevPosition + (currentConfig.speed * directionRef.current);
                    if (newPos >= 100) {
                        newPos = 100;
                        directionRef.current = -1;
                    } else if (newPos <= 0) {
                        newPos = 0;
                        directionRef.current = 1;
                    }
                    return newPos;
                });
                animationFrameId.current = requestAnimationFrame(animate);
            };
            animationFrameId.current = requestAnimationFrame(animate);

            gameTimerIntervalRef.current = window.setInterval(() => {
                setGameTimer(prev => prev - 1);
            }, 1000);
        }
    }, [minigamePhase, countdown]);

    // Effect for game timeout
    useEffect(() => {
        if (minigamePhase === 'playing' && gameTimer <= 0) {
            handleStop(true);
        }
    }, [minigamePhase, gameTimer]);
    
    if (!isOpen || !craftingAttempt) {
        return null;
    }

    const { start, end } = currentConfig.successZone;
    const successZoneWidth = end - start;

    return (
        <div className="game-over-overlay">
            <div className="crafting-minigame-modal">
                <h2>{T.craftingMinigame.title}</h2>
                <p>{T.craftingMinigame.instructions}</p>
                
                {minigamePhase === 'countdown' && (
                    <div className="minigame-countdown">
                        {countdown > 0 ? countdown : ''}
                    </div>
                )}

                {(minigamePhase === 'playing' || minigamePhase === 'result') && (
                    <>
                        {minigamePhase === 'playing' && <div className="minigame-timer">{gameTimer}s</div>}
                        <div className="minigame-container">
                            <div className="minigame-track">
                                <div
                                    className="minigame-zone minigame-success-zone"
                                    style={{ left: `${start}%`, width: `${successZoneWidth}%` }}
                                />
                                <div
                                    className="minigame-zone minigame-marker"
                                    style={{ left: `calc(${position}% - 5px)` }}
                                />
                            </div>
                        </div>
                    </>
                )}

                {minigamePhase === 'playing' && (
                    <button className="start-game-button" onClick={() => handleStop(false)}>
                        {T.craftingMinigame.stop}
                    </button>
                )}

                {minigamePhase === 'result' && result && (
                    <div className={`minigame-result ${result}`}>
                        {result === 'success' ? T.craftingMinigame.success : T.craftingMinigame.failure}
                    </div>
                )}
            </div>
        </div>
    );
});