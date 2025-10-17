/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { translations } from '../../core/translations';

export const SettingsModal = observer(({ isOpen, onClose, language }) => {
    if (!isOpen) {
        return null;
    }

    const { gameSettingsStore, uiStore } = useStores();
    const { 
        cardDeckStyle, isChatEnabled, waitForWaifuResponse, 
        isDiceAnimationEnabled, language: currentLanguage, gameplayMode, isNsfwEnabled
    } = gameSettingsStore;

    const T = translations[currentLanguage];

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <h2>{T.settingsTitle}</h2>
                
                <div className="settings-modal-content">
                    <div className="settings-selector">
                        <label htmlFor="nsfw-toggle-modal">{T.toggleNsfwLabel}:</label>
                        <label className="toggle-switch">
                            <input id="nsfw-toggle-modal" type="checkbox" checked={isNsfwEnabled} onChange={(e) => gameSettingsStore.setIsNsfwEnabled(e.target.checked)} />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="settings-selector">
                        <label htmlFor="deck-style-select-modal">{T.cardDeckStyleLabel}:</label>
                        <div className="select-wrapper">
                            <select
                                id="deck-style-select-modal"
                                value={cardDeckStyle}
                                onChange={(e) => gameSettingsStore.setCardDeckStyle(e.target.value)}
                            >
                                <option value="classic">{T.cardDeckStyleClassic}</option>
                                <option value="poker">{T.cardDeckStylePoker}</option>
                            </select>
                        </div>
                    </div>

                    <div className="settings-selector">
                        <label htmlFor="language-select-modal">{T.language}:</label>
                        <div className="select-wrapper">
                            <select id="language-select-modal" value={currentLanguage} onChange={(e) => gameSettingsStore.setLanguage(e.target.value)}>
                                <option value="it">Italiano</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>

                    <div className="settings-selector">
                        <label htmlFor="chat-toggle-modal">{T.toggleChatLabel}:</label>
                        <label className="toggle-switch">
                            <input id="chat-toggle-modal" type="checkbox" checked={isChatEnabled} onChange={(e) => gameSettingsStore.setIsChatEnabled(e.target.checked)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className={`settings-selector ${!isChatEnabled ? 'disabled' : ''}`}>
                        <label htmlFor="wait-toggle-modal">{T.toggleWaitForWaifuLabel}:</label>
                        <label className="toggle-switch">
                            <input id="wait-toggle-modal" type="checkbox" checked={waitForWaifuResponse} onChange={(e) => {
                                gameSettingsStore.setWaitForWaifuResponse(e.target.checked);
                                if (!e.target.checked) uiStore.showSnackbar(T.fastModeEnabled, 'success');
                            }} disabled={!isChatEnabled} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    
                    {gameplayMode === 'roguelike' && (
                        <div className="settings-selector">
                            <label htmlFor="dice-animation-toggle-modal">{T.diceAnimationLabel}:</label>
                            <label className="toggle-switch">
                                <input id="dice-animation-toggle-modal" type="checkbox" checked={isDiceAnimationEnabled} onChange={(e) => gameSettingsStore.setIsDiceAnimationEnabled(e.target.checked)} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});