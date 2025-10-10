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

export const App = observer(() => {
  const { gameStateStore, uiStore, gameSettingsStore, chatStore } = useStores();
  const { cardDeckStyle } = gameSettingsStore;

  useEffect(() => {
    const setupPlatformSpecifics = async () => {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.setOverlaysWebView({ overlay: true });
      }
    };

    setupPlatformSpecifics();

    // Start tutorial for first-time users
    if (!gameSettingsStore.hasCompletedTutorial) {
      uiStore.startTutorial();
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

  return (
    <div className={`app-container deck-style-${cardDeckStyle} ${uiStore.isChatModalOpen ? 'chat-open-mobile' : ''} ${!gameSettingsStore.isChatEnabled ? 'chat-disabled' : ''}`}>
      <GameBoard />
      
      {gameSettingsStore.isChatEnabled && gameStateStore.currentWaifu &&
        <ChatPanel />
      }

      <GameModals />
      <Snackbar />
      {uiStore.isTutorialActive && <TutorialOverlay />}
    </div>
  );
});