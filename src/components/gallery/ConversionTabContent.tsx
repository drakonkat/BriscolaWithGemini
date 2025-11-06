import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { ConversionCard } from './ConversionCard';
import type { Language } from '../../core/types';

interface ConversionTabContentProps {
    language: Language;
}

export const ConversionTabContent: React.FC<ConversionTabContentProps> = observer(({ language }) => {
    const { gachaStore } = useStores();
    const { r_shards, sr_shards, ssr_shards, fire_essences, water_essences, air_essences, earth_essences, transcendental_essences, convertShards, convertElementalToTranscendental } = gachaStore;

    return (
        <div className="crafting-tab-content">
            <div className="crafting-grid">
                <ConversionCard
                    language={language}
                    type="R_to_SR"
                    r_shards={r_shards}
                    sr_shards={sr_shards}
                    ssr_shards={ssr_shards} // Pass all to avoid prop drilling issues, even if not used by all types
                    fire_essences={fire_essences}
                    water_essences={water_essences}
                    air_essences={air_essences}
                    earth_essences={earth_essences}
                    transcendental_essences={transcendental_essences}
                    onConvert={() => convertShards('R', 'SR')}
                />
                <ConversionCard
                    language={language}
                    type="SR_to_SSR"
                    r_shards={r_shards}
                    sr_shards={sr_shards}
                    ssr_shards={ssr_shards}
                    fire_essences={fire_essences}
                    water_essences={water_essences}
                    air_essences={air_essences}
                    earth_essences={earth_essences}
                    transcendental_essences={transcendental_essences}
                    onConvert={() => convertShards('SR', 'SSR')}
                />
                <ConversionCard
                    language={language}
                    type="Elemental_to_Transcendental"
                    r_shards={r_shards}
                    sr_shards={sr_shards}
                    ssr_shards={ssr_shards}
                    fire_essences={fire_essences}
                    water_essences={water_essences}
                    air_essences={air_essences}
                    earth_essences={earth_essences}
                    transcendental_essences={transcendental_essences}
                    onConvert={convertElementalToTranscendental}
                />
            </div>
        </div>
    );
});
