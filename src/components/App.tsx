/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { SafeArea } from 'capacitor-plugin-safe-area';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { Menu } from './Menu';
import { GameBoard } from './GameBoard';
import { ChatPanel } from './ChatPanel';
import { GameModals } from './GameModals';
import { Snackbar } from './Snackbar';
import { RoguelikeMap } from './RoguelikeMap';

export const App = observer(() => {
  const { gameStateStore, uiStore, gameSettingsStore, chatStore } = useStores();
  const { cardDeckStyle } = gameSettingsStore;

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
        StatusBar.setOverlaysWebView({ overlay: true });
        if (Capacitor.getPlatform() === 'android') {
            SafeArea.setImmersiveNavigationBar();
        }
    }
  }, []);

  useEffect(() => {
    if (gameStateStore.phase === 'roguelike-map' && gameStateStore.roguelikeState.justWonLevel) {
        uiStore.openModal('event');
        gameStateStore.resetJustWonLevelFlag();
    }
  }, [gameStateStore.phase, gameStateStore.roguelikeState.justWonLevel, uiStore, gameStateStore]);

  const T = translations[gameSettingsStore.language];
  const aiName = gameStateStore.currentWaifu?.name ?? '';

  if (gameStateStore.phase === 'menu') {
    return (
      <>
        <Menu />
        <GameModals />
        <Snackbar />
      </>
    );
  }

  if (gameStateStore.phase === 'roguelike-map') {
      return (
        <>
            <RoguelikeMap />
            <GameModals />
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
    </div>
  );
});