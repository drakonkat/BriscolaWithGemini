/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores, RoguelikeModeStore } from '../stores';
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';
import { WAIFUS, BOSS_WAIFU } from '../core/waifus';
import { getImageUrl } from '../core/utils';
import type { Waifu } from '../core/types'; // Import Waifu for type definition

const MapNode = ({ type, label, avatarUrl, state }: { type: 'opponent' | 'powerup' | 'boss', label: string, avatarUrl?: string, state: 'completed' | 'current' | 'future' }) => {
    return (
        <div className={`map-node ${type} ${state}`}>
            <div className="map-node-icon">
                {type === 'powerup' ? (
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                ) : (
                    <CachedImage imageUrl={avatarUrl || ''} alt={label} />
                )}
            </div>
            <span className="map-node-label">{label}</span>
        </div>
    );
};

// FIX: Define an interface for the stage nodes to ensure correct type inference.
interface StageNode {
    type: 'opponent' | 'powerup' | 'boss';
    label: string;
    level?: number;
    opponent?: Waifu;
}

export const RoguelikeMap = observer(() => {
    const { gameStateStore, gameSettingsStore, uiStore } = useStores();
    const roguelikeStore = gameStateStore as RoguelikeModeStore;
    const { roguelikeState } = roguelikeStore;
    const { language } = gameSettingsStore;
    const { menuBackgroundUrl } = uiStore;
    const desktopScrollContainerRef = useRef<HTMLDivElement>(null);
    const mobileScrollContainerRef = useRef<HTMLDivElement>(null);

    const T = translations[language];

    const { currentLevel, waifuOpponents } = roguelikeState;

    const getOpponent = (index: number): Waifu | undefined => {
        const name = waifuOpponents[index];
        return name === BOSS_WAIFU.name ? BOSS_WAIFU : WAIFUS.find(w => w.name === name);
    };

    // FIX: Explicitly type the stages array to StageNode[] to maintain literal types for `type`.
    const stages: StageNode[] = [
        { type: 'powerup', label: T.roguelike.chooseYourPower },
        { type: 'opponent', level: 1, opponent: getOpponent(0), label: getOpponent(0)?.name || '' },
        { type: 'powerup', level: 1, label: T.roguelike.chooseYourPath },
        { type: 'opponent', level: 2, opponent: getOpponent(1), label: getOpponent(1)?.name || '' },
        { type: 'powerup', level: 2, label: T.roguelike.chooseYourPath },
        { type: 'opponent', level: 3, opponent: getOpponent(2), label: getOpponent(2)?.name || '' },
        { type: 'powerup', level: 3, label: T.roguelike.chooseYourPath },
        { type: 'boss', level: 4, opponent: getOpponent(3), label: getOpponent(3)?.name || '' },
    ];
    
    // The current stage index is determined by the level we are *about to start*
    // Level 1 -> stage index 1 (opponent 1)
    // Level 2 -> stage index 3 (opponent 2)
    const currentStageIndex = (currentLevel - 1) * 2 + 1;

    useEffect(() => {
        const timer = setTimeout(() => {
            const isMobile = window.innerWidth <= 768;
            const container = isMobile ? mobileScrollContainerRef.current : desktopScrollContainerRef.current;
            // FIX: The querySelector generic may not be supported in all TypeScript configurations. Replaced with an explicit type cast.
            const currentNode = container?.querySelector('.map-node.current') as HTMLElement | null;

            if (container && currentNode) {
                if (isMobile) {
                    const containerRect = container.getBoundingClientRect();
                    const nodeRect = currentNode.getBoundingClientRect();
                    const nodeTopRelativeToContainer = nodeRect.top - containerRect.top;
                    const scrollOffset = nodeTopRelativeToContainer - (containerRect.height / 2) + (nodeRect.height / 2);

                    container.scrollTo({
                        top: container.scrollTop + scrollOffset,
                        behavior: 'smooth'
                    });
                } else {
                    const centerPos = currentNode.offsetLeft + (currentNode.offsetWidth / 2) - (container.offsetWidth / 2);
                    container.scrollTo({
                        left: centerPos,
                        behavior: 'smooth'
                    });
                }
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [currentStageIndex]);


    const handleProceed = () => {
        roguelikeStore.startGame(null);
    };

    return (
        <div className="power-selection-screen">
            <CachedImage imageUrl={menuBackgroundUrl} alt="Roguelike Map Background" className="menu-background" />
            <div className="roguelike-map-content" ref={mobileScrollContainerRef}>
                <h1>{T.roguelike.chooseYourPath}</h1>
                <div className="map-container" ref={desktopScrollContainerRef}>
                    {stages.map((stage, index) => {
                        const state = index < currentStageIndex ? 'completed' : index === currentStageIndex ? 'current' : 'future';
                        return (
                            <React.Fragment key={index}>
                                <MapNode
                                    type={stage.type}
                                    label={stage.opponent?.name || stage.label}
                                    avatarUrl={stage.opponent ? getImageUrl(stage.opponent.avatar) : undefined}
                                    state={state}
                                />
                                {index < stages.length - 1 && (
                                    <div className={`map-connector ${index < currentStageIndex ? 'completed' : ''}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
                <div className="map-actions">
                    <button onClick={handleProceed}>
                        {`${T.startGame} (Level ${currentLevel})`}
                    </button>
                </div>
            </div>
        </div>
    );
});