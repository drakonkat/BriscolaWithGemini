/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';
import { getImageUrl } from '../core/utils';
import type { Waifu } from '../core/types';

interface NewFollowerModalProps {
    waifu: Waifu;
    onContinue: () => void;
}

export const NewFollowerModal = observer(({ waifu, onContinue }: NewFollowerModalProps) => {
    const { gameSettingsStore } = useStores();
    const T = translations[gameSettingsStore.language];
    
    const abilityId = waifu.followerAbilityId;
    const abilityName = abilityId ? (T as any)[abilityId] as string : '';
    const abilityDescKey = abilityId ? `${abilityId}_desc` as keyof typeof T : null;
    const abilityDesc = abilityDescKey ? T[abilityDescKey] as string : '';


    return (
        <div className="game-over-overlay">
            <div className="rules-modal waifu-details-modal" style={{ textAlign: 'center' }}>
                <h2>{T.roguelike.newFollowerTitle}</h2>
                <p>{T.roguelike.newFollowerMessage(waifu.name)}</p>
                <CachedImage imageUrl={getImageUrl(waifu.avatar)} alt={waifu.name} className="waifu-details-image" />
                <h3>{abilityName}</h3>
                <p style={{ textAlign: 'center' }}>{abilityDesc}</p>
                <div className="modal-actions">
                    <button onClick={onContinue}>{T.roguelike.continueRun}</button>
                </div>
            </div>
        </div>
    );
});
