
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import type { Waifu, Difficulty, GameplayMode } from '../core/types';
import { WaifuSelector } from './WaifuSelector';
import { CachedImage } from './CachedImage';
import { getImageUrl } from '../core/utils';
import { WAIFUS } from '../core/waifus';
import { ROGUELIKE_REWARDS } from '../core/constants';
import { DungeonModeStore, RoguelikeModeStore } from '../stores';
import { ElementIcon } from './ElementIcon';
import { EssenceIcon } from './EssenceIcon'; // Import the new EssenceIcon

export const Menu = observer(() => {
    const rootStore = useStores();
    const { gameSettingsStore, gameStateStore, uiStore, gachaStore, missionStore } = rootStore;
    const { language, gameplayMode, difficulty, isNsfwEnabled } = gameSettingsStore;
    const { menuBackgroundUrl } = uiStore;
    const { hasUnclaimedRewards } = missionStore;

    const T = translations[language];
    const [selectedWaifu, setSelectedWaifu] = useState<Waifu | null>(null);
    const [isRandomCardSelected, setIsRandomCardSelected] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [daysUntilDungeonSeasonEnd, setDaysUntilDungeonSeasonEnd] = useState<number | null>(null);
    
    const gameModes: GameplayMode[] = ['classic', 'roguelike', 'dungeon'];
    const gameModeContainerRef = useRef<HTMLDivElement>(null);
    const gameModeCardRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const calculateDaysRemaining = () => {
        const now = new Date();
        let targetDate = new Date(now.getFullYear(), 11, 24); // December is month 11 (0-indexed)

        // If today is after December 24th of the current year, set target for next year
        if (now.getTime() > targetDate.getTime()) {
            targetDate = new Date(now.getFullYear() + 1, 11, 24);
        }
        
        const diffTime = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysUntilDungeonSeasonEnd(Math.max(0, diffDays));
    };

    useEffect(() => {
        calculateDaysRemaining(); // Calculate on mount

        // Update daily
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const timeUntilTomorrow = tomorrow.getTime() - now.getTime();

        const dailyTimer = setTimeout(() => {
            calculateDaysRemaining();
            // Set up interval for subsequent daily updates
            setInterval(calculateDaysRemaining, 24 * 60 * 60 * 1000);
        }, timeUntilTomorrow);

        return () => clearTimeout(dailyTimer);
    }, []);

    const changeGameMode = (direction: number) => {
        const currentIndex = gameModes.indexOf(gameplayMode);
        const newIndex = (currentIndex + direction + gameModes.length) % gameModes.length;
        const newMode = gameModes[newIndex];
        gameSettingsStore.setGameplayMode(newMode);
    };

    const difficultyContainerRef = useRef<HTMLDivElement>(null);
    const difficultyCardRefs = useRef<(HTMLButtonElement | null)[]>([]);
    
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'nightmare', 'apocalypse'];

    const changeDifficulty = (direction: number) => {
        const currentIndex = difficulties.indexOf(difficulty);
        const newIndex = (currentIndex + direction + difficulties.length) % difficulties.length;
        gameSettingsStore.setDifficulty(difficulties[newIndex]);
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

    const moreMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (gameplayMode === 'roguelike' || gameplayMode === 'dungeon') {
            setSelectedWaifu(null);
            setIsRandomCardSelected(true);
        } else {
            setSelectedWaifu(WAIFUS.find(w => w.name === 'Sakura') || null);
            setIsRandomCardSelected(false);
        }
    }, [gameplayMode]);

    const handleWaifuSelection = (waifu: Waifu | null) => {
        if (waifu === null) {
            setSelectedWaifu(null);
            setIsRandomCardSelected(true);
        } else {
            setSelectedWaifu(waifu);
            setIsRandomCardSelected(false);
        }
    };
    
    const handleStartGame = () => {
        if (gameplayMode === 'roguelike') {
            if (gameStateStore instanceof RoguelikeModeStore) {
                gameStateStore.startRoguelikeRun(selectedWaifu);
            } else {
                console.error("Attempted to start roguelike game, but game state is not in roguelike mode.");
            }
        } else {
            gameStateStore.startGame(selectedWaifu);
        }
    }
    
    const handleDungeonClick = () => {
        const newMode = 'dungeon';
        gameSettingsStore.setGameplayMode(newMode);

        if (gachaStore.r_keys > 0 || gachaStore.sr_keys > 0 || gachaStore.ssr_keys > 0) {
            uiStore.openModal('challengeKeySelection');
        } else {
            uiStore.openModal('noKeys');
        }
    }

    const setGameMode = (mode: GameplayMode) => {
        gameSettingsStore.setGameplayMode(mode);
    }

    return (
        <div className="menu">
            {isNsfwEnabled && <CachedImage imageUrl={menuBackgroundUrl} alt="Game background" className="menu-background" />}
            <div className="menu-content" data-tutorial-id="welcome">
                <div className="menu-title-container">
                    <h1>{T.title}</h1>

                    <div className="menu-actions" ref={moreMenuRef}>
                        <button className="more-menu-button" onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} aria-label="More options" aria-haspopup="true" aria-expanded={isMoreMenuOpen}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"></path></svg>
                        </button>
                        <div className={`actions-popup ${isMoreMenuOpen ? 'open' : ''}`}>
                             <button className="rules-button" onClick={() => { uiStore.openModal('rules'); setIsMoreMenuOpen(false); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                </svg>
                                <span>{T.rulesTitle}</span>
                            </button>
                            <button className="rules-button" onClick={() => { uiStore.openModal('support'); setIsMoreMenuOpen(false); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                <span>{T.supportModal.title}</span>
                            </button>
                            <a href="mailto:service@tnl.one" className="rules-button">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                </svg>
                                <span>{T.supportEmail}</span>
                            </a>
                            <button className="rules-button" onClick={() => { uiStore.openModal('soundEditor'); setIsMoreMenuOpen(false); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                                    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
                                </svg>
                                <span>{T.soundEditorTitle}</span>
                            </button>
                            <button className="rules-button" onClick={() => { uiStore.openModal('settings'); setIsMoreMenuOpen(false); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                                    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l-.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59-1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22-.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                                </svg>
                                <span>{T.settingsTitle}</span>
                            </button>
                            {isNsfwEnabled && (
                                <button className="rules-button" onClick={() => { uiStore.refreshMenuBackground(); setIsMoreMenuOpen(false); }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                                    </svg>
                                    <span>{T.refreshBackground}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* The player wallet component will now be rendered by App.tsx in a popover */}
                

                <div className="menu-section" data-tutorial-id="game-mode">
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
                                <h3>{T.gameModeClassic}</h3>
                            </button>
                            <button 
                                ref={el => { gameModeCardRefs.current[1] = el; }}
                                className={`game-mode-card ${gameplayMode === 'roguelike' ? 'selected' : ''}`}
                                onClick={() => setGameMode('roguelike')}
                            >
                                <span className="game-mode-icon">🗺️</span>
                                <h3>{T.gameModeRoguelike}</h3>
                            </button>
                            <button 
                                ref={el => { gameModeCardRefs.current[2] = el; }}
                                className={`game-mode-card ${gameplayMode === 'dungeon' ? 'selected' : ''}`}
                                onClick={handleDungeonClick}
                            >
                                {daysUntilDungeonSeasonEnd !== null && daysUntilDungeonSeasonEnd > 0 && (
                                    <div 
                                        className="dungeon-badge" 
                                        onClick={(e) => { e.stopPropagation(); uiStore.openModal('dungeonRewards'); }} 
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); uiStore.openModal('dungeonRewards'); } }}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={T.dungeonRewardsModal.title}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="dungeon-badge-icon"><path d="M19 10c0-1.1-.9-2-2-2h-3V5c0-1.1-.9-2-2-2s-2 .9-2 2v3H7c-1.1 0-2 .9-2 2v2h14v-2zm-2 2H7v-2h10v2zm-5 4c0-1.1-.9-2-2-2s-2 .9-2 2v2c0 1.1.9 2 2 2s2-.9 2-2v-2z"/></svg>
                                        <span className="dungeon-badge-countdown">{daysUntilDungeonSeasonEnd}</span>
                                    </div>
                                )}
                                <span className="game-mode-icon">⚔️</span>
                                <h3>{T.gameModeDungeon}</h3>
                            </button>
                        </div>
                        <button className="carousel-nav-button next" onClick={() => changeGameMode(1)} aria-label="Next game mode">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                        </button>
                    </div>
                </div>
                <div className="menu-section" data-tutorial-id="difficulty">
                    <div className="menu-section-header non-collapsible">
                        <h2>{T.difficultyLabel}</h2>
                        <button className="difficulty-info-button" onClick={() => uiStore.openModal('waifuCoinRules')} aria-label={T.waifuCoinRulesTitle}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                        </button>
                    </div>
                    {gameplayMode === 'dungeon' ? (
                        <div className="difficulty-locked-message">
                            <span className="difficulty-icon nightmare-icon">🖤🖤🖤</span>
                            <h3>{T.difficultyNightmare}</h3>
                            <p>{T.challengeMatch.difficultyLocked}</p>
                        </div>
                    ) : (
                    <>
                        <div className="difficulty-carousel-wrapper">
                            <button className="carousel-nav-button prev" onClick={() => changeDifficulty(-1)} aria-label="Previous difficulty">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/></svg>
                            </button>
                            <div className="difficulty-selection" ref={difficultyContainerRef}>
                                <button
                                    ref={el => { difficultyCardRefs.current[0] = el; }}
                                    className={`difficulty-card ${difficulty === 'easy' ? 'selected' : ''}`}
                                    onClick={() => gameSettingsStore.setDifficulty('easy')}
                                >
                                    <span className="difficulty-icon">❤️</span>
                                    <h3>{T.difficultyEasy}</h3>
                                </button>
                                <button
                                    ref={el => { difficultyCardRefs.current[1] = el; }}
                                    className={`difficulty-card ${difficulty === 'medium' ? 'selected' : ''}`}
                                    onClick={() => gameSettingsStore.setDifficulty('medium')}
                                >
                                    <span className="difficulty-icon">❤️❤️</span>
                                    <h3>{T.difficultyMedium}</h3>
                                </button>
                                <button
                                    ref={el => { difficultyCardRefs.current[2] = el; }}
                                    className={`difficulty-card ${difficulty === 'hard' ? 'selected' : ''}`}
                                    onClick={() => gameSettingsStore.setDifficulty('hard')}
                                >
                                    <span className="difficulty-icon">❤️❤️❤️</span>
                                    <h3>{T.difficultyHard}</h3>
                                </button>
                                <button
                                    ref={el => { difficultyCardRefs.current[3] = el; }}
                                    className={`difficulty-card ${difficulty === 'nightmare' ? 'selected' : ''}`}
                                    onClick={() => gameSettingsStore.setDifficulty('nightmare')}
                                >
                                    <span className="difficulty-icon nightmare-icon">🖤🖤🖤</span>
                                    <h3>{T.difficultyNightmare}</h3>
                                </button>
                                <button
                                    ref={el => { difficultyCardRefs.current[4] = el; }}
                                    className={`difficulty-card ${difficulty === 'apocalypse' ? 'selected' : ''}`}
                                    onClick={() => gameSettingsStore.setDifficulty('apocalypse')}
                                >
                                    <span className="difficulty-icon">💀💀💀</span>
                                    <h3>{T.difficultyApocalypse}</h3>
                                </button>
                            </div>
                            <button className="carousel-nav-button next" onClick={() => changeDifficulty(1)} aria-label="Next difficulty">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                            </button>
                        </div>
                    </>
                    )}
                </div>
                
                 <div className="menu-section" data-tutorial-id="waifu-selector">
                    <div className="menu-section-header non-collapsible waifu-selection-header">
                        <h2>{T.chooseOpponent}</h2>
                        <button 
                            className="waifu-info-button"
                            onClick={() => {
                                if (selectedWaifu) {
                                    uiStore.openModal('waifuDetails', { waifu: selectedWaifu });
                                } else {
                                    // "Random Opponent" is selected. Create a mock Waifu object.
                                    const randomOpponentDetails: Waifu = {
                                        name: T.randomOpponent,
                                        avatar: '', // Avatar path is not needed, modal will show SVG.
                                        personality: { it: '', en: '' },
                                        fullDescription: {
                                            it: translations['it'].randomOpponentModalDesc,
                                            en: translations['en'].randomOpponentModalDesc
                                        },
                                        initialChatMessage: { it: '', en: '' },
                                        systemInstructions: { it: { initial: '', winning: '', losing: '', neutral: '' }, en: { initial: '', winning: '', losing: '', neutral: '' } },
                                        fallbackMessages: { it: { winning: [], losing: [], neutral: [] }, en: { winning: [], losing: [], neutral: [] } }
                                    };
                                    uiStore.openModal('waifuDetails', { waifu: randomOpponentDetails });
                                }
                            }}
                            disabled={gameplayMode !== 'classic'}
                            aria-label={selectedWaifu ? T.waifuDetails(selectedWaifu.name) : T.randomOpponent}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                        </button>
                    </div>
                    <WaifuSelector 
                        language={language}
                        onWaifuSelected={handleWaifuSelection}
                        selectedWaifu={selectedWaifu}
                        isRandomSelected={isRandomCardSelected}
                        disabled={gameplayMode === 'roguelike' || gameplayMode === 'dungeon'}
                    />
                </div>

                <div className="start-game-container" data-tutorial-id="start-game">
                    {rootStore.hasAnySavedGame && (
                        <button
                            className="start-game-button"
                            onClick={rootStore.resumeAnyGame}
                        >
                            {T.resumeGame}
                        </button>
                    )}
                    <button 
                        className="start-game-button" 
                        onClick={handleStartGame} 
                        disabled={gameplayMode === 'dungeon'}
                    >
                        {T.startGame}
                    </button>
                </div>
                
                <div className="promo-buttons-container" data-tutorial-id="gallery">
                    <button className="missions-promo-button" onClick={() => uiStore.openModal('missions')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 9H7v-2h6v2zm3-4H7V5h9v2zm-1 8H7v-2h8v2z"/></svg>
                        <span>{T.missions.title}</span>
                        {hasUnclaimedRewards && <span className="notification-badge" />}
                    </button>
                    {isNsfwEnabled && (
                        <button className="gallery-promo-button" onClick={() => uiStore.openModal('gallery')}>
                            {T.gallery.gachaTabTitle}
                        </button>
                    )}
                </div>


                <footer className="menu-footer">
                    <div>
                        <button className="link-button" onClick={() => uiStore.openModal('privacy')}>{T.privacyPolicy.linkText}</button>
                        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                        <button className="link-button" onClick={() => uiStore.openModal('terms')}>{T.termsAndConditions.linkText}</button>
                    </div>
                    {process.env.APP_VERSION && <div className="app-version">v{process.env.APP_VERSION}</div>}
                </footer>
            </div>
        </div>
    );
});
