import React from 'react';
import { observer } from 'mobx-react-lite';
import { translations } from '../../core/translations';
import { useStores } from '../../stores';
import { EssenceIcon } from '../EssenceIcon'; // Assuming this is general purpose
import type { Language } from '../../core/types';

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
                            <span className="shard-item r"><svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg></span>
                            <div className="material-amount-wrapper">
                                <span className={`material-amount ${r_shards < cost.r_shards ? 'insufficient' : ''}`}>{r_shards}</span>
                                <span className="material-required">/ {cost.r_shards}</span>
                            </div>
                        </div>
                    )}
                    {cost.r_shards > 0 && (cost.sr_shards > 0 || cost.ssr_shards > 0 || cost.transcendental_essences > 0) && <div className="recipe-separator">+</div>}
                    {cost.sr_shards > 0 && (
                        <div className="recipe-material" title={T_gallery.shardLabelSR(cost.sr_shards)}>
                            <span className="shard-item sr"><svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg></span>
                            <div className="material-amount-wrapper">
                                <span className={`material-amount ${sr_shards < cost.sr_shards ? 'insufficient' : ''}`}>{sr_shards}</span>
                                <span className="material-required">/ {cost.sr_shards}</span>
                            </div>
                        </div>
                    )}
                    {cost.sr_shards > 0 && (cost.ssr_shards > 0 || cost.transcendental_essences > 0) && <div className="recipe-separator">+</div>}
                    {cost.ssr_shards > 0 && (
                        <div className="recipe-material" title={T_gallery.shardLabelSSR(cost.ssr_shards)}>
                            <span className="shard-item ssr"><svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg></span>
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
                        <svg className="key-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14.5,4A5.5,5.5,0,1,0,20,9.5,5.5,5.5,0,0,0,14.5,4ZM11,9.5a3.5,3.5,0,1,1,3.5,3.5A3.5,3.5,0,0,1,11,9.5ZM10,12,2,20v2H4l8-8V12Zm2-4H2v2H12V8Z"/></svg>
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
