/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ConvertCard } from './ConvertCard';
import { ElementIcon } from '../../assets/icons/element/ElementIcon.jsx';
import {translations} from "@/src/core/translations.js";
import {EssenceTranscendentalIcon} from "@/src/assets/icons/element/EssenceTranscendentalIcon.jsx";



export const ConvertTabContent = ({
    T_gallery,
    gachaStore,
    canConvertRtoSR,
    canConvertSRtoSSR,
    canConvertElemental,
                                      language
}) => {
    const T = translations[language];
    return (
        <div className="crafting-tab-content">
            <div className="crafting-grid">
                <ConvertCard
                    rarity="from-r"
                    title={<>10 <span className="rarity-r">R</span> → 1 <span className="rarity-sr">SR</span></>}
                    shardType="r"
                    gachaStore={gachaStore}
                    T_gallery={T_gallery}
                    onConvert={() => gachaStore.convertShards('R', 'SR')}
                    canConvert={canConvertRtoSR}
                    convertButtonText={T_gallery.convertButton}
                />
                <ConvertCard
                    rarity="from-sr"
                    title={<>10 <span className="rarity-sr">SR</span> → 1 <span className="rarity-ssr">SSR</span></>}
                    shardType="sr"
                    gachaStore={gachaStore}
                    T_gallery={T_gallery}
                    onConvert={() => gachaStore.convertShards('SR', 'SSR')}
                    canConvert={canConvertSRtoSSR}
                    convertButtonText={T_gallery.convertButton}
                />
                <ConvertCard
                    rarity="from-elemental"
                    title={
                        <>
                            10x<ElementIcon element="fire"/>,&nbsp;
                            10x<ElementIcon element="water"/>,&nbsp;
                            10x<ElementIcon element="air"/>,&nbsp;
                            10x<ElementIcon element="earth"/>
                            &nbsp;→&nbsp;
                            1x<EssenceTranscendentalIcon/>
                        </>
                    }
                    materials={[
                        {
                            icon: <ElementIcon element="fire"/>,
                            amount: gachaStore.fire_essences,
                            required: 10,
                            insufficient: gachaStore.fire_essences < 10,
                            title: `${gachaStore.fire_essences} / 10 ${T.missions.rewards.fire_essences}`
                        },
                        {
                            icon: <ElementIcon element="water"/>,
                            amount: gachaStore.water_essences,
                            required: 10,
                            insufficient: gachaStore.water_essences < 10,
                            title: `${gachaStore.water_essences} / 10 ${T.missions.rewards.water_essences}`
                        },
                        {
                            icon: <ElementIcon element="air"/>,
                            amount: gachaStore.air_essences,
                            required: 10,
                            insufficient: gachaStore.air_essences < 10,
                            title: `${gachaStore.air_essences} / 10 ${T.missions.rewards.air_essences}`
                        },
                        {
                            icon: <ElementIcon element="earth"/>,
                            amount: gachaStore.earth_essences,
                            required: 10,
                            insufficient: gachaStore.earth_essences < 10,
                            title: `${gachaStore.earth_essences} / 10 ${T.missions.rewards.earth_essences}`
                        }
                    ]}
                    result={{
                        icon: <EssenceTranscendentalIcon/>,
                        amount: gachaStore.transcendental_essences
                    }}
                    gachaStore={gachaStore}
                    T_gallery={T_gallery}
                    onConvert={gachaStore.convertElementalToTranscendental}
                    canConvert={canConvertElemental}
                    convertButtonText={T_gallery.convertButton}
                />
            </div>
        </div>
    )
};