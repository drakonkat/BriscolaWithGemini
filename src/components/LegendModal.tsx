/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { ElementIcon } from './ElementIcon';
import { POWER_UP_DEFINITIONS } from '../core/roguelikePowers';
import type { Language } from '../core/types';

interface LegendModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

export const LegendModal = observer(({ isOpen, onClose, language }: LegendModalProps) => {
    const { gameStateStore } = useStores();
    const { activeElements, roguelikeState } = gameStateStore;

    if (!isOpen) {
        return null;
    }

    const T = translations[language];

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <h2>{T.elementalPowersTitle}</h2>
                
                {activeElements.length > 0 && (
                    <>
                        <h3 className="rules-subtitle">{T.elementalPowersTitle}</h3>
                        <div className="elemental-powers-legend-list">
                            {activeElements.map(element => {
                                const descriptionKey = `${element}Description` as 'fireDescription' | 'waterDescription' | 'airDescription' | 'earthDescription';
                                return (
                                    <div key={element} className="elemental-power-row">
                                       <ElementIcon element={element} />
                                       <div className="elemental-power-description">
                                           <strong>{T[element]}:</strong>
                                           <span>{T[descriptionKey] as string}</span>
                                       </div>
                                    </div>
                                );
                            })}
                        </div>
                        <h4 className="rules-subtitle" style={{ fontSize: '1.3rem', marginTop: '1.5rem' }}>{T.roguelike.elementalCycleTitle}</h4>
                        <div className="elemental-cycle-display modal-version">
                            <ElementIcon element="water" /> &gt; <ElementIcon element="fire" /> &gt; <ElementIcon element="air" /> &gt; <ElementIcon element="earth" /> &gt; <ElementIcon element="water" />
                        </div>
                    </>
                )}

                {roguelikeState.activePowers.length > 0 && (
                    <>
                        <h3 className="rules-subtitle">{T.roguelike.allPowersTitle}</h3>
                        <div className="roguelike-powers-rules-list">
                            {roguelikeState.activePowers.map(power => (
                                <div key={power.id} className="power-rule-entry">
                                    <strong>{POWER_UP_DEFINITIONS[power.id].name(language)} (Lv. {power.level})</strong>
                                    <ul>
                                        <li>
                                            {POWER_UP_DEFINITIONS[power.id].description(language, power.level)}
                                        </li>
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});