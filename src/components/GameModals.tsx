/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
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

import { useGameSettings } from '../hooks/useGameSettings';
import { useGachaAndGallery } from '../hooks/useGachaAndGallery';
import { useUIState } from '../hooks/useUIState';
import { useChat } from '../hooks/useChat';
import { useGameState } from '../hooks/useGameState';

import { translations } from '../core/translations';
import { shuffleDeck } from '../core/utils';
import type { RoguelikeState, RoguelikeEvent } from '../core/types';

type GameModalsProps = {
    uiState: ReturnType<typeof useUIState>['uiState'];
    uiActions: ReturnType<typeof useUIState>['uiActions'];
    gameState: ReturnType<typeof useGameState>['gameState'];
    gameActions: ReturnType<typeof useGameState>['gameActions'];
    chatActions: ReturnType<typeof useChat>['chatActions'];
    gachaState: ReturnType<typeof useGachaAndGallery>['gachaState'];
    gachaActions: ReturnType<typeof useGachaAndGallery>['gachaActions'];
    settings: ReturnType<typeof useGameSettings>['settings'];
};

export const GameModals = ({
    uiState,
    uiActions,
    gameState,
    gameActions,
    chatActions,
    gachaState,
    gachaActions,
    settings,
}: GameModalsProps) => {
    const T = translations[settings.language];
    const TR = T.roguelike;

    const handleEventChoice = (choice: () => void) => {
        choice();
        gameActions.setPhase('roguelike-map');
    }

    const generateEvents = (): RoguelikeEvent[] => {
        const allEventGenerators = [
            (): RoguelikeEvent => ({
                type: 'market',
                title: TR.marketTitle,
                description: TR.marketDescription,
                choices: [
                    { text: TR.fortuneAmulet, description: TR.fortuneAmuletDesc, action: () => gameActions.setRoguelikeState((p: RoguelikeState) => ({ ...p, activePowerUp: 'fortune_amulet' })) },
                    { text: TR.insightPotion, description: TR.insightPotionDesc, action: () => gameActions.setRoguelikeState((p: RoguelikeState) => ({ ...p, activePowerUp: 'insight_potion' })) },
                    { text: TR.coinPouch, description: TR.coinPouchDesc, action: () => gachaActions.addCoins(50) }
                ]
            }),
            (): RoguelikeEvent => ({
                type: 'witch_hut',
                title: TR.witchHutTitle,
                description: TR.witchHutDescription,
                choices: [
                    { text: TR.powerUpAbility(T[gameState.humanAbility!]), description: TR.powerUpAbilityDesc, action: () => {} },
                    { text: TR.swapAbility, description: TR.swapAbilityDesc, action: () => {} }
                ]
            }),
            (): RoguelikeEvent => ({
                type: 'healing_fountain',
                title: TR.healingFountainTitle,
                description: TR.healingFountainDescription,
                choices: [
                    { text: TR.startWith10Points, description: TR.startWith10PointsDesc, action: () => gameActions.setRoguelikeState((p: RoguelikeState) => ({...p, activePowerUp: 'healing_fountain'})) }
                ]
            }),
            (): RoguelikeEvent => ({
                type: 'challenge_altar',
                title: TR.challengeAltarTitle,
                description: TR.challengeAltarDescription,
                choices: [
                    { text: TR.acceptChallenge, description: TR.challengeScoreAbove80(100), action: () => gameActions.setRoguelikeState((p: RoguelikeState) => ({...p, challenge: {type: 'score_above_80', reward: 100, completed: false}})) },
                    { text: TR.skipEvent, action: () => {} }
                ]
            }),
        ];
        return shuffleDeck(allEventGenerators).slice(0, 3).map(gen => gen());
    }

    return (
        <>
            {gameState.phase === 'gameOver' && gameState.gameResult && settings.gameplayMode === 'classic' &&(
                <GameOverModal
                    humanScore={gameState.humanScore}
                    aiScore={gameState.aiScore}
                    aiName={gameState.currentWaifu?.name ?? ''}
                    winner={gameState.gameResult}
                    onPlayAgain={() => gameActions.startGame(gameState.currentWaifu)}
                    onGoToMenu={gameActions.goToMenu}
                    language={settings.language}
                    winnings={gameState.lastGameWinnings}
                />
            )}
            
            {gameState.phase === 'gameOver' && gameState.gameResult && settings.gameplayMode === 'roguelike' && (
                 <div className="game-over-overlay">
                    <div className="game-over-modal">
                        <h2>{gameState.gameResult === 'human' ? TR.runCompleted : TR.runFailed}</h2>
                        <p>{gameState.gameResult === 'human' ? TR.runCompletedMessage(gameState.lastGameWinnings) : TR.runFailedMessage(gameState.lastGameWinnings)}</p>
                        {gameState.gameResult === 'ai' ? (
                            <button onClick={gameActions.goToMenu}>{T.backToMenu}</button>
                        ) : (
                            <button onClick={() => gameActions.setPhase('roguelike-map')}>{TR.backToMap}</button>
                        )}
                    </div>
                </div>
            )}

            {gameState.phase === 'roguelike-crossroads' && (
                <EventModal 
                    events={generateEvents()}
                    onChoiceSelected={handleEventChoice}
                    language={settings.language}
                />
            )}

            {uiState.isQuotaExceededModalOpen && gameState.gameMode === 'online' && (
                <QuotaExceededModal language={settings.language} onContinue={gameActions.continueFromQuotaModal} />
            )}

            <RulesModal isOpen={uiState.isRulesModalOpen} onClose={() => uiActions.closeModal('rules')} language={settings.language} difficulty={settings.difficulty} />
            <PrivacyPolicyModal isOpen={uiState.isPrivacyModalOpen} onClose={() => uiActions.closeModal('privacy')} language={settings.language} />
            <TermsAndConditionsModal isOpen={uiState.isTermsModalOpen} onClose={() => uiActions.closeModal('terms')} language={settings.language} />
            
            <GalleryModal
              isOpen={uiState.isGalleryModalOpen}
              onClose={() => uiActions.closeModal('gallery')}
              language={settings.language}
              backgrounds={gachaState.BACKGROUNDS}
              unlockedBackgrounds={gachaState.unlockedBackgrounds}
              waifuCoins={gachaState.waifuCoins}
              onGachaRoll={gachaActions.handleGachaRoll}
              onImageSelect={gachaActions.openFullscreenImage}
              hasRolledGacha={gachaState.hasRolledGacha}
            />
            
            <FullscreenImageModal
              isOpen={!!gachaState.fullscreenImage}
              imageUrl={gachaState.fullscreenImage}
              onClose={gachaActions.closeFullscreenImage}
              language={settings.language}
            />

            {gameState.currentWaifu && (
                <WaifuDetailsModal 
                    isOpen={uiState.isWaifuModalOpen}
                    onClose={() => uiActions.closeModal('waifuDetails')}
                    waifu={gameState.currentWaifu}
                    language={settings.language}
                />
            )}

            <SupportModal
                isOpen={uiState.isSupportModalOpen}
                onClose={() => uiActions.closeModal('support')}
                onVote={uiActions.handleSubscriptionInterest}
                hasVoted={uiState.hasVotedForSubscription}
                language={settings.language}
            />

            <ConfirmationModal
                isOpen={uiState.isConfirmLeaveModalOpen}
                onClose={() => uiActions.closeModal('confirmLeave')}
                onConfirm={() => {
                    gameActions.confirmLeaveGame();
                    uiActions.closeModal('confirmLeave');
                }}
                title={T.confirmLeave.title}
                message={T.confirmLeave.message}
                confirmText={T.confirmLeave.confirm}
                cancelText={T.confirmLeave.cancel}
                language={settings.language}
            />

            <HistoryModal
                isOpen={uiState.isHistoryModalOpen}
                onClose={() => uiActions.closeModal('history')}
                history={gameState.trickHistory}
                language={settings.language}
                aiName={gameState.currentWaifu?.name ?? ''}
            />
            
            <KasumiSwapModal
                isOpen={gameState.isKasumiModalOpen}
                onClose={gameActions.closeKasumiModal}
                onCardSelect={gameActions.handleKasumiCardSwap}
                briscolaCard={gameState.briscolaCard}
                hand={gameState.humanHand}
                language={settings.language}
            />
        </>
    );
};