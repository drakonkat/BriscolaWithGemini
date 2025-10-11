/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language, TrickHistoryEntry, CardDeckStyle, GameplayMode } from '../core/types';
import { CardView } from './CardView';
import { ElementIcon } from './ElementIcon';
import { useStores } from '../stores';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: TrickHistoryEntry[];
    language: Language;
    aiName: string;
    cardDeckStyle: CardDeckStyle;
    gameplayMode: GameplayMode;
}

export const HistoryModal = ({ isOpen, onClose, history, language, aiName, cardDeckStyle, gameplayMode }: HistoryModalProps) => {
    if (!isOpen) {
        return null;
    }

    const { gameStateStore } = useStores();
    const T = translations[language];
    const TH = T.history;
    const isClassicMode = gameplayMode === 'classic';

    const canSeeFullHistory = isClassicMode || (gameplayMode === 'roguelike' && gameStateStore.roguelikeState.activePowers.some(p => p.id === 'third_eye'));
    const historyToShow = canSeeFullHistory ? history : history.slice(-1);

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
                        {[...historyToShow].reverse().map(entry => (
                            <div key={entry.trickNumber} className="history-entry">
                                <span>{entry.trickNumber}</span>
                                <div><CardView card={entry.humanCard} lang={language} cardDeckStyle={cardDeckStyle} /></div>
                                <div><CardView card={entry.aiCard} lang={language} cardDeckStyle={cardDeckStyle} /></div>
                                {!isClassicMode && (
                                    <div className="history-clash-result">
                                        {entry.clashResult ? (
                                            entry.clashResult.type === 'dice' ? (
                                                <span>{`${entry.clashResult.humanRoll} vs ${entry.clashResult.aiRoll}`}</span>
                                            ) : (
                                                <>
                                                    <ElementIcon element={entry.clashResult.winningElement} />
                                                    &gt;
                                                    <ElementIcon element={entry.clashResult.losingElement} />
                                                </>
                                            )
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </div>
                                )}
                                <span className={`history-points ${entry.winner === 'human' ? 'human' : ''}`}>
                                    {entry.winner === 'human' ? entry.points : 0}
                                </span>
                                <span className={`history-points ${entry.winner === 'ai' ? 'ai' : ''}`}>
                                    {entry.winner === 'ai' ? entry.points : 0}
                                </span>
                                {!isClassicMode && (
                                    <span className="history-bonus-reason">
                                        {entry.bonusPointsReason || '-'}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};