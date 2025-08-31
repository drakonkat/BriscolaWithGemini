/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';
import type { Language, RoguelikeState } from '../core/types';

interface RoguelikeMapProps {
    roguelikeState: RoguelikeState;
    onStartLevel: () => void;
    language: Language;
    backgroundUrl: string;
}

const LEVEL_REWARDS = [0, 25, 50, 75, 150];

export const RoguelikeMap = ({ roguelikeState, onStartLevel, language, backgroundUrl }: RoguelikeMapProps) => {
    const T = translations[language];
    const TR = T.roguelike;
    const { currentLevel } = roguelikeState;

    return (
        <div className="roguelike-map">
            <CachedImage imageUrl={backgroundUrl} alt="Roguelike Map Background" className="menu-background" />
            <div className="roguelike-map-content">
                <h1>{TR.mapTitle}</h1>
                
                <div className="map-nodes">
                    <div className="map-path"></div>
                    {[1, 2, 3, 4].map(level => (
                        <div key={level} className={`map-node ${currentLevel > level ? 'completed' : ''} ${currentLevel === level ? 'active' : ''}`}>
                            <div className="map-node-level">{TR.level(level)}</div>
                            <div className="map-node-reward">{TR.reward(LEVEL_REWARDS[level])}</div>
                        </div>
                    ))}
                </div>

                <div className="roguelike-map-actions">
                    <button onClick={onStartLevel}>
                        {currentLevel > 0 ? TR.continueRun : TR.startRun}
                    </button>
                </div>
            </div>
        </div>
    );
};