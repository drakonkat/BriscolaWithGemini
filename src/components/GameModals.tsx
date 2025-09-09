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
import { EventModal } from './EventModal';
import { HistoryModal } from './HistoryModal';
import { KasumiSwapModal } from './KasumiSwapModal';
import { SoundEditorModal } from './SoundEditorModal';

import { translations } from '../core/translations';
import type { RoguelikeState, RoguelikeEvent } from '../core/types';

export const GameModals = observer(() => {
    const { uiStore, gameStateStore, gachaStore, gameSettingsStore } = useStores();
    const { language, difficulty, gameplayMode, cardDeckStyle } = gameSettingsStore;
    const { 
        phase, gameResult, lastGameWinnings, currentWaifu, gameMode, humanScore, aiScore, 
        trickHistory, isKasumiModalOpen, briscolaCard, humanHand, roguelikeState
    } = gameStateStore;

    const T = translations[language];
    const TR = T.roguelike;

    const handleEventChoice = (choice: () => void) => {
        choice();
        uiStore.closeModal('event');
    }

    const generateEventsFromTypes = (types: RoguelikeEvent['type'][] = []): RoguelikeEvent[] => {
        if (!types) return [];
        
        const allEventGenerators: Record<RoguelikeEvent['type'], () => RoguelikeEvent> = {
            market: (): RoguelikeEvent => ({
                type: 'market',
                title: TR.marketTitle,
                description: TR.marketDescription,
                choices: [
                    { text: TR.fortuneAmulet, description: TR.fortuneAmuletDesc, action: () => gameStateStore.roguelikeState.activePowerUp = 'fortune_amulet' },
                    { text: TR.insightPotion, description: TR.insightPotionDesc, action: () => gameStateStore.roguelikeState.activePowerUp = 'insight_potion' },
                    { text: TR.coinPouch, description: TR.coinPouchDesc, action: () => gachaStore.addCoins(50) }
                ]
            }),
            witch_hut: (): RoguelikeEvent => ({
                type: 'witch_hut',
                title: TR.witchHutTitle,
                description: TR.witchHutDescription,
                choices: [
                    { text: TR.powerUpAbility(T[roguelikeState.humanAbility!]), description: TR.powerUpAbilityDesc, action: () => {} },
                    { text: TR.swapAbility, description: TR.swapAbilityDesc, action: () => {} }
                ]
            }),
            healing_fountain: (): RoguelikeEvent => ({
                type: 'healing_fountain',
                title: TR.healingFountainTitle,
                description: TR.healingFountainDescription,
                choices: [
                    { text: TR.startWith10Points, description: TR.startWith10PointsDesc, action: () => gameStateStore.roguelikeState.activePowerUp = 'healing_fountain' }
                ]
            }),
            challenge_altar: (): RoguelikeEvent => ({
                type: 'challenge_altar',
                title: TR.challengeAltarTitle,
                description: TR.challengeAltarDescription,
                choices: [
                    { text: TR.acceptChallenge, description: TR.challengeScoreAbove80(100), action: () => gameStateStore.roguelikeState.challenge = {type: 'score_above_80', reward: 100, completed: false} },
                    { text: TR.skipEvent, action: () => {} }
                ]
            }),
        };
    
        return types.map(type => allEventGenerators[type]());
    };

    const eventsForModal = generateEventsFromTypes(roguelikeState.eventTypesForCrossroads);

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
                        {gameResult === 'ai' ? (
                            <button onClick={gameStateStore.goToMenu}>{T.backToMenu}</button>
                        ) : (
                            <button onClick={() => gameStateStore.setPhase('roguelike-map')}>{TR.backToMap}</button>
                        )}
                    </div>
                </div>
            )}

            <EventModal 
                isOpen={uiStore.isEventModalOpen}
                onClose={() => uiStore.closeModal('event')}
                events={eventsForModal}
                onChoiceSelected={handleEventChoice}
                language={language}
            />

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
              onImageSelect={gachaStore.openFullscreenImage}
              hasRolledGacha={gachaStore.hasRolledGacha}
              isRolling={gachaStore.isRolling}
              gachaAnimationState={gachaStore.gachaAnimationState}
              onAnimationEnd={gachaStore.endGachaAnimation}
            />
            
            <FullscreenImageModal
              isOpen={!!gachaStore.fullscreenImage}
              imageUrl={gachaStore.fullscreenImage}
              onClose={gachaStore.closeFullscreenImage}
              language={language}
            />

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

            <SoundEditorModal
                isOpen={uiStore.isSoundEditorModalOpen}
                onClose={() => uiStore.closeModal('soundEditor')}
                settings={gameSettingsStore.soundEditorSettings}
                onSettingsChange={(v) => gameSettingsStore.soundEditorSettings = typeof v === 'function' ? v(gameSettingsStore.soundEditorSettings) : v}
                language={language}
            />
        </>
    );
});