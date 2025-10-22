/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useStores} from '../stores';
import {translations} from '../core/translations';
import {WaifuSelector} from './Menu/WaifuSelector';
import {CachedImage} from './shared/CachedImage';
import {WAIFUS} from '../core/waifus.js';
import {ROGUELIKE_REWARDS} from '../core/constants';
import {Header} from './Menu/Header';
import {PlayerWalletPopover} from './Menu/PlayerWalletPopover';
import {GameModeCarousel} from './Menu/GameModeCarousel';
import {DifficultyCarousel} from './Menu/DifficultyCarousel';
import {StartGameSection} from './Menu/StartGameSection';
import {WaifuDetails} from './Menu/WaifuDetails';
import {PromoButtons} from './Menu/PromoButtons';
import {Footer} from './shared/Footer';
import {RoguelikeModeStore} from '../stores';
// Import removed - WaifuDetails is now inline

const DifficultyDetails = ({difficulty, language, gameplayMode}) => {
    const T = translations[language];

    if (gameplayMode === 'roguelike') {
        const rewards = ROGUELIKE_REWARDS[difficulty];

        const difficultyDescKey = `difficulty${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}Desc`;
        const difficultyDesc = T[difficultyDescKey];

        const essenceMultipliers = {
            easy: 'x1',
            medium: 'x1.25',
            hard: 'x1.5',
            nightmare: 'x2',
            apocalypse: 'x2.5',
        };

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
                    <div className="reward-item multiplier">
                        <span>{T.rewardEssenceMultiplier}</span>
                        <strong>{essenceMultipliers[difficulty]}</strong>
                    </div>
                </div>
            </div>
        );
    }

    const details = {
        easy: {
            desc: T.difficultyEasyDesc,
            multiplier: '50%',
            multiplierVal: 0.5,
            isSpecial: false,
        },
        medium: {
            desc: T.difficultyMediumDesc,
            multiplier: '100%',
            multiplierVal: 1.0,
            isSpecial: false,
        },
        hard: {
            desc: T.difficultyHardDesc,
            multiplier: '150%',
            multiplierVal: 1.5,
            isSpecial: false,
        },
        nightmare: {
            desc: T.difficultyNightmareDesc,
            multiplier: T.rewardSpecial,
            multiplierVal: 1.5, // for loss calculation
            isSpecial: true,
            winAmount: 250,
        },
        apocalypse: {
            desc: T.difficultyApocalypseDesc,
            multiplier: T.rewardSpecial,
            multiplierVal: 1.5, // for loss calculation
            isSpecial: true,
            winAmount: 500,
        }
    }[difficulty];

    const rewards = {
        loss: details.isSpecial ? Math.round(20 * 1.5) : Math.round(20 * details.multiplierVal),
        win_min: details.isSpecial ? details.winAmount : Math.round(45 * details.multiplierVal),
        win_max: details.isSpecial ? details.winAmount : Math.round(100 * details.multiplierVal),
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
                        {details.isSpecial
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
    const rootStore = useStores();
    const {gameSettingsStore, gameStateStore, uiStore, gachaStore, missionStore} = rootStore;
    const {language, gameplayMode, difficulty, isNsfwEnabled} = gameSettingsStore;
    const {menuBackgroundUrl, isDifficultyDetailsOpen, isWaifuDetailsOpen} = uiStore;
    const {
        waifuCoins,
        r_shards,
        sr_shards,
        ssr_shards,
        r_keys,
        sr_keys,
        ssr_keys,
        fire_essences,
        water_essences,
        air_essences,
        earth_essences,
        transcendental_essences
    } = gachaStore;
    const {hasUnclaimedRewards} = missionStore;

    const T = translations[language];
    const [selectedWaifu, setSelectedWaifu] = useState(null);
    const [isRandomCardSelected, setIsRandomCardSelected] = useState(false);


    useEffect(() => {
        if (gameplayMode === 'roguelike' || gameplayMode === 'dungeon') {
            setSelectedWaifu(null);
            setIsRandomCardSelected(true);
        } else {
            setSelectedWaifu(WAIFUS.find(w => w.name === 'Sakura') || null);
            setIsRandomCardSelected(false);
        }
    }, [gameplayMode]);

    const handleWaifuSelection = (waifu) => {
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


    return (
        <div className="menu">
            <PlayerWalletPopover
                waifuCoins={waifuCoins}
                r_shards={r_shards}
                sr_shards={sr_shards}
                ssr_shards={ssr_shards}
                r_keys={r_keys}
                sr_keys={sr_keys}
                ssr_keys={ssr_keys}
                fire_essences={fire_essences}
                water_essences={water_essences}
                air_essences={air_essences}
                earth_essences={earth_essences}
                transcendental_essences={transcendental_essences}
                language={language}
                translations={T}
            />
            {isNsfwEnabled &&
                <CachedImage imageUrl={menuBackgroundUrl} alt="Game background" className="menu-background"/>}
            <div className="menu-content" data-tutorial-id="welcome">
                <Header
                    title={T.title}
                    isNsfwEnabled={isNsfwEnabled}
                    language={language}
                    uiStore={uiStore}
                    onRefreshBackground={() => uiStore.refreshMenuBackground()}
                />

                <p className="menu-subtitle">{T.subtitle}</p>



                <div className="menu-section" data-tutorial-id="game-mode">
                    <GameModeCarousel
                        gameplayMode={gameplayMode}
                        onGameModeChange={(mode) => {
                            if (mode === 'dungeon') {
                                handleDungeonClick();
                            } else {
                                gameSettingsStore.setGameplayMode(mode);
                            }
                        }}
                        translations={T}
                    />
                </div>
                <div className="menu-section" data-tutorial-id="difficulty">
                    <div className="menu-section-header non-collapsible">
                        <h2>{T.difficultyLabel}</h2>
                    </div>
                    <DifficultyCarousel
                        difficulty={difficulty}
                        gameplayMode={gameplayMode}
                        onDifficultyChange={gameSettingsStore.setDifficulty}
                        translations={T}
                    />

                    <button className="menu-section-header details-header" onClick={uiStore.toggleDifficultyDetails}
                            aria-expanded={isDifficultyDetailsOpen}>
                        <h3>{T.waifuCoinRulesTitle}</h3>
                        <span className={`collapse-icon ${isDifficultyDetailsOpen ? 'open' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"
                                 fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path
                                d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                        </span>
                    </button>
                    <div className={`collapsible-content ${isDifficultyDetailsOpen ? 'open' : ''}`}>
                        <div>
                            <DifficultyDetails difficulty={difficulty} language={language} gameplayMode={gameplayMode}/>
                        </div>
                    </div>
                </div>

                <div className="menu-section" data-tutorial-id="waifu-selector">
                    <WaifuSelector
                        language={language}
                        onWaifuSelected={handleWaifuSelection}
                        selectedWaifu={selectedWaifu}
                        isRandomSelected={isRandomCardSelected}
                        disabled={gameplayMode === 'roguelike' || gameplayMode === 'dungeon'}
                    />
                </div>

                <WaifuDetails
                    selectedWaifu={selectedWaifu}
                    isRandomSelected={isRandomCardSelected}
                    difficulty={difficulty}
                    language={language}
                    translations={T}
                    isOpen={isWaifuDetailsOpen}
                    onToggle={uiStore.toggleWaifuDetails}
                />

                <StartGameSection
                    hasSavedGame={rootStore.hasAnySavedGame}
                    gameplayMode={gameplayMode}
                    onResumeGame={rootStore.resumeAnyGame}
                    onStartGame={handleStartGame}
                    translations={T}
                />
                <PromoButtons

                    isNsfwEnabled={isNsfwEnabled}
                hasUnclaimedRewards={hasUnclaimedRewards}
                onMissionsClick={() => uiStore.openModal('missions')}
                onGalleryClick={() => uiStore.openModal('gallery')}
                translations={T}
                />
                <Footer
                    onPrivacyClick={() => uiStore.openModal('privacy')}
                    onTermsClick={() => uiStore.openModal('terms')}
                    translations={T}
                    appVersion={process.env.APP_VERSION}
                />
            </div>
        </div>
    );
});