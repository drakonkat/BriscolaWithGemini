/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';

export const DifficultyCarousel = observer(({
    difficulty,
    gameplayMode,
    onDifficultyChange,
    translations
}) => {
    const T = translations;

    const difficultyContainerRef = useRef(null);
    const difficultyCardRefs = useRef([]);

    const difficulties = ['easy', 'medium', 'hard', 'nightmare', 'apocalypse'];

    const changeDifficulty = (direction) => {
        const currentIndex = difficulties.indexOf(difficulty);
        const newIndex = (currentIndex + direction + difficulties.length) % difficulties.length;
        onDifficultyChange(difficulties[newIndex]);
    };

    useEffect(() => {
        const container = difficultyContainerRef.current;
        if (!container) return;

        const selectedIndex = difficulties.indexOf(difficulty);

        if (selectedIndex !== -1 && difficultyCardRefs.current[selectedIndex]) {
            const selectedCard = difficultyCardRefs.current[selectedIndex];
            if (selectedCard) {
                const scrollLeft = selectedCard.offsetLeft + (selectedCard.offsetWidth / 2) - (container.offsetWidth / 2);
                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [difficulty]);

    if (gameplayMode === 'dungeon') {
        return (
            <div className="difficulty-locked-message">
                <span className="difficulty-icon nightmare-icon">🖤🖤🖤</span>
                <h3>{T.difficultyNightmare}</h3>
                <p>{T.challengeMatch?.difficultyLocked}</p>
            </div>
        );
    }

    return (
        <div className="difficulty-carousel-wrapper">
            <button className="carousel-nav-button prev" onClick={() => changeDifficulty(-1)} aria-label="Previous difficulty">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/></svg>
            </button>
            <div className="difficulty-selection" ref={difficultyContainerRef}>
                <button
                    ref={el => { difficultyCardRefs.current[0] = el; }}
                    className={`difficulty-card ${difficulty === 'easy' ? 'selected' : ''}`}
                    onClick={() => onDifficultyChange('easy')}
                >
                    <span className="difficulty-icon">❤️</span>
                    <h3>{T.difficultyEasy}</h3>
                </button>
                <button
                    ref={el => { difficultyCardRefs.current[1] = el; }}
                    className={`difficulty-card ${difficulty === 'medium' ? 'selected' : ''}`}
                    onClick={() => onDifficultyChange('medium')}
                >
                    <span className="difficulty-icon">❤️❤️</span>
                    <h3>{T.difficultyMedium}</h3>
                </button>
                <button
                    ref={el => { difficultyCardRefs.current[2] = el; }}
                    className={`difficulty-card ${difficulty === 'hard' ? 'selected' : ''}`}
                    onClick={() => onDifficultyChange('hard')}
                >
                    <span className="difficulty-icon">❤️❤️❤️</span>
                    <h3>{T.difficultyHard}</h3>
                </button>
                <button
                    ref={el => { difficultyCardRefs.current[3] = el; }}
                    className={`difficulty-card ${difficulty === 'nightmare' ? 'selected' : ''}`}
                    onClick={() => onDifficultyChange('nightmare')}
                >
                    <span className="difficulty-icon nightmare-icon">🖤🖤🖤</span>
                    <h3>{T.difficultyNightmare}</h3>
                </button>
                <button
                    ref={el => { difficultyCardRefs.current[4] = el; }}
                    className={`difficulty-card ${difficulty === 'apocalypse' ? 'selected' : ''}`}
                    onClick={() => onDifficultyChange('apocalypse')}
                >
                    <span className="difficulty-icon">💀💀💀</span>
                    <h3>{T.difficultyApocalypse}</h3>
                </button>
            </div>
            <button className="carousel-nav-button next" onClick={() => changeDifficulty(1)} aria-label="Next difficulty">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </button>
        </div>
    );
});