/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useState, useRef } from 'react';
import { translations } from '../core/translations';
import type { ChatMessage, Language, Waifu } from '../core/types';
import { CachedImage } from './CachedImage';

type GameMode = 'online' | 'fallback';

type ChatPanelProps = {
  history: ChatMessage[];
  aiName: string;
  onSendMessage: (msg: string) => void;
  isChatting: boolean;
  isAiGeneratingMessage: boolean;
  isPlayerTurn: boolean;
  hasChattedThisTurn: boolean;
  onModalClose?: () => void;
  lang: Language;
  gameMode: GameMode;
  waifu: Waifu;
  onAvatarClick: () => void;
};

export const ChatPanel = ({ 
  history, 
  aiName, 
  onSendMessage, 
  isChatting, 
  isAiGeneratingMessage, 
  isPlayerTurn, 
  hasChattedThisTurn, 
  onModalClose, 
  lang, 
  gameMode,
  waifu,
  onAvatarClick,
}: ChatPanelProps) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_MESSAGE_LENGTH = 150;
  const T = translations[lang];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [history, isChatting, isAiGeneratingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const isDisabled = !isPlayerTurn || isChatting || hasChattedThisTurn || gameMode === 'fallback';
  
  const getPlaceholder = () => {
    if (gameMode === 'fallback') return T.chatPlaceholderOffline;
    if (hasChattedThisTurn) return T.chatPlaceholderChatted;
    if (!isPlayerTurn) return T.chatPlaceholderNotYourTurn;
    return T.chatPlaceholder;
  };

  return (
    <aside className="chat-panel">
      <header className="chat-header">
        <button className="chat-header-avatar-button" onClick={onAvatarClick} aria-label={`Dettagli su ${aiName}`}>
          <CachedImage imageUrl={waifu.avatar} alt={aiName} className="chat-header-avatar" />
        </button>
        <h2>{T.chatWith(aiName)}</h2>
        <button className="chat-modal-close" onClick={onModalClose} aria-label={T.closeChat}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        </button>
      </header>
      <div className="chat-messages">
        {history.map((msg, index) => (
          <div key={index} className={`message-container ${msg.sender === 'human' ? 'human' : 'ai'}`}>
            <div className="message">{msg.text}</div>
          </div>
        ))}
        {(isChatting || isAiGeneratingMessage) && (
            <div className="message-container ai">
                <div className="message typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={isDisabled}
            maxLength={MAX_MESSAGE_LENGTH}
            aria-label={T.chatPlaceholder}
          />
          <div className={`char-counter ${message.length > MAX_MESSAGE_LENGTH - 20 ? 'limit-near' : ''}`}>
            {message.length} / {MAX_MESSAGE_LENGTH}
          </div>
        </div>
        <button type="submit" disabled={isDisabled} aria-label={isChatting ? T.sendMessageInProgress : T.sendMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </aside>
  );
};
