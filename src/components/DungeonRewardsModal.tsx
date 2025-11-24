import React, { useState, useEffect } from 'react';
import { translations } from '../core/translations';
import type { Language } from '../core/types';
import { CloseIcon } from './icons/CloseIcon';

interface DungeonRewardsModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

export const DungeonRewardsModal: React.FC<DungeonRewardsModalProps> = ({ isOpen, onClose, language }) => {
    const [daysUntilDungeonSeasonEnd, setDaysUntilDungeonSeasonEnd] = useState<number | null>(null);
    const T = translations[language];
    const T_rewards = T.dungeonRewardsModal;

    const calculateDaysRemaining = () => {
        const now = new Date();
        let targetDate = new Date(now.getFullYear(), 11, 24); // December is month 11 (0-indexed)

        // If today is after December 24th of the current year, set target for next year
        if (now.getTime() > targetDate.getTime()) {
            targetDate = new Date(now.getFullYear() + 1, 11, 24);
        }
        
        const diffTime = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysUntilDungeonSeasonEnd(Math.max(0, diffDays));
    };

    useEffect(() => {
        if (isOpen) {
            calculateDaysRemaining();
        }
        // Update daily (if modal is open for a long time, or re-opened)
        const dailyTimer = setInterval(calculateDaysRemaining, 24 * 60 * 60 * 1000);
        return () => clearInterval(dailyTimer);
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <CloseIcon />
                </button>
                <h2>{T_rewards.title}</h2>
                {daysUntilDungeonSeasonEnd !== null && (
                    <p className="dungeon-season-end-info">
                        {T_rewards.seasonEndDate(daysUntilDungeonSeasonEnd)}
                    </p>
                )}

                <h3 className="rules-subtitle">{T_rewards.perMatchRewardsTitle}</h3>
                <ul className="rules-info-list">
                    <li className="rules-info-item">{T_rewards.perMatchCoins}</li>
                    <li className="rules-info-item">{T_rewards.perMatchFragments}</li>
                </ul>

                <h3 className="rules-subtitle">{T_rewards.finalRewardsTitle}</h3>

                {/* R Key Rewards */}
                <div className="dungeon-reward-section">
                    <h4>{T_rewards.rKey.title}</h4>
                    <h5>{T_rewards.rKey.firstTime.header}</h5>
                    <ul className="rules-info-list">
                        <li className="rules-info-item">{T_rewards.rKey.firstTime.background}</li>
                        <li className="rules-info-item">{T_rewards.rKey.firstTime.coins}</li>
                        <li className="rules-info-item">{T_rewards.rKey.firstTime.fragments}</li>
                    </ul>
                    <h5>{T_rewards.rKey.subsequent.header}</h5>
                    <ul className="rules-info-list">
                        <li className="rules-info-item">{T_rewards.rKey.subsequent.coins}</li>
                        <li className="rules-info-item">{T_rewards.rKey.subsequent.fragments}</li>
                    </ul>
                </div>

                {/* SR Key Rewards */}
                <div className="dungeon-reward-section">
                    <h4>{T_rewards.srKey.title}</h4>
                    <h5>{T_rewards.srKey.firstTime.header}</h5>
                    <ul className="rules-info-list">
                        <li className="rules-info-item">{T_rewards.srKey.firstTime.background}</li>
                        <li className="rules-info-item">{T_rewards.srKey.firstTime.coins}</li>
                        <li className="rules-info-item">{T_rewards.srKey.firstTime.fragments}</li>
                        <li className="rules-info-item">{T_rewards.srKey.firstTime.essences}</li>
                        <li className="rules-info-item">{T_rewards.srKey.firstTime.additionalKey}</li>
                    </ul>
                    <h5>{T_rewards.srKey.subsequent.header}</h5>
                    <ul className="rules-info-list">
                        <li className="rules-info-item">{T_rewards.srKey.subsequent.coins}</li>
                        <li className="rules-info-item">{T_rewards.srKey.subsequent.fragments}</li>
                        <li className="rules-info-item">{T_rewards.srKey.subsequent.essences}</li>
                        <li className="rules-info-item">{T_rewards.srKey.subsequent.additionalKey}</li>
                    </ul>
                </div>

                {/* SSR Key Rewards */}
                <div className="dungeon-reward-section">
                    <h4>{T_rewards.ssrKey.title}</h4>
                    <h5>{T_rewards.ssrKey.firstTime.header}</h5>
                    <ul className="rules-info-list">
                        <li className="rules-info-item">{T_rewards.ssrKey.firstTime.background}</li>
                        <li className="rules-info-item">{T_rewards.ssrKey.firstTime.coins}</li>
                        <li className="rules-info-item">{T_rewards.ssrKey.firstTime.fragments}</li>
                        <li className="rules-info-item">{T_rewards.ssrKey.firstTime.essences}</li>
                        <li className="rules-info-item">{T_rewards.ssrKey.firstTime.additionalKey}</li>
                    </ul>
                    <h5>{T_rewards.ssrKey.subsequent.header}</h5>
                    <ul className="rules-info-list">
                        <li className="rules-info-item">{T_rewards.ssrKey.subsequent.coins}</li>
                        <li className="rules-info-item">{T_rewards.ssrKey.subsequent.fragments}</li>
                        <li className="rules-info-item">{T_rewards.ssrKey.subsequent.essences}</li>
                        <li className="rules-info-item">{T_rewards.ssrKey.subsequent.additionalKey}</li>
                    </ul>
                </div>

                <div className="modal-actions">
                    <button onClick={onClose}>{T.close}</button>
                </div>
            </div>
        </div>
    );
};