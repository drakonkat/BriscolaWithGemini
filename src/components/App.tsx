/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { SafeArea, type SafeAreaInsets } from 'capacitor-plugin-safe-area';
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
    const setupSafeArea = async () => {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.setOverlaysWebView({ overlay: true });
        if (Capacitor.getPlatform() === 'android') {
          await SafeArea.setImmersiveNavigationBar();
        }

        const applyInsets = (insets: SafeAreaInsets) => {
          const root = document.documentElement;
          if (root && insets) {
            root.style.setProperty('--safe-area-inset-top', `${insets.top}px`);
            root.style.setProperty('--safe-area-inset-bottom', `${insets.bottom}px`);
            root.style.setProperty('--safe-area-inset-left', `${insets.left}px`);
            root.style.setProperty('--safe-area-inset-right', `${insets.right}px`);
          }
        };
        
        // Get initial insets
        try {
            const initialInsets = await SafeArea.getSafeAreaInsets();
            if(initialInsets) applyInsets(initialInsets.insets);
        } catch (e) {
            console.error('Failed to get initial safe area insets', e);
        }


        // Listen for changes
        SafeArea.addListener('safeAreaChanged', (data) => {
          if (data) applyInsets(data.insets);
        });
      }
    };

    setupSafeArea();
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
