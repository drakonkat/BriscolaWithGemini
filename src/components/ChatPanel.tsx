/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Import React to use React.FormEvent type.
import React, { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { getImageUrl } from '../core/utils';
import { CachedImage } from './CachedImage';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';

export const ChatPanel = observer(() => {
  const { chatStore, gameStateStore, uiStore, gameSettingsStore } = useStores();
  const { chatHistory, isAiChatting, hasChattedThisTurn } = chatStore;
  const { currentWaifu, turn, gameMode, isAiGeneratingMessage } = gameStateStore;
  const { language } = gameSettingsStore;

  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_MESSAGE_LENGTH = 150;
  const T = translations[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatHistory, isAiChatting, isAiGeneratingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      chatStore.handleSendChatMessage(message.trim());
      setMessage('');
    }
  };

  const isDisabled = turn !== 'human' || isAiChatting || hasChattedThisTurn || gameMode === 'fallback';
  
  const getPlaceholder = () => {
    if (gameMode === 'fallback') return T.chatPlaceholderOffline;
    if (hasChattedThisTurn) return T.chatPlaceholderChatted;
    if (turn !== 'human') return T.chatPlaceholderNotYourTurn;
    return T.chatPlaceholder;
  };

  if (!currentWaifu) return null;

  return (
    <aside className="chat-panel">
      <header className="chat-header">
        <button className="chat-header-avatar-button" onClick={() => uiStore.openModal('waifuDetails')} aria-label={T.waifuDetails(currentWaifu.name)}>
          <CachedImage imageUrl={getImageUrl(currentWaifu.avatar)} alt={currentWaifu.name} className="chat-header-avatar" />
        </button>
        <h2>{T.chatWith(currentWaifu.name)}</h2>
        <button className="chat-modal-close" onClick={() => uiStore.closeModal('chat')} aria-label={T.closeChat}>
            <CloseIcon width="24" height="24" />
        </button>
      </header>
      <div className="chat-messages">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message-container ${msg.sender === 'human' ? 'ai' : 'human'}`}>
            <div className="message">
              {msg.text.split('*').map((part, i) =>
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </div>
          </div>
        ))}
        {(isAiChatting || isAiGeneratingMessage) && (
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
        <button type="submit" disabled={isDisabled || !message.trim()} aria-label={isAiChatting ? T.sendMessageInProgress : T.sendMessage}>
          <SendIcon width="24" height="24" />
        </button>
      </form>
    </aside>
  );
});