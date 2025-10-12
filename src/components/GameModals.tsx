/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';

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
// FIX: Imported missing Gacha result modals.
import { GachaSingleUnlockModal } from './GachaSingleUnlockModal';
import { GachaMultiUnlockModal } from './GachaMultiUnlockModal';
import { CraftingMinigameModal } from './CraftingMinigameModal';

import { translations } from '../core/translations';
import { BriscolaSwapModal } from './BriscolaSwapModal';
import { LegendModal } from './LegendModal';
import { SettingsModal } from './SettingsModal';
import { NewFollowerModal } from './NewFollowerModal';

export const GameModals = observer(() => {
    const { uiStore, gameStateStore, gachaStore, gameSettingsStore } = useStores();
    const { language, difficulty, gameplayMode, cardDeckStyle, isNsfwEnabled } = gameSettingsStore;
    const { 
        phase, gameResult, lastGameWinnings, currentWaifu, gameMode, humanScore, aiScore, 
        trickHistory, isKasumiModalOpen, briscolaCard, humanHand, isBriscolaSwapModalOpen,
        closeBriscolaSwapModal, handleBriscolaSwap, newFollower, acknowledgeNewFollower,
    } = gameStateStore;

    const T = translations[language];
    const TR = T.roguelike;

    return (
        <>
            {phase === 'gameOver' && gameResult && gameplayMode === 'classic' &&(
                <GameOverModal
                    humanScore={humanScore}
                    aiScore={aiScore}
                    aiName={currentWaifu?.name ?? ''}
                    winner={gameResult}
                    onPlayAgain={() => gameStateStore.startGame(currentWaifu)}
                    onGoToMenu={gameStateStore.goToMenu}
                    language={language}
                    winnings={lastGameWinnings}
                />
            )}
            
            {phase === 'gameOver' && gameResult && gameplayMode === 'roguelike' && (
                 <div className="game-over-overlay">
                    <div className="game-over-modal">
                        <h2>{gameResult === 'human' ? TR.runCompleted : TR.runFailed}</h2>
                        <p>{gameResult === 'human' ? TR.runCompletedMessage(lastGameWinnings) : TR.runFailedMessage(lastGameWinnings)}</p>
                        <div className="modal-actions">
                            <button onClick={gameStateStore.goToMenu}>{T.backToMenu}</button>
                        </div>
                    </div>
                </div>
            )}

            {uiStore.isQuotaExceededModalOpen && gameMode === 'online' && (
                <QuotaExceededModal language={language} onContinue={gameStateStore.continueFromQuotaModal} />
            )}

            <RulesModal isOpen={uiStore.isRulesModalOpen} onClose={() => uiStore.closeModal('rules')} language={language} difficulty={difficulty} />
            <PrivacyPolicyModal isOpen={uiStore.isPrivacyModalOpen} onClose={() => uiStore.closeModal('privacy')} language={language} />
            <TermsAndConditionsModal isOpen={uiStore.isTermsModalOpen} onClose={() => uiStore.closeModal('terms')} language={language} />
            
            <GalleryModal
              isOpen={uiStore.isGalleryModalOpen}
              onClose={() => uiStore.closeModal('gallery')}
              language={language}
              backgrounds={gachaStore.BACKGROUNDS}
              unlockedBackgrounds={gachaStore.unlockedBackgrounds}
              waifuCoins={gachaStore.waifuCoins}
              onGachaRoll={gachaStore.handleGachaRoll}
              onGachaMultiRoll={gachaStore.handleMultiGachaRoll}
              onImageSelect={gachaStore.openFullscreenImage}
              hasRolledGacha={gachaStore.hasRolledGacha}
              isRolling={gachaStore.isRolling}
              gachaAnimationState={gachaStore.gachaAnimationState}
              onAnimationEnd={gachaStore.endGachaAnimation}
              isNsfwEnabled={isNsfwEnabled}
            />
            
            <FullscreenImageModal
              isOpen={!!gachaStore.fullscreenImage}
              imageUrl={gachaStore.fullscreenImage}
              onClose={gachaStore.closeFullscreenImage}
              language={language}
            />

            <GachaSingleUnlockModal
                isOpen={uiStore.isGachaSingleUnlockModalOpen}
                onClose={() => uiStore.closeModal('gachaSingleUnlock')}
                language={language}
            />

            <GachaMultiUnlockModal
                isOpen={uiStore.isGachaMultiUnlockModalOpen}
                onClose={() => uiStore.closeModal('gachaMultiUnlock')}
                language={language}
            />

            <CraftingMinigameModal isOpen={uiStore.isCraftingMinigameOpen} />

            {currentWaifu && (
                <WaifuDetailsModal 
                    isOpen={uiStore.isWaifuModalOpen}
                    onClose={() => uiStore.closeModal('waifuDetails')}
                    waifu={currentWaifu}
                    language={language}
                />
            )}

            <SupportModal
                isOpen={uiStore.isSupportModalOpen}
                onClose={() => uiStore.closeModal('support')}
                onVote={uiStore.handleSubscriptionInterest}
                hasVoted={uiStore.hasVotedForSubscription}
                language={language}
            />

            <ConfirmationModal
                isOpen={uiStore.isConfirmLeaveModalOpen}
                onClose={() => uiStore.closeModal('confirmLeave')}
                onConfirm={() => {
                    gameStateStore.confirmLeaveGame();
                    uiStore.closeModal('confirmLeave');
                }}
                title={T.confirmLeave.title}
                message={T.confirmLeave.message}
                confirmText={T.confirmLeave.confirm}
                cancelText={T.confirmLeave.cancel}
                language={language}
            />

            <HistoryModal
                isOpen={uiStore.isHistoryModalOpen}
                onClose={() => uiStore.closeModal('history')}
                history={trickHistory}
                language={language}
                aiName={currentWaifu?.name ?? ''}
                cardDeckStyle={cardDeckStyle}
                gameplayMode={gameplayMode}
            />
            
            <KasumiSwapModal
                isOpen={isKasumiModalOpen}
                onClose={gameStateStore.closeKasumiModal}
                onCardSelect={gameStateStore.handleKasumiCardSwap}
                briscolaCard={briscolaCard}
                hand={humanHand}
                language={language}
                cardDeckStyle={cardDeckStyle}
            />

            <BriscolaSwapModal
                isOpen={isBriscolaSwapModalOpen}
                onClose={closeBriscolaSwapModal}
                onCardSelect={handleBriscolaSwap}
                briscolaCard={briscolaCard}
                hand={humanHand}
                language={language}
                cardDeckStyle={cardDeckStyle}
            />

            <SoundEditorModal
                isOpen={uiStore.isSoundEditorModalOpen}
                onClose={() => uiStore.closeModal('soundEditor')}
                settings={gameSettingsStore.soundEditorSettings}
                onSettingsChange={(v) => gameSettingsStore.soundEditorSettings = typeof v === 'function' ? v(gameSettingsStore.soundEditorSettings) : v}
                language={language}
            />

            <SettingsModal
                isOpen={uiStore.isSettingsModalOpen}
                onClose={() => uiStore.closeModal('settings')}
                language={language}
            />

            <LegendModal
                isOpen={uiStore.isLegendModalOpen}
                onClose={() => uiStore.closeModal('legend')}
                language={language}
            />

            {newFollower && (
                <NewFollowerModal
                    waifu={newFollower}
                    onContinue={acknowledgeNewFollower}
                />
            )}
        </>
    );
});