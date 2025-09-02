/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useMemo, useRef, useEffect } from 'react';
import { translations } from '../core/translations';

// Custom Hooks
import { useGameSettings } from '../hooks/useGameSettings';
import { useGachaAndGallery } from '../hooks/useGachaAndGallery';
import { useUIState } from '../hooks/useUIState';
import { useChat } from '../hooks/useChat';
import { useGameState } from '../hooks/useGameState';

// Components
import { Menu } from './Menu';
import { GameBoard } from './GameBoard';
import { ChatPanel } from './ChatPanel';
import { GameModals } from './GameModals';
import { Snackbar } from './Snackbar';
import { RoguelikeMap } from './RoguelikeMap';
import { playSound } from '../core/soundManager';

export function App() {
  const { settings, setters } = useGameSettings();
  const { uiState, uiActions } = useUIState(settings.language);
  const { gachaState, gachaActions } = useGachaAndGallery(
    uiActions.showSnackbar,
    settings.language
  );

  const onAiMessageGeneratedRef = useRef((_message: string) => {});

  const { gameState, gameActions } = useGameState({
      settings,
      onGameEnd: gachaActions.addCoins,
      closeWaifuBubble: uiActions.closeWaifuBubble,
      onAiMessageGenerated: (message) => onAiMessageGeneratedRef.current(message),
  });

  const { chatState, chatActions } = useChat({
      isChatEnabled: settings.isChatEnabled,
      currentWaifu: gameState.currentWaifu,
      emotionalState: gameState.aiEmotionalState,
      language: settings.language,
      isChatModalOpen: uiState.isChatModalOpen,
      showWaifuBubble: uiActions.showWaifuBubble,
      setUnreadMessageCount: uiActions.setUnreadMessageCount,
      isQuotaExceeded: gameState.isQuotaExceeded,
      onQuotaExceeded: gameActions.handleQuotaExceeded,
      phase: gameState.phase,
  });

  useEffect(() => {
    onAiMessageGeneratedRef.current = (message: string) => {
      chatActions.addMessageToChat(message, 'ai');
      uiActions.showWaifuBubble(message);
      if (!uiState.isChatModalOpen) {
        uiActions.setUnreadMessageCount(prev => prev + 1);
        playSound('chat-notify');
      }
    };
  }, [chatActions, uiActions, uiState.isChatModalOpen]);

  useEffect(() => {
    if (gameState.phase === 'roguelike-map' && gameState.roguelikeState.justWonLevel) {
        uiActions.openModal('event');
        gameActions.resetJustWonLevelFlag();
    }
  }, [gameState.phase, gameState.roguelikeState.justWonLevel, uiActions, gameActions]);

  const T = useMemo(() => translations[settings.language], [settings.language]);
  const aiName = useMemo(() => gameState.currentWaifu?.name ?? '', [gameState.currentWaifu]);

  if (gameState.phase === 'menu') {
    return (
      <>
        <Menu
          language={settings.language}
          gameplayMode={settings.gameplayMode}
          difficulty={settings.difficulty}
          isChatEnabled={settings.isChatEnabled}
          waitForWaifuResponse={settings.waitForWaifuResponse}
          backgroundUrl={uiState.menuBackgroundUrl}
          waifuCoins={gachaState.waifuCoins}
          onLanguageChange={setters.setLanguage}
          onGameplayModeChange={setters.setGameplayMode}
          onDifficultyChange={setters.setDifficulty}
          onChatEnabledChange={setters.setIsChatEnabled}
          onWaitForWaifuResponseChange={(enabled) => {
            setters.setWaitForWaifuResponse(enabled);
            if (!enabled) {
              uiActions.showSnackbar(T.fastModeEnabled, 'success');
            }
          }}
          onStartGame={gameActions.startGame}
          onShowRules={() => uiActions.openModal('rules')}
          onShowPrivacy={() => uiActions.openModal('privacy')}
          onShowTerms={() => uiActions.openModal('terms')}
          onShowSupport={() => uiActions.openModal('support')}
          onRefreshBackground={uiActions.refreshMenuBackground}
          onShowGallery={() => uiActions.openModal('gallery')}
        />
        <GameModals
          uiState={uiState}
          uiActions={uiActions}
          gameState={gameState}
          gameActions={gameActions}
          chatActions={chatActions}
          gachaState={gachaState}
          gachaActions={gachaActions}
          settings={settings}
        />
        <Snackbar
          message={uiState.snackbar.message}
          onClose={uiActions.hideSnackbar}
          lang={settings.language}
          type={uiState.snackbar.type}
        />
      </>
    );
  }

  if (gameState.phase === 'roguelike-map') {
      return (
        <>
            <RoguelikeMap
                roguelikeState={gameState.roguelikeState}
                onStartLevel={gameActions.startRoguelikeLevel}
                language={settings.language}
                backgroundUrl={uiState.menuBackgroundUrl}
            />
            <GameModals
              uiState={uiState}
              uiActions={uiActions}
              gameState={gameState}
              gameActions={gameActions}
              chatActions={chatActions}
              gachaState={gachaState}
              gachaActions={gachaActions}
              settings={settings}
            />
        </>
      );
  }

  return (
    <div className={`app-container ${uiState.isChatModalOpen ? 'chat-open-mobile' : ''} ${!settings.isChatEnabled ? 'chat-disabled' : ''}`}>
      <GameBoard
        aiName={aiName}
        aiScore={gameState.aiScore}
        aiHand={gameState.aiHand}
        humanScore={gameState.humanScore}
        humanHand={gameState.humanHand}
        briscolaCard={gameState.briscolaCard}
        deckSize={gameState.deck.length + (gameState.briscolaCard ? 1 : 0)}
        cardsOnTable={gameState.cardsOnTable}
        message={gameState.message}
        isProcessing={gameState.isProcessing}
        turn={gameState.turn}
        trickStarter={gameState.trickStarter}
        onSelectCardForPlay={gameActions.selectCardForPlay}
        onConfirmCardPlay={gameActions.confirmCardPlay}
        onCancelCardPlay={gameActions.cancelCardPlay}
        onGoToMenu={() => uiActions.openModal('confirmLeave')}
        onOpenSupportModal={() => uiActions.openModal('support')}
        onOpenHistoryModal={() => uiActions.openModal('history')}
        onCloseElementalClash={gameActions.forceCloseClashModal}
        language={settings.language}
        backgroundUrl={gameState.backgroundUrl}
        animatingCard={uiState.animatingCard}
        drawingCards={uiState.drawingCards}
        currentWaifu={gameState.currentWaifu}
        onWaifuIconClick={() => settings.isChatEnabled ? uiActions.openModal('chat') : uiActions.openModal('waifuDetails')}
        isChatEnabled={settings.isChatEnabled}
        unreadMessageCount={uiState.unreadMessageCount}
        isAiTyping={chatState.isAiChatting || gameState.isAiGeneratingMessage}
        waifuBubbleMessage={uiState.waifuBubbleMessage}
        onCloseBubble={uiActions.closeWaifuBubble}
        gameplayMode={settings.gameplayMode}
        powerAnimation={gameState.powerAnimation}
        humanAbility={gameState.humanAbility}
        aiAbility={gameState.aiAbility}
        humanAbilityCharges={gameState.humanAbilityCharges}
        aiAbilityCharges={gameState.aiAbilityCharges}
        onActivateHumanAbility={gameActions.activateHumanAbility}
        abilityTargetingState={gameState.abilityTargetingState}
        onTargetCardInHand={gameActions.targetCardInHandForAbility}
        onTargetCardOnTable={gameActions.targetCardOnTableForAbility}
        onCancelAbility={gameActions.cancelAbilityTargeting}
        onUndoAbilityUse={gameActions.onUndoAbilityUse}
        abilityUsedThisTurn={gameState.abilityUsedThisTurn}
        revealedAiHand={gameState.revealedAiHand}
        cardForElementalChoice={gameState.cardForElementalChoice}
        elementalClash={gameState.elementalClash}
        lastTrickHighlights={gameState.lastTrickHighlights}
        lastTrick={gameState.lastTrick}
        activeElements={gameState.activeElements}
        roguelikeState={gameState.roguelikeState}
        onActivateFollowerAbility={gameActions.activateFollowerAbility}
        onCancelFollowerAbility={gameActions.cancelFollowerAbility}
        abilityArmed={gameState.abilityArmed}
      />
      
      {settings.isChatEnabled && gameState.currentWaifu &&
        <ChatPanel
          history={chatState.chatHistory}
          aiName={aiName}
          onSendMessage={chatActions.handleSendChatMessage}
          isChatting={chatState.isAiChatting}
          isAiGeneratingMessage={gameState.isAiGeneratingMessage}
          isPlayerTurn={gameState.turn === 'human'}
          hasChattedThisTurn={chatState.hasChattedThisTurn}
          onModalClose={() => uiActions.closeModal('chat')}
          lang={settings.language}
          gameMode={gameState.gameMode}
          waifu={gameState.currentWaifu}
          onAvatarClick={() => uiActions.openModal('waifuDetails')}
        />
      }

      <GameModals
        uiState={uiState}
        uiActions={uiActions}
        gameState={gameState}
        gameActions={gameActions}
        chatActions={chatActions}
        gachaState={gachaState}
        gachaActions={gachaActions}
        settings={settings}
      />
      
      <Snackbar
        message={uiState.snackbar.message}
        onClose={uiActions.hideSnackbar}
        lang={settings.language}
        type={uiState.snackbar.type}
      />
    </div>
  );
}