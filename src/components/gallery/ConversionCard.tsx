import React from 'react';
import { observer } from 'mobx-react-lite';
import { translations } from '../../core/translations';
import { useStores } from '../../stores';
import { ElementIcon } from '../ElementIcon';
import { EssenceIcon } from '../EssenceIcon';
import type { Language } from '../../core/types';

type ConversionType = 'R_to_SR' | 'SR_to_SSR' | 'Elemental_to_Transcendental';

interface ConversionCardProps {
    language: Language;
    type: ConversionType;
    r_shards: number;
    sr_shards: number;
    ssr_shards: number;
    fire_essences: number;
    water_essences: number;
    air_essences: number;
    earth_essences: number;
    transcendental_essences: number;
    onConvert: () => void;
}

export const ConversionCard: React.FC<ConversionCardProps> = observer(({ language, type, r_shards, sr_shards, fire_essences, water_essences, air_essences, earth_essences, transcendental_essences, onConvert }) => {
    const T = translations[language];
    const T_gallery = T.gallery;
    const { gachaStore } = useStores(); // Use gachaStore directly for conversion functions

    let headerTitle = '';
    let materials: React.ReactNode[] = [];
    let result: React.ReactNode;
    let canConvert = false;
    let conversionFunction: (() => void);

    switch (type) {
        case 'R_to_SR':
            headerTitle = `10 ${T.missions.rewards.r_shards} → 1 ${T.missions.rewards.sr_shards}`;
            materials.push(
                <div className="recipe-material" title={T_gallery.shardLabelR(10)}>
                    <span className="shard-item r"><svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg></span>
                    <div className="material-amount-wrapper">
                        <span className={`material-amount ${r_shards < 10 ? 'insufficient' : ''}`}>{r_shards}</span>
                        <span className="material-required">/ 10</span>
                    </div>
                </div>
            );
            result = (
                <div className="recipe-result">
                    <span className="shard-item sr" title={T_gallery.shardLabelSR(1)}><svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg></span>
                    <span className="rarity-sr-text">1</span>
                </div>
            );
            canConvert = r_shards >= 10;
            // FIX: convertShards is a method on gachaStore.
            conversionFunction = () => gachaStore.convertShards('R', 'SR');
            break;
        case 'SR_to_SSR':
            headerTitle = `10 ${T.missions.rewards.sr_shards} → 1 ${T.missions.rewards.ssr_shards}`;
            materials.push(
                <div className="recipe-material" title={T_gallery.shardLabelSR(10)}>
                    <span className="shard-item sr"><svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg></span>
                    <div className="material-amount-wrapper">
                        <span className={`material-amount ${sr_shards < 10 ? 'insufficient' : ''}`}>{sr_shards}</span>
                        <span className="material-required">/ 10</span>
                    </div>
                </div>
            );
            result = (
                <div className="recipe-result">
                    <span className="shard-item ssr" title={T_gallery.shardLabelSSR(1)}><svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg></span>
                    <span className="rarity-ssr-text">1</span>
                </div>
            );
            canConvert = sr_shards >= 10;
            // FIX: convertShards is a method on gachaStore.
            conversionFunction = () => gachaStore.convertShards('SR', 'SSR');
            break;
        case 'Elemental_to_Transcendental':
            headerTitle = T_gallery.convertEssencesTitle;
            materials.push(
                <div className="recipe-material" title={`${fire_essences} / 10 ${T.missions.rewards.fire_essences}`}><ElementIcon element="fire" /><div className="material-amount-wrapper"><span className={fire_essences < 10 ? 'insufficient' : ''}>{fire_essences}</span><span className="material-required">/ 10</span></div></div>,
                <div className="recipe-material" title={`${water_essences} / 10 ${T.missions.rewards.water_essences}`}><ElementIcon element="water" /><div className="material-amount-wrapper"><span className={water_essences < 10 ? 'insufficient' : ''}>{water_essences}</span><span className="material-required">/ 10</span></div></div>,
                <div className="recipe-material" title={`${air_essences} / 10 ${T.missions.rewards.air_essences}`}><ElementIcon element="air" /><div className="material-amount-wrapper"><span className={air_essences < 10 ? 'insufficient' : ''}>{air_essences}</span><span className="material-required">/ 10</span></div></div>,
                <div className="recipe-material" title={`${earth_essences} / 10 ${T.missions.rewards.earth_essences}`}><ElementIcon element="earth" /><div className="material-amount-wrapper"><span className={earth_essences < 10 ? 'insufficient' : ''}>{earth_essences}</span><span className="material-required">/ 10</span></div></div>,
            );
            result = (
                <div className="recipe-result">
                    <EssenceIcon />
                    <span className="primary-accent-text">{transcendental_essences}</span>
                </div>
            );
            canConvert = fire_essences >= 10 && water_essences >= 10 && air_essences >= 10 && earth_essences >= 10;
            // FIX: convertElementalToTranscendental is a method on gachaStore.
            conversionFunction = () => gachaStore.convertElementalToTranscendental();
            break;
    }

    return (
        <div className={`crafting-card from-${type.split('_')[0].toLowerCase()}`}>
            <div className="crafting-card-header">
                <h3 className={type === 'Elemental_to_Transcendental' ? 'elemental-conversion-rule' : ''}>
                    {headerTitle}
                </h3>
                {type === 'Elemental_to_Transcendental' && <p>{T_gallery.conversionRuleElemental}</p>}
                <span>{T_gallery.convertTitle}</span>
            </div>
            <div className="crafting-recipe">
                <div className="recipe-materials">
                    {materials}
                </div>
                <div className="recipe-arrow">→</div>
                {result}
            </div>
            <button onClick={conversionFunction} disabled={!canConvert}>
                {T_gallery.convertButton}
            </button>
        </div>
    );
});