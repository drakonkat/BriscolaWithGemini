import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { CraftingCard } from './CraftingCard';
import type { Language } from '../../core/types';

interface CraftingTabContentProps {
    language: Language;
}

export const CraftingTabContent: React.FC<CraftingTabContentProps> = observer(({ language }) => {
    const { gachaStore } = useStores();
    const { r_shards, sr_shards, ssr_shards, transcendental_essences, craftKey } = gachaStore;

    return (
        <div className="crafting-tab-content">
            <div className="crafting-grid">
                <CraftingCard
                    language={language}
                    rarity="R"
                    r_shards={r_shards}
                    sr_shards={sr_shards}
                    ssr_shards={ssr_shards}
                    transcendental_essences={transcendental_essences}
                    onCraft={craftKey}
                />
                <CraftingCard
                    language={language}
                    rarity="SR"
                    r_shards={r_shards}
                    sr_shards={sr_shards}
                    ssr_shards={ssr_shards}
                    transcendental_essences={transcendental_essences}
                    onCraft={craftKey}
                />
                <CraftingCard
                    language={language}
                    rarity="SSR"
                    r_shards={r_shards}
                    sr_shards={sr_shards}
                    ssr_shards={ssr_shards}
                    transcendental_essences={transcendental_essences}
                    onCraft={craftKey}
                />
            </div>
        </div>
    );
});
