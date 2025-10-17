/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { translations } from '../core/translations';
import { CardView } from './CardView';
import { ElementIcon } from './ElementIcon';
import { useStores, RoguelikeModeStore } from '../stores';
import { observer } from 'mobx-react-lite';

export const HistoryModal = observer(({ isOpen, onClose, history, language, aiName, cardDeckStyle, gameplayMode }) => {
    if (!isOpen) {
        return null;
    }

    const { gameSettingsStore, gameStateStore } = useStores();
    const { difficulty } = gameSettingsStore;
    const T = translations[language];
    const TH = T.history;
    const isClassicMode = gameplayMode === 'classic';

    let historyToShow = [];

    if (gameplayMode === 'roguelike') {
        const roguelikeStore = gameStateStore;
        const canSeeFullHistory = roguelikeStore.roguelikeState.activePowers.some(p => p.id === 'third_eye');
        historyToShow = canSeeFullHistory ? history : history.slice(-1);
    } else if (isClassicMode) {
        if (difficulty === 'easy') {
            historyToShow = history;
        } else if (difficulty === 'medium' || difficulty === 'hard') {
            historyToShow = history.slice(-1);
        }
    }

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className={`history-modal ${isClassicMode ? 'classic-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <h2>{TH.title}</h2>
                
                <div className="history-content">
                    <div className="history-header">
                        <span>{TH.trick}</span>
                        <span>{TH.you}</span>
                        <span>{TH.opponent}</span>
                        {!isClassicMode && <span>{TH.clash}</span>}
                        <span>{TH.pointsYou}</span>
                        <span>{TH.pointsOpponent}</span>
                        {!isClassicMode && <span>{TH.bonus}</span>}
                    </div>
                    <div className="history-list">
                        {[...historyToShow].reverse().map((entry, index) => {
                            if ('isAbilityUse' in entry && entry.isAbilityUse) {
                                return (
                                    <div key={`ability-${entry.trickNumber}-${index}`} className="history-ability-entry">
                                      <span>
                                        {TH.trick} {entry.trickNumber}: {T.history.abilityUsed(entry.waifuName, entry.abilityName)}
                                      </span>
                                    </div>
                                );
                            }
                            
                            const trickEntry = entry;
                            return (
                                <div key={trickEntry.trickNumber} className="history-entry">
                                    <span>{trickEntry.trickNumber}</span>
                                    <div><CardView card={trickEntry.humanCard} lang={language} cardDeckStyle={cardDeckStyle} /></div>
                                    <div><CardView card={trickEntry.aiCard} lang={language} cardDeckStyle={cardDeckStyle} /></div>
                                    {!isClassicMode && (
                                        <div className="history-clash-result">
                                            {trickEntry.clashResult ? (
                                                trickEntry.clashResult.type === 'dice' ? (
                                                    <span>{`${trickEntry.clashResult.humanRoll} vs ${trickEntry.clashResult.aiRoll}`}</span>
                                                ) : (
                                                    <>
                                                        <ElementIcon element={trickEntry.clashResult.winningElement} />
                                                        >
                                                        <ElementIcon element={trickEntry.clashResult.losingElement} />
                                                    </>
                                                )
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </div>
                                    )}
                                    <span className={`history-points ${trickEntry.winner === 'human' ? 'human' : ''}`}>
                                        {trickEntry.winner === 'human' ? trickEntry.points : 0}
                                    </span>
                                    <span className={`history-points ${trickEntry.winner === 'ai' ? 'ai' : ''}`}>
                                        {trickEntry.winner === 'ai' ? trickEntry.points : 0}
                                    </span>
                                    {!isClassicMode && (
                                        <span className="history-bonus-reason">
                                            {trickEntry.bonusPointsReason || '-'}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
});