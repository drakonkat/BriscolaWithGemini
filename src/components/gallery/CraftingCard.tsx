import React from 'react';
import { observer } from 'mobx-react-lite';
import { translations } from '../../core/translations';
import { useStores } from '../../stores';
import { EssenceIcon } from '../EssenceIcon'; // Assuming this is general purpose
import type { Language } from '../../core/types';
import { ShardIcon } from '../icons/ShardIcon';
import { KeyIcon } from '../icons/KeyIcon';

interface CraftingCardProps {
    language: Language;
    rarity: 'R' | 'SR' | 'SSR';
    r_shards: number;
    sr_shards: number;
    ssr_shards: number;
    transcendental_essences: number;
    onCraft: (rarity: 'R' | 'SR' | 'SSR') => void;
}

export const CraftingCard: React.FC<CraftingCardProps> = observer(({ language, rarity, r_shards, sr_shards, ssr_shards, transcendental_essences, onCraft }) => {
    const T = translations[language];
    const T_gallery = T.gallery;

    const costs = {
        R: { r_shards: 10, sr_shards: 0, ssr_shards: 0, transcendental_essences: 0 },
        SR: { r_shards: 25, sr_shards: 10, ssr_shards: 0, transcendental_essences: 5 },
        SSR: { r_shards: 0, sr_shards: 15, ssr_shards: 5, transcendental_essences: 10 }
    };
    const cost = costs[rarity];

    const canCraft = 
        r_shards >= cost.r_shards &&
        sr_shards >= cost.sr_shards &&
        ssr_shards >= cost.ssr_shards &&
        transcendental_essences >= cost.transcendental_essences;

    return (
        <div className={`crafting-card rarity-${rarity.toLowerCase()}`}>
            <div className="crafting-card-header">
                <h3>{T_gallery[`keyName${rarity}` as keyof typeof T_gallery] as string}</h3>
            </div>
            <div className="crafting-recipe">
                <div className="recipe-materials">
                    {cost.r_shards > 0 && (
                        <div className="recipe-material" title={T_gallery.shardLabelR(cost.r_shards)}>
                            <span className="shard-item r"><ShardIcon className="shard-icon-svg" /></span>
                            <div className="material-amount-wrapper">
                                <span className={`material-amount ${r_shards < cost.r_shards ? 'insufficient' : ''}`}>{r_shards}</span>
                                <span className="material-required">/ {cost.r_shards}</span>
                            </div>
                        </div>
                    )}
                    {cost.r_shards > 0 && (cost.sr_shards > 0 || cost.ssr_shards > 0 || cost.transcendental_essences > 0) && <div className="recipe-separator">+</div>}
                    {cost.sr_shards > 0 && (
                        <div className="recipe-material" title={T_gallery.shardLabelSR(cost.sr_shards)}>
                            <span className="shard-item sr"><ShardIcon className="shard-icon-svg" /></span>
                            <div className="material-amount-wrapper">
                                <span className={`material-amount ${sr_shards < cost.sr_shards ? 'insufficient' : ''}`}>{sr_shards}</span>
                                <span className="material-required">/ {cost.sr_shards}</span>
                            </div>
                        </div>
                    )}
                    {cost.sr_shards > 0 && (cost.ssr_shards > 0 || cost.transcendental_essences > 0) && <div className="recipe-separator">+</div>}
                    {cost.ssr_shards > 0 && (
                        <div className="recipe-material" title={T_gallery.shardLabelSSR(cost.ssr_shards)}>
                            <span className="shard-item ssr"><ShardIcon className="shard-icon-svg" /></span>
                            <div className="material-amount-wrapper">
                                <span className={`material-amount ${ssr_shards < cost.ssr_shards ? 'insufficient' : ''}`}>{ssr_shards}</span>
                                <span className="material-required">/ {cost.ssr_shards}</span>
                            </div>
                        </div>
                    )}
                    {cost.ssr_shards > 0 && cost.transcendental_essences > 0 && <div className="recipe-separator">+</div>}
                    {cost.transcendental_essences > 0 && (
                        <div className="recipe-material" title={T.missions.rewards.transcendental_essences}>
                            <EssenceIcon />
                            <div className="material-amount-wrapper">
                                <span className={`material-amount ${transcendental_essences < cost.transcendental_essences ? 'insufficient' : ''}`}>{transcendental_essences}</span>
                                <span className="material-required">/ {cost.transcendental_essences}</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="recipe-arrow">→</div>
                <div className="recipe-result">
                    <span className={`key-item ${rarity.toLowerCase()}`} title={T_gallery[`keyName${rarity}` as keyof typeof T_gallery] as string}>
                        <KeyIcon className="key-icon-svg" />
                    </span>
                    <span className={`rarity-${rarity.toLowerCase()}-text`}>1</span>
                </div>
            </div>
            <button onClick={() => onCraft(rarity)} disabled={!canCraft}>
                {T_gallery.craftButton(1)}
            </button>
        </div>
    );
});