/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores, RoguelikeModeStore } from '../stores';
import { translations } from '../core/translations';
import { ElementIcon } from './ElementIcon';
import { POWER_UP_DEFINITIONS } from '../core/roguelikePowers';
import type { Language } from '../core/types';
import { CachedImage } from './CachedImage';
import { getImageUrl } from '../core/utils';
import { CloseIcon } from './icons/CloseIcon';

interface LegendModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

export const LegendModal = observer(({ isOpen, onClose, language }: LegendModalProps) => {
    const { gameStateStore } = useStores();
    const roguelikeStore = gameStateStore as RoguelikeModeStore;
    const { activeElements, roguelikeState } = roguelikeStore;

    if (!isOpen) {
        return null;
    }

    const T = translations[language];

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <CloseIcon />
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

                {roguelikeState.followers.length > 0 && (
                    <>
                        <h3 className="rules-subtitle">{(T.roguelike as any).followerAbilitiesTitle}</h3>
                        <div className="elemental-powers-legend-list">
                            {roguelikeState.followers.map(follower => {
                                const abilityId = follower.followerAbilityId;
                                if (!abilityId) return null;

                                const abilityName = (T as any)[abilityId] as string;
                                const abilityDescKey = `${abilityId}_desc` as keyof typeof T;
                                const abilityDesc = T[abilityDescKey] as string;

                                return (
                                    <div key={follower.name} className="elemental-power-row follower-ability-row">
                                       <CachedImage imageUrl={getImageUrl(follower.avatar)} alt={follower.name} className="follower-avatar-small" />
                                       <div className="elemental-power-description">
                                           <strong>{abilityName} ({follower.name}):</strong>
                                           <span>{abilityDesc}</span>
                                       </div>
                                    </div>
                                );
                            })}
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