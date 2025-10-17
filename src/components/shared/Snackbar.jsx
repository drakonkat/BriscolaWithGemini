/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { translations } from '../../core/translations';

export const Snackbar = observer(() => {
  const { uiStore, gameSettingsStore } = useStores();
  const { message, type } = uiStore.snackbar;
  const { language } = gameSettingsStore;

  const [isVisible, setIsVisible] = useState(false);
  const T = translations[language];

  const handleClose = useCallback(() => {
    setIsVisible(false);
    const closeTimer = setTimeout(() => {
        uiStore.hideSnackbar();
    }, 300);
    return () => clearTimeout(closeTimer);
  }, [uiStore]);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(handleClose, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, handleClose]);

  if (!message) {
    return null;
  }

  return (
    <div className={`snackbar ${isVisible ? 'show' : ''} ${type === 'warning' ? 'warning' : ''}`} role="alert" aria-live="assertive">
      <span>{message}</span>
      <button className="snackbar-close-button" onClick={handleClose} aria-label={T.close}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  );
});