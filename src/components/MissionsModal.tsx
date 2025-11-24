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
import { WaifuCoinIcon } from './icons/WaifuCoinIcon';
import { CloseIcon } from './icons/CloseIcon';
import { DailyIcon } from './icons/DailyIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { StarIcon } from './icons/StarIcon';

interface MissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface RewardIconProps {
    type: MissionRewardType;
    amount: number;
}
const RewardIcon: React.FC<RewardIconProps> = observer(({ type, amount }) => {
    const { gameSettingsStore } = useStores();
    const T = translations[gameSettingsStore.language];

    const iconMap: Record<MissionRewardType, React.ReactNode> = {
        waifuCoins: <WaifuCoinIcon />,
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
});

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
                                <div className="mission-rewards">
                                    {Object.entries(mission.rewards).map(([type, amount]) => (
                                        <RewardIcon key={type} type={type as MissionRewardType} amount={amount!} />
                                    ))}
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
                    <CloseIcon />
                </button>

                <div className="gallery-tabs">
                    <button className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')} aria-label={TM.daily}>
                        <DailyIcon height="24px" width="24px" />
                        <span>{TM.daily}</span>
                    </button>
                    <button className={`tab-button ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')} aria-label={TM.weekly}>
                        <CalendarIcon height="24px" width="24px" />
                        <span>{TM.weekly}</span>
                    </button>
                    <button className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')} aria-label={TM.achievements}>
                        <StarIcon height="24px" width="24px" />
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