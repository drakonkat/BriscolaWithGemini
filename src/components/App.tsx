/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { Menu } from './Menu';
import { GameBoard } from './GameBoard';
import { ChatPanel } from './ChatPanel';
import { GameModals } from './GameModals';
import { Snackbar } from './Snackbar';
import { PowerSelectionScreen } from './PowerSelectionScreen';
import { TutorialOverlay } from './TutorialOverlay';
import { RoguelikeMap } from './RoguelikeMap';
import { PlayerWalletPopover } from './PlayerWalletPopover'; // Import the new component

export const App = observer(() => {
  const { gameStateStore, uiStore, gameSettingsStore, chatStore } = useStores();
  const { cardDeckStyle } = gameSettingsStore;

  useEffect(() => {
    const setupPlatformSpecifics = async () => {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.setOverlaysWebView({ overlay: true });
      }
      const buildTarget = process.env.VITE_BUILD_TARGET || 'web';
      document.body.classList.add(`platform-${buildTarget}`);
    };

    setupPlatformSpecifics();

    // Start tutorial for first-time users
    if (!gameSettingsStore.hasCompletedTutorial) {
      uiStore.startTutorial();
    }

    return () => {
      const buildTarget = process.env.VITE_BUILD_TARGET || 'web';
      document.body.classList.remove(`platform-${buildTarget}`);
    }
  }, []);

  const T = translations[gameSettingsStore.language];
  const aiName = gameStateStore.currentWaifu?.name ?? '';

  if (gameStateStore.phase === 'menu') {
    return (
      <>
        <Menu />
        <GameModals />
        <Snackbar />
        {uiStore.isTutorialActive && <TutorialOverlay />}
        {/* FAB is now always visible */}
        <button className="fab-player-wallet" onClick={() => uiStore.openModal('playerWallet')} aria-label={T.playerWallet.title}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 16.5v-1c0-.83.67-1.5 1.5-1.5H12v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5H12V7h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1H9z"/></svg>
        </button>
        <PlayerWalletPopover 
          isOpen={uiStore.isPlayerWalletOpen} 
          onClose={() => uiStore.closeModal('playerWallet')} 
          language={gameSettingsStore.language} 
        />
      </>
    );
  }

  if (gameStateStore.phase === 'power-selection') {
      return (
        <>
            <PowerSelectionScreen />
        </>
      );
  }

  if (gameStateStore.phase === 'roguelike-map') {
    return (
      <>
          <RoguelikeMap />
      </>
    );
}

  return (
    <div className={`app-container deck-style-${cardDeckStyle} ${uiStore.isChatModalOpen ? 'chat-open-mobile' : ''} ${!gameSettingsStore.isChatEnabled ? 'chat-disabled' : ''}`}>
      <GameBoard />
      
      {gameSettingsStore.isChatEnabled && gameStateStore.currentWaifu &&
        <ChatPanel />
      }

      <GameModals />
      <Snackbar />
      {uiStore.isTutorialActive && <TutorialOverlay />}
      {/* FAB is now always visible */}
      <button className="fab-player-wallet" onClick={() => uiStore.openModal('playerWallet')} aria-label={T.playerWallet.title}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 16.5v-1c0-.83.67-1.5 1.5-1.5H12v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5H12V7h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1H9z"/></svg>
      </button>
      <PlayerWalletPopover 
        isOpen={uiStore.isPlayerWalletOpen} 
        onClose={() => uiStore.closeModal('playerWallet')} 
        language={gameSettingsStore.language} 
      />
    </div>
  );
});