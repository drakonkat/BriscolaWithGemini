/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { translations } from '../core/translations';
import type { Language } from '../core/types';
import { CachedImage } from './CachedImage';

interface RoguelikeMapProps {
    language: Language;
    currentStage: number;
    onStartStage: () => void;
    onAbandonRun: () => void;
    backgroundUrl: string;
}

export const RoguelikeMap = ({ language, currentStage, onStartStage, onAbandonRun, backgroundUrl }: RoguelikeMapProps) => {
    const T = translations[language];
    const stages = [1, 2, 3, 4];

    return (
        <div className="roguelike-map-screen">
            <CachedImage imageUrl={backgroundUrl} alt="Game background" className="menu-background" />
            <div className="menu-content">
                <h1>{T.roguelikeMapTitle}</h1>
                <p>{T.currentStage(currentStage)}</p>

                <div className="roguelike-map-container">
                    <div className="stage-connector"></div>
                    {stages.map(stage => {
                        let status = 'locked';
                        if (stage < currentStage) status = 'completed';
                        if (stage === currentStage) status = 'current';

                        return (
                            <div key={stage} className={`stage-node ${status}`}>
                                <div className="stage-node-number">{stage}</div>
                                <div className="stage-node-elements">{stage} Elem.</div>
                            </div>
                        );
                    })}
                </div>

                <div className="roguelike-map-actions">
                    <button className="start-stage-button" onClick={onStartStage}>
                        {T.startStage}
                    </button>
                    <button className="abandon-run-button" onClick={onAbandonRun}>
                        {T.abandonRun}
                    </button>
                </div>
            </div>
        </div>
    );
};
