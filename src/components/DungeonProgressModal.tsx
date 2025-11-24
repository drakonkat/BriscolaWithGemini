/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores, DungeonModeStore } from '../stores';
import { translations } from '../core/translations';
import { CloseIcon } from './icons/CloseIcon';

interface DungeonProgressModalProps {
    isOpen: boolean;
}

export const DungeonProgressModal = observer(({ isOpen }: DungeonProgressModalProps) => {
    const { gameStateStore, gameSettingsStore, gachaStore } = useStores();
    const dungeonStore = gameStateStore as DungeonModeStore;
    const { dungeonRunState } = dungeonStore;
    const { currentWaifu } = gameStateStore;
    const T = translations[gameSettingsStore.language];

    if (!isOpen || !dungeonRunState.isActive) {
        return null;
    }

    const rewards = gachaStore.lastDungeonMatchRewards;

    return (
        <div className="game-over-overlay">
            <div className="game-over-modal dungeon-result-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={dungeonStore.prepareNextDungeonMatch} aria-label={T.close}>
                    <CloseIcon />
                </button>

                <h2>{T.dungeonRun.matchWinTitle(currentWaifu?.name ?? '')}</h2>
                <p>{T.dungeonRun.matchWinMessage(dungeonRunState.currentMatch, dungeonRunState.totalMatches)}</p>

                <div className="dungeon-rewards-summary">
                    <h3>{T.dungeonRun.intermediateRewardTitle}</h3>
                    {rewards.coins > 0 && <span>{T.coinsEarned(rewards.coins)}</span>}
                    {rewards.shards.R > 0 && <span>{`+ ${rewards.shards.R} ${T.missions.rewards.r_shards}`}</span>}
                    {rewards.shards.SR > 0 && <span>{`+ ${rewards.shards.SR} ${T.missions.rewards.sr_shards}`}</span>}
                    {rewards.shards.SSR > 0 && <span>{`+ ${rewards.shards.SSR} ${T.missions.rewards.ssr_shards}`}</span>}
                </div>
                
                <div className="modal-actions">
                    <button onClick={dungeonStore.prepareNextDungeonMatch}>{T.dungeonRun.continueRun}</button>
                </div>
            </div>
        </div>
    );
});