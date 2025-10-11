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
    
    const abilityNameKey = `${waifu.name.toLowerCase()}_blessing` as const || `${waifu.name.toLowerCase()}_analysis` as const || `${waifu.name.toLowerCase()}_gambit` as const;
    const abilityName = T[abilityNameKey];
    const abilityDescKey = `${abilityNameKey}_desc` as const;
    const abilityDesc = T[abilityDescKey];


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
