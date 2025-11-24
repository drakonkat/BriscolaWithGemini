/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import type { Language, TrickHistoryEntry, CardDeckStyle, GameplayMode, HistoryEntry } from '../core/types';
import { CardView } from './CardView';
import { ElementIcon } from './ElementIcon';
import { useStores, RoguelikeModeStore } from '../stores';
import { observer } from 'mobx-react-lite';
import { CloseIcon } from './icons/CloseIcon';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryEntry[];
    language: Language;
    aiName: string;
    cardDeckStyle: CardDeckStyle;
    gameplayMode: GameplayMode;
}

export const HistoryModal = observer(({ isOpen, onClose, history, language, aiName, cardDeckStyle, gameplayMode }: HistoryModalProps) => {
    const { gameStateStore } = useStores();
    const roguelikeStore = gameStateStore instanceof RoguelikeModeStore ? gameStateStore : null;
    
    if (!isOpen) {
        return null;
    }
    
    const canSeeFullHistory = gameplayMode === 'classic' || (roguelikeStore && roguelikeStore.roguelikeState.activePowers.some(p => p.id === 'third_eye'));
    const T = translations[language];

    const historyToShow = canSeeFullHistory ? history : (history.length > 0 ? [history[history.length - 1]] : []);
    
    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className={`rules-modal history-modal ${gameplayMode}`} onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <CloseIcon />
                </button>
                <h2>{T.history.title}</h2>
                <div className="history-content">
                    <div className="history-header">
                        <span>{T.history.trick}</span>
                        <span>{T.history.you}</span>
                        <span>{T.history.opponent}</span>
                        {gameplayMode !== 'classic' && <span>{T.history.clash}</span>}
                        <span>{T.history.pointsYou}</span>
                        <span>{T.history.pointsOpponent}</span>
                        {gameplayMode !== 'classic' && <span>{T.history.bonus}</span>}
                    </div>
                    {historyToShow.map((entry, index) => {
                        if ('isAbilityUse' in entry && entry.isAbilityUse) {
                            return (
                                <div key={`ability-${index}`} className="history-ability-entry">
                                    {T.history.abilityUsed(entry.waifuName, entry.abilityName)}
                                </div>
                            );
                        }
                        const trickEntry = entry as TrickHistoryEntry;
                        return (
                            <div key={trickEntry.trickNumber} className="history-entry">
                                <div>{trickEntry.trickNumber}</div>
                                <div><CardView card={trickEntry.humanCard} lang={language} cardDeckStyle={cardDeckStyle} /></div>
                                <div><CardView card={trickEntry.aiCard} lang={language} cardDeckStyle={cardDeckStyle} /></div>
                                {gameplayMode !== 'classic' && (
                                    <div className="history-clash-result">
                                        {trickEntry.clashResult?.type === 'weakness' ? (
                                            <>
                                                <ElementIcon element={trickEntry.clashResult.winningElement} />
                                                <span>&gt;</span>
                                                <ElementIcon element={trickEntry.clashResult.losingElement} />
                                            </>
                                        ) : trickEntry.clashResult?.type === 'dice' ? (
                                            <span>{trickEntry.clashResult.humanRoll} vs {trickEntry.clashResult.aiRoll}</span>
                                        ) : '—'}
                                    </div>
                                )}
                                <div className={`history-points ${trickEntry.winner === 'human' ? 'human' : ''}`}>{trickEntry.winner === 'human' ? trickEntry.points : 0}</div>
                                <div className={`history-points ${trickEntry.winner === 'ai' ? 'ai' : ''}`}>{trickEntry.winner === 'ai' ? trickEntry.points : 0}</div>
                                {gameplayMode !== 'classic' && <div>{trickEntry.bonusPointsReason || '—'}</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});