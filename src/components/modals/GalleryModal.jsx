/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useStores} from '../../stores';
import {translations} from '../../core/translations';
import {GachaUnlockAnimation} from '../../assets/animations/GachaUnlockAnimation.jsx';
import {GachaRollingAnimation} from '../../assets/animations/GachaRollingAnimation.jsx';
import {GalleryTabContent} from "@/src/components/modals/GalleryTabContent.jsx";
import {CraftingTabContent} from "@/src/components/modals/CraftingTabContent.jsx";
import {GalleryModalHeader} from "@/src/components/modals/GalleryModalHeader.jsx";
import {ConvertTabContent} from "@/src/components/modals/ConvertTabContent.jsx";

const EssenceIcon = ({type = 'transcendental'}) => (
    <svg className="essence-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 8.5L12 22L22 8.5L12 2Z"/>
    </svg>
);


const GalleryModal = observer(({
                                   isOpen,
                                   onClose,
                                   language,
                                   backgrounds,
                                   unlockedBackgrounds,
                                   waifuCoins,
                                   onGachaRoll,
                                   onGachaMultiRoll,
                                   hasRolledGacha,
                                   isRolling,
                                   gachaAnimationState,
                                   onAnimationEnd,
                                   onImageSelect,
                                   isNsfwEnabled
                               }) => {
    const {gachaStore} = useStores();
    const [activeTab, setActiveTab] = useState('gallery');
    const [selectedPack, setSelectedPack] = useState('Base Pack');

    useEffect(() => {
        if (isOpen && !isNsfwEnabled) {
            onClose();
        }
    }, [isOpen, isNsfwEnabled, onClose]);

    if (!isOpen || !isNsfwEnabled) {
        return null;
    }

    const T = translations[language];
    const T_gallery = T.gallery;
    const packs = [
        {
            name: "Base Pack",
            icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"
                       fill="currentColor">
                <path d="M0 0h24v24H0V0z" fill="none"/>
                <path
                    d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>,
            backgrounds: backgrounds
        }
    ];
    const GACHA_COST = 100;
    const GACHA_COST_X10 = 900;
    const isFirstRoll = !hasRolledGacha;
    const allUnlocked = unlockedBackgrounds.length >= backgrounds.length;
    const canAfford = waifuCoins >= GACHA_COST;
    const canAffordX10 = waifuCoins >= GACHA_COST_X10;
    const buttonText = isFirstRoll ? T_gallery.gachaButtonFree : T_gallery.gachaButton(GACHA_COST);

    const canCraftR = gachaStore.r_shards >= 10;
    const canCraftSR = gachaStore.sr_shards >= 10 && gachaStore.r_shards >= 25 && gachaStore.transcendental_essences >= 5;
    const canCraftSSR = gachaStore.ssr_shards >= 5 && gachaStore.sr_shards >= 15 && gachaStore.transcendental_essences >= 10;

    const canConvertRtoSR = gachaStore.r_shards >= 10;
    const canConvertSRtoSSR = gachaStore.sr_shards >= 10;
    const canConvertElemental = gachaStore.fire_essences >= 1 && gachaStore.water_essences >= 1 && gachaStore.air_essences >= 1 && gachaStore.earth_essences >= 1;


    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
                <GalleryModalHeader onClose={onClose} closeLabel={T.close}/>
                {isRolling && !gachaAnimationState.active && <GachaRollingAnimation/>}
                {gachaAnimationState.active && gachaAnimationState.rarity && (
                    <GachaUnlockAnimation
                        rarity={gachaAnimationState.rarity}
                        onAnimationEnd={onAnimationEnd}
                    />
                )}

                <div className="gallery-tabs" data-tutorial-id="gallery-tabs">
                    <button className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
                            onClick={() => setActiveTab('gallery')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"
                             fill="currentColor">
                            <path d="M0 0h24v24H0V0z" fill="none"/>
                            <path
                                d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                        <span>{T_gallery.promoButton}</span>
                    </button>
                    <button className={`tab-button ${activeTab === 'crafting' ? 'active' : ''}`}
                            onClick={() => setActiveTab('crafting')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"
                             fill="currentColor">
                            <g>
                                <rect fill="none" height="24" width="24"/>
                                <path
                                    d="M12,2c-5.52,0-10,4.48-10,10s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8 s8,3.59,8,8S16.41,20,12,20z M14.3,13.88L12,15.4V6.5c0-0.28-0.22-0.5-0.5-0.5h-2c-0.28,0-0.5,0.22-0.5,0.5V10H8v1.5h1V15l-3.5-2.8v1.61 l3.5,2.8v1.89h1v-1.89l5-4v-1.61L14.3,13.88z"/>
                            </g>
                        </svg>
                        <span>{T_gallery.craftingTitle}</span>
                    </button>
                    <button className={`tab-button ${activeTab === 'convert' ? 'active' : ''}`}
                            onClick={() => setActiveTab('convert')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"
                             fill="currentColor">
                            <path d="M0 0h24v24H0V0z" fill="none"/>
                            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
                        </svg>
                        <span>{T_gallery.convertTitle}</span>
                    </button>
                </div>

                <div className="gallery-content">
                    {activeTab === 'gallery' && (
                        <GalleryTabContent
                            packs={packs}
                            selectedPack={selectedPack}
                            setSelectedPack={setSelectedPack}
                            T_gallery={T_gallery}
                            GACHA_COST={GACHA_COST}
                            GACHA_COST_X10={GACHA_COST_X10}
                            isFirstRoll={isFirstRoll}
                            allUnlocked={allUnlocked}
                            canAfford={canAfford}
                            canAffordX10={canAffordX10}
                            isRolling={isRolling}
                            onGachaRoll={onGachaRoll}
                            onGachaMultiRoll={onGachaMultiRoll}
                            backgrounds={backgrounds}
                            unlockedBackgrounds={unlockedBackgrounds}
                            onImageSelect={onImageSelect}
                        />
                    )}
                    {activeTab === 'crafting' && (
                        <CraftingTabContent
                            {...{
                                T_gallery,
                                gachaStore,
                                canCraftR,
                                canCraftSR,
                                canCraftSSR,
                                language
                            }}
                        />
                    )}
                    {activeTab === 'convert' && (
                        <ConvertTabContent
                            {...{
                                T_gallery,
                                gachaStore,
                                canConvertRtoSR,
                                canConvertSRtoSSR,
                                canConvertElemental,
                                language
                            }}/>

                    )}
                </div>
            </div>
        </div>
    );
});
export default GalleryModal
