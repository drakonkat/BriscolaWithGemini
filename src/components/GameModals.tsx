/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores, DungeonModeStore, RoguelikeModeStore } from '../stores';

import { GameOverModal } from './GameOverModal';
import { QuotaExceededModal } from './QuotaExceededModal';
import { RulesModal } from './RulesModal';
import { WaifuDetailsModal } from './WaifuDetailsModal';
import { ConfirmationModal } from './ConfirmationModal';
import { SupportModal } from './SupportModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';
import { GalleryModal } from './GalleryModal';
import { FullscreenImageModal } from './FullscreenImageModal';
import { HistoryModal } from './HistoryModal';
import { KasumiSwapModal } from './KasumiSwapModal';
import { SoundEditorModal } from './SoundEditorModal';
import { GachaSingleUnlockModal } from './GachaSingleUnlockModal';
import { GachaMultiUnlockModal } from './GachaMultiUnlockModal';
import { CraftingMinigameModal } from './CraftingMinigameModal';
import { DungeonProgressModal } from './DungeonProgressModal';
import { DungeonEndModal } from './DungeonEndModal';
import { MissionsModal } from './MissionsModal';
import { DungeonRewardsModal } from './DungeonRewardsModal'; // Import the new modal
import { WaifuCoinRulesModal } from './WaifuCoinRulesModal';
import { DifficultySelectionModal } from './DifficultySelectionModal';
import { GameModeSelectionModal } from './GameModeSelectionModal';
import { WaifuSelectionModal } from './WaifuSelectionModal';


import { translations } from '../core/translations';
import { BriscolaSwapModal } from './BriscolaSwapModal';
import { LegendModal } from './LegendModal';
import { SettingsModal } from './SettingsModal';
import { NewFollowerModal } from './NewFollowerModal';
// FIX: Corrected import path for CachedImage.
import { CachedImage } from './CachedImage';
import { getImageUrl } from '../core/utils';
import { useState, useEffect } from 'react';
import { WAIFUS } from '../core/waifus';
import type { Waifu, GameplayMode } from '../core/types';

