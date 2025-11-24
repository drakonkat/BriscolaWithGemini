/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores, DungeonModeStore } from '../stores';
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';
import { CloseIcon } from './icons/CloseIcon';

interface DungeonEndModalProps {
    isOpen: boolean;
}

export const DungeonEndModal = observer(({ isOpen }: DungeonEndModalProps) => {
    const { gameStateStore, gameSettingsStore, gachaStore } = useStores();
    const dungeonStore = gameStateStore as DungeonModeStore;
    const { dungeonRunState } = dungeonStore;
    const T = translations[gameSettingsStore.language];

    if (!isOpen || !dungeonRunState.keyRarity) {
        return null;
    }

    const { wins, totalMatches } = dungeonRunState;
    const didWinRun = wins === totalMatches;

    const rewards = gachaStore.lastDungeonRunRewards;

    return (
        <div className="game-over-overlay">
            <div className="game-over-modal dungeon-result-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={gameStateStore.goToMenu} aria-label={T.close}>
                    <CloseIcon />
                </button>

                <h2>{didWinRun ? T.dungeonRun.runCompleteTitle : T.dungeonRun.runFailedTitle}</h2>
                <p>{didWinRun 
                    ? T.dungeonRun.runCompleteMessage(totalMatches) 
                    : T.dungeonRun.runFailedMessage(wins, totalMatches)}
                </p>

                <div className="dungeon-rewards-summary">
                    <h3>{T.dungeonRun.rewardsTitle}</h3>
                    {rewards.coins > 0 && <span>{T.coinsEarned(rewards.coins)}</span>}
                    {rewards.shards.R > 0 && <span>{`+ ${rewards.shards.R} ${T.missions.rewards.r_shards}`}</span>}
                    {rewards.shards.SR > 0 && <span>{`+ ${rewards.shards.SR} ${T.missions.rewards.sr_shards}`}</span>}
                    {rewards.shards.SSR > 0 && <span>{`+ ${rewards.shards.SSR} ${T.missions.rewards.ssr_shards}`}</span>}
                    {rewards.unlockedBackground && (
                        <div className="dungeon-reward-background">
                            <span>{T.dungeonRun.rewardBackground}</span>
                            <div className="reward-image-container">
                                <CachedImage imageUrl={rewards.unlockedBackground.url} alt="background" />
                                <div className={`reward-rarity rarity-${rewards.unlockedBackground.rarity.toLowerCase()}`}>{rewards.unlockedBackground.rarity}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button onClick={gameStateStore.goToMenu}>{T.backToMenu}</button>
                </div>
            </div>
        </div>
    );
});