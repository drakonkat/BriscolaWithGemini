/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useRef } from 'react';

export const GameModeCarousel = ({ gameplayMode, onGameModeChange, translations }) => {
    const gameModes = ['classic', 'roguelike', 'dungeon'];
    const gameModeContainerRef = useRef(null);
    const gameModeCardRefs = useRef([]);

    const changeGameMode = (direction) => {
        const currentIndex = gameModes.indexOf(gameplayMode);
        const newIndex = (currentIndex + direction + gameModes.length) % gameModes.length;
        const newMode = gameModes[newIndex];
        onGameModeChange(newMode);
    };

    useEffect(() => {
        const container = gameModeContainerRef.current;
        if (!container) return;

        const selectedIndex = gameModes.indexOf(gameplayMode);

        if (selectedIndex !== -1 && gameModeCardRefs.current[selectedIndex]) {
            const selectedCard = gameModeCardRefs.current[selectedIndex];
            if (selectedCard) {
                const scrollLeft = selectedCard.offsetLeft + (selectedCard.offsetWidth / 2) - (container.offsetWidth / 2);
                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [gameplayMode]);

    const setGameMode = (mode) => {
        onGameModeChange(mode);
    };

    return (
        <div className="game-mode-carousel-wrapper">
            <button className="carousel-nav-button prev" onClick={() => changeGameMode(-1)} aria-label="Previous game mode">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/></svg>
            </button>
            <div className="game-mode-selection" ref={gameModeContainerRef}>
                <button
                    ref={el => { gameModeCardRefs.current[0] = el; }}
                    className={`game-mode-card ${gameplayMode === 'classic' ? 'selected' : ''}`}
                    onClick={() => setGameMode('classic')}
                >
                    <span className="game-mode-icon">👑</span>
                    <h3>{translations.gameModeClassic}</h3>
                </button>
                <button
                    ref={el => { gameModeCardRefs.current[1] = el; }}
                    className={`game-mode-card ${gameplayMode === 'roguelike' ? 'selected' : ''}`}
                    onClick={() => setGameMode('roguelike')}
                >
                    <span className="game-mode-icon">🗺️</span>
                    <h3>{translations.gameModeRoguelike}</h3>
                </button>
                <button
                    ref={el => { gameModeCardRefs.current[2] = el; }}
                    className={`game-mode-card ${gameplayMode === 'dungeon' ? 'selected' : ''}`}
                    onClick={() => setGameMode('dungeon')}
                >
                    <span className="game-mode-icon">⚔️</span>
                    <h3>{translations.gameModeDungeon}</h3>
                </button>
            </div>
            <button className="carousel-nav-button next" onClick={() => changeGameMode(1)} aria-label="Next game mode">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </button>
        </div>
    );
};