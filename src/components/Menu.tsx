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

const DifficultyDetails = ({ difficulty, language, gameplayMode }: { difficulty: Difficulty, language: 'it' | 'en', gameplayMode: GameplayMode }) => {
    const T = translations[language];

    if (gameplayMode === 'roguelike') {
        const rewards = ROGUELIKE_REWARDS[difficulty];
        
        const difficultyDesc = {
            easy: T.difficultyEasyDesc,
            medium: T.difficultyMediumDesc,
            hard: T.difficultyHardDesc,
            nightmare: T.difficultyNightmareDesc,
        }[difficulty];

        return (
            <div className="difficulty-details-panel fade-in-up" key={`${difficulty}-roguelike`}>
                <p className="difficulty-description">{difficultyDesc}</p>
                <div className="difficulty-rewards roguelike">
                    <div className="reward-item">
                        <span>{T.roguelike.rewardWinRun}</span>
                        <strong>+{rewards.win} WC</strong>
                    </div>
                    {rewards.loss.slice(1).map((lossAmount, index) => (
                        <div className="reward-item" key={index}>
                            <span>{T.roguelike.rewardLossLevel(index + 1)}</span>
                            <strong>+{lossAmount} WC</strong>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const details = {
        easy: {
            desc: T.difficultyEasyDesc,
            multiplier: '50%',
            multiplierVal: 0.5,
            isNightmare: false,
        },
        medium: {
            desc: T.difficultyMediumDesc,
            multiplier: '100%',
            multiplierVal: 1.0,
            isNightmare: false,
        },
        hard: {
            desc: T.difficultyHardDesc,
            multiplier: '150%',
            multiplierVal: 1.5,
            isNightmare: false,
        },
        nightmare: {
            desc: T.difficultyNightmareDesc,
            multiplier: T.rewardSpecial,
            multiplierVal: 1.5, // for loss
            isNightmare: true,
        }
    }[difficulty];

    const rewards = {
        loss: details.isNightmare ? Math.round(20 * 1.5) : Math.round(20 * details.multiplierVal),
        win_min: details.isNightmare ? 500 : Math.round(45 * details.multiplierVal),
        win_max: details.isNightmare ? 500 : Math.round(100 * details.multiplierVal),
    };

    return (
        <div className="difficulty-details-panel fade-in-up" key={difficulty}>
            <p className="difficulty-description">{details.desc}</p>
            <div className="difficulty-rewards">
                <div className="reward-item multiplier">
                    <span>{T.rewardCoinMultiplier}</span>
                    <strong>{details.multiplier}</strong>
                </div>
                <div className="reward-item">
                    <span>{T.rewardWin}</span>
                    <strong>
                        {details.isNightmare
                            ? `+${rewards.win_min} WC`
                            : `+${rewards.win_min} - ${rewards.win_max} WC`
                        }
                    </strong>
                </div>
                <div className="reward-item">
                    <span>{T.rewardLoss}</span>
                    <strong>+{rewards.loss} WC</strong>
                </div>
            </div>
        </div>
    );
};


export const Menu = observer(() => {
    const { gameSettingsStore, gameStateStore, uiStore, gachaStore } = useStores();
    const { language, gameplayMode, difficulty, isNsfwEnabled } = gameSettingsStore;
    const { hasSavedGame } = gameStateStore;
    const { menuBackgroundUrl, isDifficultyDetailsOpen, isWaifuDetailsOpen } = uiStore;
    const { waifuCoins } = gachaStore;

    const T = translations[language];
    const [selectedWaifu, setSelectedWaifu] = useState<Waifu | null>(null);
    const [isRandomCardSelected, setIsRandomCardSelected] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const difficultyContainerRef = useRef<HTMLDivElement>(null);
    const difficultyCardRefs = useRef<(HTMLButtonElement | null)[]>([]);
    
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'nightmare'];

    const changeDifficulty = (direction: number) => {
        const currentIndex = difficulties.indexOf(difficulty);
        const newIndex = (currentIndex + direction + difficulties.length) % difficulties.length;
        gameSettingsStore.setDifficulty(difficulties[newIndex]);
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
        if (gameplayMode === 'roguelike') {
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
    
    

    return (
        <div className="menu">
            {isNsfwEnabled && <CachedImage imageUrl={menuBackgroundUrl} alt="Game background" className="menu-background" />}
            <div className="menu-content" data-tutorial-id="welcome">
                <div className="menu-title-container">
                    <div className="waifu-coins-display">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 16.5v-1c0-.83.67-1.5 1.5-1.5H12v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5H12V7h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1H9z"/>
                        </svg>
                        <span>{waifuCoins}</span>
                    </div>

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

                <p className="menu-subtitle">{T.subtitle}</p>

                <div className="menu-section" data-tutorial-id="game-mode">
                    <div className="game-mode-selection">
                        <button 
                            className={`game-mode-card ${gameplayMode === 'classic' ? 'selected' : ''}`}
                            onClick={() => gameSettingsStore.setGameplayMode('classic')}
                        >
                            <span className="game-mode-icon">👑</span>
                            <h3>{T.gameModeClassic}</h3>
                        </button>
                        <button 
                            className={`game-mode-card ${gameplayMode === 'roguelike' ? 'selected' : ''}`}
                            onClick={() => gameSettingsStore.setGameplayMode('roguelike')}
                        >
                            <span className="game-mode-icon">🗺️</span>
                            <h3>{T.gameModeRoguelike}</h3>
                        </button>
                    </div>
                </div>
                <div className="menu-section" data-tutorial-id="difficulty">
                    <div className="menu-section-header non-collapsible">
                        <h2>{T.difficultyLabel}</h2>
                    </div>
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
                        </div>
                        <button className="carousel-nav-button next" onClick={() => changeDifficulty(1)} aria-label="Next difficulty">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                        </button>
                    </div>
                    
                    <button className="menu-section-header details-header" onClick={uiStore.toggleDifficultyDetails} aria-expanded={isDifficultyDetailsOpen}>
                        <h3>{T.waifuCoinRulesTitle}</h3>
                        <span className={`collapse-icon ${isDifficultyDetailsOpen ? 'open' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                        </span>
                    </button>
                    <div className={`collapsible-content ${isDifficultyDetailsOpen ? 'open' : ''}`}>
                        <div>
                            <DifficultyDetails difficulty={difficulty} language={language} gameplayMode={gameplayMode} />
                        </div>
                    </div>
                </div>
                
                 <div className="menu-section" data-tutorial-id="waifu-selector">
                    <WaifuSelector 
                        language={language}
                        onWaifuSelected={handleWaifuSelection}
                        selectedWaifu={selectedWaifu}
                        isRandomSelected={isRandomCardSelected}
                        disabled={gameplayMode === 'roguelike'}
                    />
                </div>

                <div className="menu-section">
                    <button className="menu-section-header" onClick={uiStore.toggleWaifuDetails} aria-expanded={isWaifuDetailsOpen}>
                        <h2>{T.waifuDetails(selectedWaifu?.name ?? (isRandomCardSelected ? T.randomOpponent : '...'))}</h2>
                        <span className={`collapse-icon ${isWaifuDetailsOpen ? 'open' : ''}`}>
                             <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                        </span>
                    </button>
                    <div className={`collapsible-content ${isWaifuDetailsOpen ? 'open' : ''}`}>
                        <div>
                            <div className={`featured-waifu-container difficulty-${difficulty}`}>
                                {selectedWaifu ? (
                                    <div className="featured-waifu-display fade-in-up">
                                        <CachedImage imageUrl={getImageUrl(selectedWaifu.avatar)} alt={selectedWaifu.name} className="featured-waifu-avatar" />
                                        <p className="featured-waifu-desc">{selectedWaifu.fullDescription[language]}</p>
                                    </div>
                                ) : isRandomCardSelected ? (
                                    <div className="featured-waifu-display random fade-in-up">
                                        <div className="featured-waifu-avatar random-avatar">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 6.25a6.25 6.25 0 0 0-4.6 10.98c.2-.28.34-.6.4-.95.14-.77.2-1.57.14-2.43-.05-.8-.18-1.63-.4-2.45-.1-.38-.2-.77-.28-1.16-.07-.32-.1-.63-.12-.95 0-.28.02-.55.06-.82.09-.54.27-.99.5-1.39.43-.76 1.05-1.28 1.8-1.55.37-.13.76-.2 1.15-.2.43 0 .85.08 1.25.25.72.3 1.28.82 1.63 1.5.3.58.46 1.24.46 1.95 0 .3-.03.6-.08.88-.05.28-.13.56-.23.85-.09.28-.2.56-.3.85-.14.41-.28.83-.4 1.25-.13.43-.23.86-.3 1.3-.07.41-.1.83-.1 1.25 0 .23.03.45.08.66.03.14.06.28.1.41.3.92.74 1.63 1.25 2.25A6.25 6.25 0 0 0 12 6.25zM12 4c1.89 0 3.63.66 5 1.75.52.41.97.9 1.34 1.45.24.36.45.75.6 1.15.2.5.34 1.02.4 1.55.08.55.1 1.1.1 1.65s-.02 1.1-.08 1.65c-.06.53-.2 1.05-.38 1.55-.18.49-.4.95-.68 1.4-.35.56-.78 1.05-1.28 1.45-1.38 1.1-3.13 1.75-5.03 1.75s-3.65-.65-5-1.75c-.5-.4-1-1-1.35-1.5-.27-.45-.5-.9-.68-1.4-.18-.5-.32-1.02-.38-1.55-.06-1.1-.06-2.2 0-3.3.06-.53.2-1.05.4-1.55.15-.4.35-.8.6-1.15.37-.55.82-1.04 1.34-1.45C8.37 4.66 10.11 4 12 4z"/>
                                            </svg>
                                        </div>
                                        <p className="featured-waifu-desc">{T.randomOpponentDesc}</p>
                                    </div>
                                ) : (
                                    <div className="featured-waifu-placeholder" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="start-game-container" data-tutorial-id="start-game">
                    {hasSavedGame && (
                        <button
                            className="start-game-button"
                            onClick={gameStateStore.resumeGame}
                        >
                            {T.resumeGame}
                        </button>
                    )}
                    <button 
                        className="start-game-button" 
                        onClick={() => gameStateStore.startGame(selectedWaifu)} 
                        disabled={false}
                    >
                        {T.startGame}
                    </button>
                </div>
                
                <div className="gallery-promo-container" data-tutorial-id="gallery">
                    {isNsfwEnabled && (
                        <button className="gallery-promo-button" onClick={() => uiStore.openModal('gallery')}>
                            {T.gallery.promoButton}
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