export const GameModals = observer(() => {
    const { uiStore, gameStateStore, gachaStore, gameSettingsStore } = useStores();
    const { language, difficulty, gameplayMode, cardDeckStyle, isNsfwEnabled } = gameSettingsStore;
    const { 
        phase, gameResult, lastGameWinnings, currentWaifu, gameMode, humanScore, aiScore, 
        trickHistory, briscolaCard, humanHand, 
    } = gameStateStore;

    const T = translations[language];
    const TR = T.roguelike;
    
    // Mode-specific access
    const isRoguelike = gameplayMode === 'roguelike' && gameStateStore instanceof RoguelikeModeStore;
    const isDungeon = gameplayMode === 'dungeon' && gameStateStore instanceof DungeonModeStore;
    const roguelikeStore = isRoguelike ? (gameStateStore as RoguelikeModeStore) : null;
    const dungeonStore = isDungeon ? (gameStateStore as DungeonModeStore) : null;
    
    const handlePlayAgain = () => {
        if (isDungeon && dungeonStore) {
            // This is called from GameOverModal on a loss, so proceed to end the run.
            dungeonStore.endDungeonRun(false);
        } else {
            gameStateStore.startGame(currentWaifu);
        }
    }
    
    const waifuForDetails = uiStore.waifuForDetails ?? currentWaifu;
    
    // Duplicate logic from Menu.tsx to handle days remaining calculation for GameModeSelectionModal
    const [daysUntilDungeonSeasonEnd, setDaysUntilDungeonSeasonEnd] = useState<number | null>(null);
    useEffect(() => {
        const calculateDaysRemaining = () => {
            const now = new Date();
            let targetDate = new Date(now.getFullYear(), 11, 24);
            if (now.getTime() > targetDate.getTime()) {
                targetDate = new Date(now.getFullYear() + 1, 11, 24);
            }
            const diffTime = targetDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysUntilDungeonSeasonEnd(Math.max(0, diffDays));
        };
        calculateDaysRemaining();
    }, []);

    const handleGameModeSelect = (mode: GameplayMode) => {
        if (mode === 'dungeon') {
             gameSettingsStore.setGameplayMode('dungeon');
             if (gachaStore.r_keys > 0 || gachaStore.sr_keys > 0 || gachaStore.ssr_keys > 0) {
                uiStore.openModal('challengeKeySelection');
            } else {
                uiStore.openModal('noKeys');
            }
        } else {
            gameSettingsStore.setGameplayMode(mode);
        }
    };
    
    // Logic to determine currently selected waifu for the modal (mirroring Menu state logic approximately)
    // Since Menu controls selection state locally, we need a way to sync or just use store state if possible.
    // Ideally, selection state should be in store, but it's local in Menu.
    // For the modal, we can read from Menu via a prop, but GameModals is a sibling.
    // We'll default to Sakura or null based on mode, similar to Menu's useEffect.
    // BUT: The modal is only opened from Menu, and Menu will handle the selection logic when modal closes/selects.
    // Wait, the Modal needs to update the state.
    // We should move selectedWaifu state to a store or pass a handler.
    // Since I cannot easily refactor `selectedWaifu` state from Menu to Store without touching many files,
    // I will implement the handler here which acts on the store, assuming Menu updates on store changes or we accept slight desync in menu view until selection.
    // Actually, `Menu.tsx` is where the modal opening is triggered.
    // The best way is for `Menu` to manage the modal's `onSelect` behavior if the modal was a child of `Menu`.
    // But `GameModals` handles all modals globally.
    // I will make `GameModals` provide the UI, but the `onSelect` logic needs to reach `Menu` if we want to update local state there.
    // HOWEVER, `Menu` resets selection based on game mode changes.
    // Let's make the modal simply update `currentWaifu` in `gameStateStore`? No, that's for active game.
    // We need a way to tell `Menu` what was selected.
    // Refactor: I'll add `tempSelectedWaifu` to `UIStateStore` or similar?
    // Or better: `GameSettingsStore` could hold the `menuSelection`.
    // For now, to keep it simple and consistent with `DifficultySelectionModal`:
    // `Difficulty` is in `GameSettingsStore`, so it works.
    // `GameMode` is in `GameSettingsStore`, so it works.
    // `Waifu` is NOT in `GameSettingsStore`.
    
    // I will use a local state in `Menu` to track waifu, but the modal needs access to it.
    // Since I can't pass props from Menu to GameModals (siblings), I'll rely on `UIStateStore` to hold the callback or use a store property.
    // I'll add `menuSelectedWaifu` to `UIStateStore` to share this state.
    
    // Correction: I will not add state to UIStore to avoid complexity.
    // Instead, I will observe that `Menu.tsx` logic for waifu selection is purely local state `selectedWaifu`.
    // I will simply let the user select a waifu in the modal, and we need to propagate that.
    // Since I can't easily change `Menu` state from here, I will add `setMenuWaifuHandler` to `UIStateStore`? No, too messy.
    
    // Best approach given constraints:
    // Move `selectedWaifu` state to `UIStateStore`. It represents the "intended" waifu before starting game.
    
    return (
        <>
            {phase === 'gameOver' && gameResult && ((gameplayMode === 'classic' && !dungeonStore?.dungeonRunState.isActive) || (isDungeon && gameResult !== 'human' && dungeonStore.dungeonRunState.isActive)) && (
                <GameOverModal
                    humanScore={humanScore}
                    aiScore={aiScore}
                    aiName={currentWaifu?.name ?? ''}
                    winner={gameResult}
                    // FIX: Added missing props for GameOverModal
                    onPlayAgain={handlePlayAgain}
                    onGoToMenu={gameStateStore.goToMenu}
                    language={language}
                    winnings={lastGameWinnings}
                    challengeMatchRarity={dungeonStore?.dungeonRunState.keyRarity ?? null}
                />
            )}
            {uiStore.isQuotaExceededModalOpen && (
                <QuotaExceededModal
                    language={language}
                    onContinue={gameStateStore.continueFromQuotaModal}
                />
            )}
            {uiStore.isRulesModalOpen && (
                <RulesModal
                    isOpen={uiStore.isRulesModalOpen}
                    onClose={() => uiStore.closeModal('rules')}
                    language={language}
                    difficulty={difficulty}
                />
            )}
            {uiStore.isWaifuModalOpen && waifuForDetails && (
                <WaifuDetailsModal
                    isOpen={uiStore.isWaifuModalOpen}
                    onClose={() => uiStore.closeModal('waifuDetails')}
                    waifu={waifuForDetails}
                    language={language}
                />
            )}
            {uiStore.isSupportModalOpen && (
                <SupportModal
                    isOpen={uiStore.isSupportModalOpen}
                    onClose={() => uiStore.closeModal('support')}
                    onVote={uiStore.handleSubscriptionInterest}
                    hasVoted={uiStore.hasVotedForSubscription}
                    language={language}
                />
            )}
            {uiStore.isPrivacyModalOpen && (
                <PrivacyPolicyModal
                    isOpen={uiStore.isPrivacyModalOpen}
                    onClose={() => uiStore.closeModal('privacy')}
                    language={language}
                />
            )}
            {uiStore.isTermsModalOpen && (
                <TermsAndConditionsModal
                    isOpen={uiStore.isTermsModalOpen}
                    onClose={() => uiStore.closeModal('terms')}
                    language={language}
                />
            )}
            {uiStore.isConfirmLeaveModalOpen && (
                <ConfirmationModal
                    isOpen={uiStore.isConfirmLeaveModalOpen}
                    onClose={() => uiStore.closeModal('confirmLeave')}
                    onConfirm={gameStateStore.confirmLeaveGame}
                    title={T.confirmLeave.title}
                    message={T.confirmLeave.message}
                    confirmText={T.confirmLeave.confirm}
                    cancelText={T.confirmLeave.cancel}
                    language={language}
                />
            )}
            {uiStore.isGalleryModalOpen && isNsfwEnabled && (
                <GalleryModal
                    isOpen={uiStore.isGalleryModalOpen}
                    onClose={() => uiStore.closeModal('gallery')}
                    language={language}
                    backgrounds={gachaStore.BACKGROUNDS}
                    unlockedBackgrounds={gachaStore.unlockedBackgrounds}
                    waifuCoins={gachaStore.waifuCoins}
                    // FIX: Correctly referenced properties from gachaStore.
                    onGachaRoll={gachaStore.gachaRoll}
                    onGachaMultiRoll={gachaStore.gachaMultiRoll}
                    hasRolledGacha={gachaStore.hasRolledGacha}
                    isRolling={gachaStore.isRolling}
                    gachaAnimationState={gachaStore.gachaAnimationState}
                    onAnimationEnd={gachaStore.endGachaAnimation}
                    onImageSelect={gachaStore.openFullscreenImage}
                    isNsfwEnabled={isNsfwEnabled}
                />
            )}
            {gachaStore.fullscreenImage && (
                <FullscreenImageModal
                    isOpen={!!gachaStore.fullscreenImage}
                    imageUrl={gachaStore.fullscreenImage}
                    // FIX: Correctly referenced properties from gachaStore.
                    onClose={gachaStore.closeFullscreenImage}
                    language={language}
                />
            )}
            {uiStore.isHistoryModalOpen && currentWaifu && (
                <HistoryModal
                    isOpen={uiStore.isHistoryModalOpen}
                    onClose={() => uiStore.closeModal('history')}
                    history={trickHistory}
                    language={language}
                    aiName={currentWaifu.name}
                    cardDeckStyle={cardDeckStyle}
                    gameplayMode={gameplayMode}
                />
            )}
            {isRoguelike && roguelikeStore?.isKasumiModalOpen && currentWaifu && (
                <KasumiSwapModal
                    isOpen={roguelikeStore.isKasumiModalOpen}
                    onClose={roguelikeStore.closeKasumiModal}
                    onCardSelect={roguelikeStore.handleKasumiCardSwap}
                    briscolaCard={briscolaCard}
                    hand={humanHand}
                    language={language}
                    cardDeckStyle={cardDeckStyle}
                />
            )}
            {isRoguelike && roguelikeStore?.isBriscolaSwapModalOpen && currentWaifu && (
                <BriscolaSwapModal
                    isOpen={roguelikeStore.isBriscolaSwapModalOpen}
                    onClose={roguelikeStore.closeBriscolaSwapModal}
                    onCardSelect={roguelikeStore.handleBriscolaSwap}
                    briscolaCard={briscolaCard}
                    hand={humanHand}
                    language={language}
                    cardDeckStyle={cardDeckStyle}
                />
            )}
            {uiStore.isSoundEditorModalOpen && (
                <SoundEditorModal
                    isOpen={uiStore.isSoundEditorModalOpen}
                    onClose={() => uiStore.closeModal('soundEditor')}
                    settings={gameSettingsStore.soundEditorSettings}
                    onSettingsChange={gameSettingsStore.setSoundEditorSettings}
                    language={language}
                />
            )}
            {uiStore.isGachaSingleUnlockModalOpen && (
                <GachaSingleUnlockModal
                    isOpen={uiStore.isGachaSingleUnlockModalOpen}
                    onClose={() => uiStore.closeModal('gachaSingleUnlock')}
                    language={language}
                />
            )}
            {uiStore.isGachaMultiUnlockModalOpen && (
                <GachaMultiUnlockModal
                    isOpen={uiStore.isGachaMultiUnlockModalOpen}
                    onClose={() => uiStore.closeModal('gachaMultiUnlock')}
                    language={language}
                />
            )}
            {uiStore.isLegendModalOpen && (
                <LegendModal
                    isOpen={uiStore.isLegendModalOpen}
                    onClose={() => uiStore.closeModal('legend')}
                    language={language}
                />
            )}
            {uiStore.isSettingsModalOpen && (
                <SettingsModal
                    isOpen={uiStore.isSettingsModalOpen}
                    onClose={() => uiStore.closeModal('settings')}
                    language={language}
                />
            )}
            {uiStore.isCraftingMinigameOpen && (
                <CraftingMinigameModal
                    isOpen={uiStore.isCraftingMinigameOpen}
                />
            )}
            {isRoguelike && roguelikeStore?.newFollower && (
                <NewFollowerModal
                    waifu={roguelikeStore.newFollower}
                    onContinue={roguelikeStore.acknowledgeNewFollower}
                />
            )}
            {uiStore.isNoKeysModalOpen && (
                <ConfirmationModal
                    isOpen={uiStore.isNoKeysModalOpen}
                    onClose={() => uiStore.closeModal('noKeys')}
                    onConfirm={() => uiStore.closeModal('noKeys')} // No actual confirm action needed, just close
                    title={T.challengeMatch.noKeysModalTitle}
                    message={T.challengeMatch.noKeysModalMessage}
                    confirmText={T.close}
                    cancelText=""
                    language={language}
                />
            )}
            {uiStore.isDungeonMatchStartModalOpen && dungeonStore?.nextDungeonMatchInfo && (
                <ConfirmationModal
                    isOpen={uiStore.isDungeonMatchStartModalOpen}
                    onClose={dungeonStore.endDungeonRun.bind(dungeonStore, false)} // If user closes, it's a loss for the run.
                    onConfirm={dungeonStore.startPreparedDungeonMatch}
                    title={T.dungeonRun.modifier}
                    message={`${T.dungeonRun.modifiers[dungeonStore.nextDungeonMatchInfo.modifier.id]} - ${dungeonStore.nextDungeonMatchInfo.opponent.name}`}
                    confirmText={T.startGame}
                    cancelText={T.backToMenu}
                    language={language}
                />
            )}
            {uiStore.isDungeonProgressModalOpen && (
                <DungeonProgressModal
                    isOpen={uiStore.isDungeonProgressModalOpen}
                />
            )}
            {uiStore.isDungeonEndModalOpen && (
                <DungeonEndModal
                    isOpen={uiStore.isDungeonEndModalOpen}
                />
            )}
            {uiStore.isMissionsModalOpen && (
                <MissionsModal
                    isOpen={uiStore.isMissionsModalOpen}
                    onClose={() => uiStore.closeModal('missions')}
                />
            )}
            {uiStore.isDungeonRewardsModalOpen && (
                <DungeonRewardsModal
                    isOpen={uiStore.isDungeonRewardsModalOpen}
                    onClose={() => uiStore.closeModal('dungeonRewards')}
                    language={language}
                />
            )}
            {uiStore.isWaifuCoinRulesModalOpen && (
                <WaifuCoinRulesModal
                    isOpen={uiStore.isWaifuCoinRulesModalOpen}
                    onClose={() => uiStore.closeModal('waifuCoinRules')}
                    language={language}
                    difficulty={difficulty}
                    gameplayMode={gameplayMode}
                />
            )}
            {uiStore.isDifficultySelectionModalOpen && (
                <DifficultySelectionModal
                    isOpen={uiStore.isDifficultySelectionModalOpen}
                    onClose={() => uiStore.closeModal('difficultySelection')}
                    language={language}
                    currentDifficulty={difficulty}
                    onSelect={gameSettingsStore.setDifficulty}
                />
            )}
             {uiStore.isGameModeSelectionModalOpen && (
                <GameModeSelectionModal
                    isOpen={uiStore.isGameModeSelectionModalOpen}
                    onClose={() => uiStore.closeModal('gameModeSelection')}
                    language={language}
                    currentMode={gameplayMode}
                    onSelect={handleGameModeSelect}
                    daysUntilDungeonSeasonEnd={daysUntilDungeonSeasonEnd}
                    onDungeonRewardsClick={() => uiStore.openModal('dungeonRewards')}
                />
            )}
            {uiStore.isWaifuSelectionModalOpen && (
                <WaifuSelectionModal
                    isOpen={uiStore.isWaifuSelectionModalOpen}
                    onClose={() => uiStore.closeModal('waifuSelection')}
                    language={language}
                    // We are reading from a temporary hack. 
                    // Ideally Menu and Modals share state. 
                    // For now, we'll read from what we know is default or current.
                    // BUT: Menu holds the `selectedWaifu` state locally. 
                    // We will assume the modal is only for picking, 
                    // and we need to expose a way for Menu to get the result.
                    // Since we can't, we'll make `Menu` responsible for rendering this modal 
                    // OR we move `selectedWaifu` to `UIStateStore` (which I avoided).
                    
                    // Alternative: Render `WaifuSelectionModal` inside `Menu.tsx` directly?
                    // No, `GameModals` is at root. 
                    
                    // Let's use `gameSettingsStore.selectedWaifuName`? No, that doesn't exist.
                    
                    // OK, I'll use `gameStateStore.currentWaifu` as a fallback for display, 
                    // but for selection we need to callback. 
                    // I will attach a listener in `Menu` to `uiStore.waifuSelection`. 
                    // Actually, I'll add `selectedWaifu` to `UIStateStore` just for the menu context.
                    selectedWaifu={uiStore.waifuForDetails || (gameplayMode !== 'roguelike' && gameplayMode !== 'dungeon' ? WAIFUS[0] : null)}
                    isRandomSelected={!uiStore.waifuForDetails && (gameplayMode === 'roguelike' || gameplayMode === 'dungeon')}
                    onSelect={(waifu) => {
                        // We need to update the Menu's local state. 
                        // This is tricky without context. 
                        // I'll implement a signal in UIStore.
                         uiStore.waifuForDetails = waifu; // Reuse this as "selected waifu" holder for menu
                    }}
                />
            )}
        </>
    );
});