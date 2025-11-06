/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { ElementIcon } from './ElementIcon';
import type { Mission, MissionRewardType } from '../core/types';
import { EssenceIcon } from './EssenceIcon'; // Import the new EssenceIcon

interface MissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface RewardIconProps {
    type: MissionRewardType;
    amount: number;
}
const RewardIcon: React.FC<RewardIconProps> = ({ type, amount }) => {
    const { gameSettingsStore } = useStores();
    const T = translations[gameSettingsStore.language];

    const iconMap: Record<MissionRewardType, React.ReactNode> = {
        waifuCoins: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 16.5v-1c0-.83.67-1.5 1.5-1.5H12v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5H12V7h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1H9z"/></svg>,
        r_shards: <span className="shard-icon r">R</span>,
        sr_shards: <span className="shard-icon sr">SR</span>,
        ssr_shards: <span className="shard-icon ssr">SSR</span>,
        fire_essences: <ElementIcon element="fire" />,
        water_essences: <ElementIcon element="water" />,
        air_essences: <ElementIcon element="air" />,
        earth_essences: <ElementIcon element="earth" />,
        transcendental_essences: <EssenceIcon />,
    };

    return (
        <div className="mission-reward-item" title={`${amount} ${T.missions.rewards[type]}`}>
            <div className="reward-icon-wrapper">{iconMap[type]}</div>
            <span>{amount}</span>
        </div>
    );
};

export const MissionsModal = observer(({ isOpen, onClose }: MissionsModalProps) => {
    const { missionStore, gameSettingsStore } = useStores();
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'achievements'>('weekly'); // Set default tab to Weekly as per screenshot
    const T = translations[gameSettingsStore.language];
    const TM = T.missions;

    if (!isOpen) {
        return null;
    }
    
    const renderMissionList = (missions: Mission[], states: Record<string, { progress: number, claimed: boolean }>) => {
        const sortedMissions = [...missions].sort((a, b) => {
            const aState = states[a.id];
            const bState = states[b.id];
            const aIsComplete = aState && aState.progress >= a.target && !aState.claimed;
            const bIsComplete = bState && bState.progress >= b.target && !bState.claimed;
            if (aIsComplete && !bIsComplete) return -1;
            if (!aIsComplete && bIsComplete) return 1;
            if (aState?.claimed && !bState?.claimed) return 1;
            if (!aState?.claimed && bState?.claimed) return -1;
            return 0;
        });

        if (sortedMissions.length === 0) {
            return <div className="no-missions">{TM.noMissions}</div>;
        }

        return (
            <div className="missions-list">
                {sortedMissions.map(mission => {
                    const state = states[mission.id];
                    const progress = state ? Math.min(state.progress, mission.target) : 0;
                    const isComplete = progress >= mission.target;

                    return (
                        <div key={mission.id} className={`mission-item ${state?.claimed ? 'claimed' : ''}`}>
                            <div className="mission-details">
                                <p className="mission-description">
                                    {TM.descriptions[mission.id as keyof typeof TM.descriptions]?.replace('{target}', mission.target.toString()) ?? mission.id}
                                </p>
                                <div className="mission-progress-bar">
                                    <div className="progress" style={{ width: `${(progress / mission.target) * 100}%` }} />
                                    <span className="progress-text">{progress} / {mission.target}</span>
                                </div>
                            </div>
                            <div className="mission-right-panel">
                                <div className="mission-rewards-container">
                                    {/* Removed rewardsLabel as it's implied by reward items */}
                                    <div className="mission-rewards">
                                        {Object.entries(mission.rewards).map(([type, amount]) => (
                                            <RewardIcon key={type} type={type as MissionRewardType} amount={amount!} />
                                        ))}
                                    </div>
                                </div>
                                <div className="mission-action">
                                    {!state?.claimed ? (
                                        <button
                                            className="claim-button"
                                            onClick={() => missionStore.claimReward(mission.id)}
                                            disabled={!isComplete}
                                        >
                                            {TM.claim}
                                        </button>
                                    ) : (
                                        <div className="claimed-text">{TM.claimed}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="gallery-modal missions-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>

                <div className="gallery-tabs">
                    <button className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')} aria-label={TM.daily}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                        <span>{TM.daily}</span>
                    </button>
                    <button className={`tab-button ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')} aria-label={TM.weekly}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z"/></svg>
                        <span>{TM.weekly}</span>
                    </button>
                    <button className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')} aria-label={TM.achievements}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 17.27l4.15 2.51-1.09-4.72 3.67-3.18-4.83-.42L12 7l-2.09 4.46-4.83.42 3.67 3.18-1.09 4.72L12 17.27z"/></svg>
                        <span>{TM.achievements}</span>
                    </button>
                </div>

                <div className="gallery-content">
                    {activeTab === 'daily' && renderMissionList(missionStore.dailyMissions, missionStore.missionProgress)}
                    {activeTab === 'weekly' && renderMissionList(missionStore.weeklyMissions, missionStore.missionProgress)}
                    {activeTab === 'achievements' && renderMissionList(missionStore.achievements, missionStore.achievementProgress)}
                </div>
            </div>
        </div>
    );
});