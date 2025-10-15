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
        if (isDungeon && dungeonStore.dungeonRunState.keyRarity) {
            dungeonStore.startDungeonRun(dungeonStore.dungeonRunState.keyRarity);
        } else {
            gameStateStore.startGame(currentWaifu);
        }
    };
    
    return (
        <>
            {phase === 'gameOver' && gameResult && gameplayMode === 'classic' && !dungeonStore?.dungeonRunState.isActive && (
                <GameOverModal
                    humanScore={humanScore}
                    aiScore={aiScore}
                    aiName={currentWaifu?.name ?? ''}
                    winner={gameResult}
                    onPlayAgain={handlePlayAgain}
                    onGoToMenu={gameStateStore.goToMenu}
                    language={language}
                    winnings={lastGameWinnings}
                    challengeMatchRarity={null}
                />
            )}

            {phase === 'gameOver' && gameResult && isRoguelike && (
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
            
            {isRoguelike && roguelikeStore && (
                <>
                    <KasumiSwapModal
                        isOpen={roguelikeStore.isKasumiModalOpen}
                        onClose={roguelikeStore.closeKasumiModal}
                        onCardSelect={roguelikeStore.handleKasumiCardSwap}
                        briscolaCard={briscolaCard}
                        hand={humanHand}
                        language={language}
                        cardDeckStyle={cardDeckStyle}
                    />

                    <BriscolaSwapModal
                        isOpen={roguelikeStore.isBriscolaSwapModalOpen}
                        onClose={roguelikeStore.closeBriscolaSwapModal}
                        onCardSelect={roguelikeStore.handleBriscolaSwap}
                        briscolaCard={briscolaCard}
                        hand={humanHand}
                        language={language}
                        cardDeckStyle={cardDeckStyle}
                    />

                    <LegendModal
                        isOpen={uiStore.isLegendModalOpen}
                        onClose={() => uiStore.closeModal('legend')}
                        language={language}
                    />

                    {roguelikeStore.newFollower && (
                        <NewFollowerModal
                            waifu={roguelikeStore.newFollower}
                            onContinue={roguelikeStore.acknowledgeNewFollower}
                        />
                    )}
                </>
            )}

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

            {isDungeon && dungeonStore && (
                <>
                    {uiStore.isNoKeysModalOpen && (
                        <div className="game-over-overlay" onClick={() => uiStore.closeModal('noKeys')}>
                            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                                <button className="modal-close-button" onClick={() => uiStore.closeModal('noKeys')} aria-label={T.close}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                    </svg>
                                </button>
                                <h2>{T.challengeMatch.noKeysModalTitle}</h2>
                                <p>{T.challengeMatch.noKeysModalMessage}</p>
                                <div className="modal-actions">
                                    <button onClick={() => { uiStore.closeModal('noKeys'); uiStore.openModal('gallery'); }}>{T.gallery.promoButton}</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {uiStore.isChallengeKeySelectionModalOpen && (
                        <div className="game-over-overlay" onClick={() => uiStore.closeModal('challengeKeySelection')}>
                            <div className="challenge-key-selection-modal" onClick={(e) => e.stopPropagation()}>
                                <button className="modal-close-button" onClick={() => uiStore.closeModal('challengeKeySelection')} aria-label={T.close}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                    </svg>
                                </button>
                                <h2>{T.challengeMatch.keySelectionTitle}</h2>
                                <p>{T.challengeMatch.keySelectionMessage}</p>
                                <div className="challenge-buttons">
                                    <button className="challenge-button r" onClick={() => dungeonStore.startGame('R')} disabled={gachaStore.r_keys === 0}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 2.1a1 1 0 0 0-1 0L3 6.8a1 1 0 0 0-.5.9V12h2V8.3l7-3.8 7 3.8V12h2V7.7a1 1 0 0 0-.5-.9zM12 10a3 3 0 1 1 0 6 3 3 0 0 1 0-6m0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/></svg>
                                        <span>{T.gallery.keyLabelR(gachaStore.r_keys)}</span>
                                    </button>
                                    <button className="challenge-button sr" onClick={() => dungeonStore.startGame('SR')} disabled={gachaStore.sr_keys === 0}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 2.1a1 1 0 0 0-1 0L3 6.8a1 1 0 0 0-.5.9V12h2V8.3l7-3.8 7 3.8V12h2V7.7a1 1 0 0 0-.5-.9zM12 10a3 3 0 1 1 0 6 3 3 0 0 1 0-6m0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/></svg>
                                        <span>{T.gallery.keyLabelSR(gachaStore.sr_keys)}</span>
                                    </button>
                                    <button className="challenge-button ssr" onClick={() => dungeonStore.startGame('SSR')} disabled={gachaStore.ssr_keys === 0}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 2.1a1 1 0 0 0-1 0L3 6.8a1 1 0 0 0-.5.9V12h2V8.3l7-3.8 7 3.8V12h2V7.7a1 1 0 0 0-.5-.9zM12 10a3 3 0 1 1 0 6 3 3 0 0 1 0-6m0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/></svg>
                                        <span>{T.gallery.keyLabelSSR(gachaStore.ssr_keys)}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <DungeonProgressModal isOpen={uiStore.isDungeonProgressModalOpen} />
                    <DungeonEndModal isOpen={uiStore.isDungeonEndModalOpen} />
                </>
            )}

            <MissionsModal isOpen={uiStore.isMissionsModalOpen} onClose={() => uiStore.closeModal('missions')} />
        </>
    );
});
