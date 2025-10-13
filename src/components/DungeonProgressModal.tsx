/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';

interface DungeonProgressModalProps {
    isOpen: boolean;
}

export const DungeonProgressModal = observer(({ isOpen }: DungeonProgressModalProps) => {
    const { gameStateStore, gameSettingsStore, gachaStore } = useStores();
    const { dungeonRunState, currentWaifu } = gameStateStore;
    const T = translations[gameSettingsStore.language];

    if (!isOpen || !dungeonRunState.isActive) {
        return null;
    }

    const rewards = gachaStore.lastDungeonMatchRewards;
    const nextMatch = dungeonRunState.currentMatch + 1;

    return (
        <div className="game-over-overlay">
            {/* FIX: Replaced direct method call with a call to the correctly implemented startNextDungeonMatch method. */}
            <div className="game-over-modal dungeon-result-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={gameStateStore.startNextDungeonMatch} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
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
                    {/* FIX: Replaced direct method call with a call to the correctly implemented startNextDungeonMatch method. */}
                    <button onClick={gameStateStore.startNextDungeonMatch}>{T.dungeonRun.continueRun}</button>
                </div>
            </div>
        </div>
    );
});