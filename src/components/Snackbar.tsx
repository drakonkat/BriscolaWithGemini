/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useState, useCallback } from 'react';
import { translations } from '../core/translations';
import type { Language } from '../core/types';

interface SnackbarProps {
  message: string;
  onClose: () => void;
  lang: Language;
}

export const Snackbar = ({ message, onClose, lang }: SnackbarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const T = translations[lang];

  const handleClose = useCallback(() => {
    setIsVisible(false);
    const closeTimer = setTimeout(() => {
        onClose();
    }, 300);
    return () => clearTimeout(closeTimer);
  }, [onClose]);

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
    <div className={`snackbar ${isVisible ? 'show' : ''}`} role="alert" aria-live="assertive">
      <span>{message}</span>
      <button className="snackbar-close-button" onClick={handleClose} aria-label={T.close}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  );
};