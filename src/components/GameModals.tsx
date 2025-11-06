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


import { translations } from '../core/translations';
import { BriscolaSwapModal } from './BriscolaSwapModal';
import { LegendModal } from './LegendModal';
import { SettingsModal } from './SettingsModal';
import { NewFollowerModal } from './NewFollowerModal';
// FIX: Corrected import path for CachedImage.
import { CachedImage } from './CachedImage';
import { getImageUrl } from '../core/utils';

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
    };
    
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
            {uiStore.isWaifuModalOpen && currentWaifu && (
                <WaifuDetailsModal
                    isOpen={uiStore.isWaifuModalOpen}
                    onClose={() => uiStore.closeModal('waifuDetails')}
                    waifu={currentWaifu}
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
                    onGachaRoll={gachaStore.handleGachaRoll}
                    onGachaMultiRoll={gachaStore.handleMultiGachaRoll}
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
        </>
    );
});