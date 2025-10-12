/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';

interface CraftingMinigameModalProps {
    isOpen: boolean;
}

export const CraftingMinigameModal = observer(({ isOpen }: CraftingMinigameModalProps) => {
    const { gachaStore, gameSettingsStore } = useStores();
    const { craftingAttempt, resolveCraftingAttempt, cancelCraftingAttempt } = gachaStore;
    const { language } = gameSettingsStore;

    const [position, setPosition] = useState(0); // 0 to 100
    const [direction, setDirection] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [result, setResult] = useState<'success' | 'failure' | null>(null);

    const animationFrameId = useRef<number>();
    
    const T = translations[language];
    
    const config = {
        R: { speed: 0.5, successZone: { start: 35, end: 65 } }, // 30% width
        SR: { speed: 0.8, successZone: { start: 40, end: 60 } }, // 20% width
        SSR: { speed: 1.2, successZone: { start: 45, end: 55 } }, // 10% width
    };

    const currentConfig = craftingAttempt ? config[craftingAttempt.rarity] : config.R;
    
    useEffect(() => {
        if (isOpen && craftingAttempt) {
            setResult(null);
            setPosition(0);
            setDirection(1);
            setIsAnimating(true);

            const animate = () => {
                setPosition(prevPosition => {
                    let newPos = prevPosition + (currentConfig.speed * direction);
                    if (newPos > 100 || newPos < 0) {
                        setDirection(d => -d);
                        newPos = Math.max(0, Math.min(100, newPos));
                    }
                    return newPos;
                });
                animationFrameId.current = requestAnimationFrame(animate);
            };
            animationFrameId.current = requestAnimationFrame(animate);

        } else {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            setIsAnimating(false);
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isOpen, craftingAttempt]);

    const handleStop = () => {
        if (!isAnimating) return;
        
        setIsAnimating(false);
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }

        const isSuccess = position >= currentConfig.successZone.start && position <= currentConfig.successZone.end;
        setResult(isSuccess ? 'success' : 'failure');
        
        resolveCraftingAttempt(isSuccess);

        setTimeout(() => {
            cancelCraftingAttempt();
        }, 2000);
    };

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

                {result ? (
                    <div className={`minigame-result ${result}`}>
                        {result === 'success' ? T.craftingMinigame.success : T.craftingMinigame.failure}
                    </div>
                ) : (
                    <button className="start-game-button" onClick={handleStop} disabled={!isAnimating}>
                        {T.craftingMinigame.stop}
                    </button>
                )}
            </div>
        </div>
    );
});