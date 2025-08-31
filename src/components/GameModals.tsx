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

import { useGameSettings } from '../hooks/useGameSettings';
import { useGachaAndGallery } from '../hooks/useGachaAndGallery';
import { useUIState } from '../hooks/useUIState';
import { useChat } from '../hooks/useChat';
import { useGameState } from '../hooks/useGameState';

import { translations } from '../core/translations';

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

    return (
        <>
            {gameState.phase === 'gameOver' && gameState.gameResult && (
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
        </>
    );
};
