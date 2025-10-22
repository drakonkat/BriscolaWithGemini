/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {CraftingCard} from './CraftingCard';
import {translations} from "@/src/core/translations.js";
import {RareKey} from "@/src/assets/icons/keys/RareKey.jsx";
import {RareShard} from "@/src/assets/icons/shards/RareShard.jsx";
import {SuperRareShard} from "@/src/assets/icons/shards/SuperRareShard.jsx";
import {SuperSuperRareShard} from "@/src/assets/icons/shards/SuperSuperRareShard.jsx";
import {SuperSuperRareKey} from "@/src/assets/icons/keys/SuperSuperRareKey.jsx";
import {SuperRareKey} from "@/src/assets/icons/keys/SuperRareKey.jsx";

const EssenceIcon = ({type = 'transcendental'}) => (
    <svg className="essence-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 8.5L12 22L22 8.5L12 2Z"/>
    </svg>
);



export const CraftingTabContent = ({
                                       T_gallery,
                                       gachaStore,
                                       canCraftR,
                                       canCraftSR,
                                       canCraftSSR,
                                       language
                                   }) => {

    const T = translations[language];
    return <div className="crafting-tab-content">
        <div className="crafting-grid">
            <CraftingCard
                rarity="r"
                title={T_gallery.keyNameR}
                materials={[
                    {
                        icon: <RareShard/>,
                        amount: gachaStore.r_shards,
                        required: 10,
                        insufficient: gachaStore.r_shards < 10,
                        title: `${gachaStore.r_shards} / 10 ${T_gallery.shardLabelR(10).replace(/\d+\s/, '')}`
                    }
                ]}
                result={{
                    icon: <RareKey {...{T_gallery}}/>,
                    amount: 1
                }}
                onCraft={() => gachaStore.craftKey('R')}
                canCraft={canCraftR}
                craftButtonText={T_gallery.craftButton(1)}
            />
            <CraftingCard
                rarity="sr"
                title={T_gallery.keyNameSR}
                materials={[
                    {
                        icon: <SuperRareShard/>,
                        amount: gachaStore.sr_shards,
                        required: 10,
                        insufficient: gachaStore.sr_shards < 10,
                        title: `${gachaStore.sr_shards} / 10 ${T_gallery.shardLabelSR(10).replace(/\d+\s/, '')}`
                    },
                    {
                        icon: <RareShard/>,
                        amount: gachaStore.r_shards,
                        required: 25,
                        insufficient: gachaStore.r_shards < 25,
                        title: `${gachaStore.r_shards} / 25 ${T_gallery.shardLabelR(25).replace(/\d+\s/, '')}`
                    },
                    {
                        icon: <EssenceIcon/>,
                        amount: gachaStore.transcendental_essences,
                        required: 5,
                        insufficient: gachaStore.transcendental_essences < 5,
                        title: `${gachaStore.transcendental_essences} / 5 ${T.missions.rewards.transcendental_essences}`
                    }
                ]}
                result={{
                    icon: <SuperRareKey {...{T_gallery}}/>,
                    amount: 1
                }}
                onCraft={() => gachaStore.craftKey('SR')}
                canCraft={canCraftSR}
                craftButtonText={T_gallery.craftButton(1)}
            />
            <CraftingCard
                rarity="ssr"
                title={T_gallery.keyNameSSR}
                materials={[
                    {
                        icon: <SuperSuperRareShard/>,
                        amount: gachaStore.ssr_shards,
                        required: 5,
                        insufficient: gachaStore.ssr_shards < 5,
                        title: `${gachaStore.ssr_shards} / 5 ${T_gallery.shardLabelSSR(5).replace(/\d+\s/, '')}`
                    },
                    {
                        icon: <SuperRareShard/>,
                        amount: gachaStore.sr_shards,
                        required: 15,
                        insufficient: gachaStore.sr_shards < 15,
                        title: `${gachaStore.sr_shards} / 15 ${T_gallery.shardLabelSR(15).replace(/\d+\s/, '')}`
                    },
                    {
                        icon: <EssenceIcon/>,
                        amount: gachaStore.transcendental_essences,
                        required: 10,
                        insufficient: gachaStore.transcendental_essences < 10,
                        title: `${gachaStore.transcendental_essences} / 10 ${T.missions.rewards.transcendental_essences}`
                    }
                ]}
                result={{
                    icon: <SuperSuperRareKey {...{T_gallery}}/>,
                    amount: 1
                }}
                onCraft={() => gachaStore.craftKey('SSR')}
                canCraft={canCraftSSR}
                craftButtonText={T_gallery.craftButton(1)}
            />
        </div>
    </div>
}
