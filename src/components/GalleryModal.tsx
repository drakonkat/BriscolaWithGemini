/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import type { Language } from '../core/types';
import { CachedImage } from './CachedImage';
import { GachaUnlockAnimation } from './GachaUnlockAnimation';
import { GachaRollingAnimation } from './GachaRollingAnimation';
import { ElementIcon } from './ElementIcon';

type BackgroundItem = {
    url: string;
    rarity: 'R' | 'SR' | 'SSR';
};

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    backgrounds: BackgroundItem[];
    unlockedBackgrounds: string[];
    waifuCoins: number;
    onGachaRoll: () => void;
    onGachaMultiRoll: () => void;
    hasRolledGacha: boolean;
    isRolling: boolean;
    gachaAnimationState: { active: boolean; rarity: 'R' | 'SR' | 'SSR' | null };
    onAnimationEnd: () => void;
    onImageSelect: (url: string) => void;
    isNsfwEnabled: boolean;
}

const EssenceIcon = ({ type = 'transcendental' }: { type?: 'transcendental' | 'elemental' }) => (
    <svg className="essence-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 8.5L12 22L22 8.5L12 2Z" />
    </svg>
);


export const GalleryModal = observer(({ isOpen, onClose, language, backgrounds, unlockedBackgrounds, waifuCoins, onGachaRoll, onGachaMultiRoll, hasRolledGacha, isRolling, gachaAnimationState, onAnimationEnd, onImageSelect, isNsfwEnabled }: GalleryModalProps) => {
    const { gachaStore } = useStores();
    const [activeTab, setActiveTab] = useState<'gallery' | 'crafting' | 'convert'>('gallery');
    
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
                <button className="modal-close-button" onClick={onClose} aria-label={T.close} data-tutorial-id="gallery-close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                {isRolling && !gachaAnimationState.active && <GachaRollingAnimation />}
                {gachaAnimationState.active && gachaAnimationState.rarity && (
                    <GachaUnlockAnimation 
                        rarity={gachaAnimationState.rarity}
                        onAnimationEnd={onAnimationEnd}
                    />
                )}
                
                <div className="gallery-tabs" data-tutorial-id="gallery-tabs">
                    <button className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                        <span>{T_gallery.promoButton}</span>
                    </button>
                    <button className={`tab-button ${activeTab === 'crafting' ? 'active' : ''}`} onClick={() => setActiveTab('crafting')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><g><rect fill="none" height="24" width="24"/><path d="M12,2c-5.52,0-10,4.48-10,10s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8 s8,3.59,8,8S16.41,20,12,20z M14.3,13.88L12,15.4V6.5c0-0.28-0.22-0.5-0.5-0.5h-2c-0.28,0-0.5,0.22-0.5,0.5V10H8v1.5h1V15l-3.5-2.8v1.61 l3.5,2.8v1.89h1v-1.89l5-4v-1.61L14.3,13.88z"/></g></svg>
                        <span>{T_gallery.craftingTitle}</span>
                    </button>
                    <button className={`tab-button ${activeTab === 'convert' ? 'active' : ''}`} onClick={() => setActiveTab('convert')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>
                        <span>{T_gallery.convertTitle}</span>
                    </button>
                </div>

                <div className="gallery-content">
                    {activeTab === 'gallery' && (
                        <div className="gallery-tab-content">
                            <div className="gacha-controls" data-tutorial-id="gacha-controls">
                                <button onClick={onGachaRoll} disabled={allUnlocked || (!isFirstRoll && !canAfford) || isRolling}>
                                    {buttonText}
                                </button>
                                <button onClick={onGachaMultiRoll} disabled={allUnlocked || isFirstRoll || !canAffordX10 || isRolling}>
                                    {T_gallery.gachaButtonX10(GACHA_COST_X10)}
                                </button>
                            </div>
                            <div className="gallery-grid">
                                {backgrounds.map((item, index) => {
                                    const isUnlocked = unlockedBackgrounds.includes(item.url);
                                    const rarityClass = `rarity-${item.rarity.toLowerCase()}`;

                                    return (
                                        <div 
                                            key={index} 
                                            className={`gallery-item ${isUnlocked ? '' : 'locked'} ${rarityClass}`} 
                                            onClick={isUnlocked ? () => onImageSelect(item.url) : undefined}
                                            onKeyDown={isUnlocked ? (e) => (e.key === 'Enter' || e.key === ' ') && onImageSelect(item.url) : undefined}
                                            role={isUnlocked ? 'button' : 'img'}
                                            tabIndex={isUnlocked ? 0 : -1}
                                            aria-label={isUnlocked ? `${T_gallery.backgroundAlt} ${index + 1} (${item.rarity}). ${T_gallery.fullscreenView}` : `${T_gallery.locked} (${item.rarity})`}
                                        >
                                            {isUnlocked ? (
                                                <CachedImage imageUrl={item.url} alt={`${T_gallery.backgroundAlt} ${index + 1}`} loading="lazy" />
                                            ) : (
                                                <div className="locked-overlay">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {activeTab === 'crafting' && (
                        <div className="crafting-tab-content">
                            <div className="crafting-grid">
                                <div className="crafting-card rarity-r">
                                    <div className="crafting-card-header">
                                        <h3>{T_gallery.keyNameR}</h3>
                                    </div>
                                    <div className="crafting-recipe">
                                        <div className="recipe-materials">
                                            <div className="recipe-material" title={`${gachaStore.r_shards} / 10 ${T_gallery.shardLabelR(10).replace(/\d+\s/, '')}`}>
                                                <span className="shard-item r"><svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg></span>
                                                <div className="material-amount-wrapper">
                                                    <span className={`material-amount ${gachaStore.r_shards < 10 ? 'insufficient' : ''}`}>{gachaStore.r_shards}</span>
                                                    <span className="material-required">/ 10</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="recipe-arrow">→</div>
                                        <div className="recipe-result">
                                            <span className="key-item r" title={T_gallery.keyNameR}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M14.5,4A5.5,5.5,0,1,0,20,9.5,5.5,5.5,0,0,0,14.5,4ZM11,9.5a3.5,3.5,0,1,1,3.5,3.5A3.5,3.5,0,0,1,11,9.5ZM10,12,2,20v2H4l8-8V12Zm2-4H2v2H12V8Z"/></svg>
                                            </span>
                                            <span>1</span>
                                        </div>
                                    </div>
                                    <button onClick={() => gachaStore.craftKey('R')} disabled={!canCraftR}>
                                        {T_gallery.craftButton(1)}
                                    </button>
                                </div>
                                <div className="crafting-card rarity-sr">
                                    <div className="crafting-card-header">
                                        <h3>{T_gallery.keyNameSR}</h3>
                                    </div>
                                    <div className="crafting-recipe">
                                        <div className="recipe-materials">
                                            <div className="recipe-material" title={`${gachaStore.sr_shards} / 10 ${T_gallery.shardLabelSR(10).replace(/\d+\s/, '')}`}>
                                                <span className="shard-item sr"><svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg></span>
                                                <div className="material-amount-wrapper">
                                                    <span className={`material-amount ${gachaStore.sr_shards < 10 ? 'insufficient' : ''}`}>{gachaStore.sr_shards}</span>
                                                    <span className="material-required">/ 10</span>
                                                </div>
                                            </div>
                                            <div className="recipe-separator">+</div>
                                            <div className="recipe-material" title={`${gachaStore.r_shards} / 25 ${T_gallery.shardLabelR(25).replace(/\d+\s/, '')}`}>
                                                <span className="shard-item r"><svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg></span>
                                                <div className="material-amount-wrapper">
                                                    <span className={`material-amount ${gachaStore.r_shards < 25 ? 'insufficient' : ''}`}>{gachaStore.r_shards}</span>
                                                    <span className="material-required">/ 25</span>
                                                </div>
                                            </div>
                                            <div className="recipe-separator">+</div>
                                            <div className="recipe-material" title={`${gachaStore.transcendental_essences} / 5 ${T.missions.rewards.transcendental_essences}`}>
                                                <EssenceIcon />
                                                <div className="material-amount-wrapper">
                                                    <span className={`material-amount ${gachaStore.transcendental_essences < 5 ? 'insufficient' : ''}`}>{gachaStore.transcendental_essences}</span>
                                                    <span className="material-required">/ 5</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="recipe-arrow">→</div>
                                        <div className="recipe-result">
                                            <span className="key-item sr" title={T_gallery.keyNameSR}><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M14.5,4A5.5,5.5,0,1,0,20,9.5,5.5,5.5,0,0,0,14.5,4ZM11,9.5a3.5,3.5,0,1,1,3.5,3.5A3.5,3.5,0,0,1,11,9.5ZM10,12,2,20v2H4l8-8V12Zm2-4H2v2H12V8Z"/></svg></span>
                                            <span>1</span>
                                        </div>
                                    </div>
                                    <button onClick={() => gachaStore.craftKey('SR')} disabled={!canCraftSR}>
                                        {T_gallery.craftButton(1)}
                                    </button>
                                </div>
                                <div className="crafting-card rarity-ssr">
                                    <div className="crafting-card-header">
                                        <h3>{T_gallery.keyNameSSR}</h3>
                                    </div>
                                    <div className="crafting-recipe">
                                        <div className="recipe-materials">
                                            <div className="recipe-material" title={`${gachaStore.ssr_shards} / 5 ${T_gallery.shardLabelSSR(5).replace(/\d+\s/, '')}`}>
                                                <span className="shard-item ssr"><svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg></span>
                                                <div className="material-amount-wrapper">
                                                    <span className={`material-amount ${gachaStore.ssr_shards < 5 ? 'insufficient' : ''}`}>{gachaStore.ssr_shards}</span>
                                                    <span className="material-required">/ 5</span>
                                                </div>
                                            </div>
                                            <div className="recipe-separator">+</div>
                                            <div className="recipe-material" title={`${gachaStore.sr_shards} / 15 ${T_gallery.shardLabelSR(15).replace(/\d+\s/, '')}`}>
                                                <span className="shard-item sr"><svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg></span>
                                                <div className="material-amount-wrapper">
                                                    <span className={`material-amount ${gachaStore.sr_shards < 15 ? 'insufficient' : ''}`}>{gachaStore.sr_shards}</span>
                                                    <span className="material-required">/ 15</span>
                                                </div>
                                            </div>
                                            <div className="recipe-separator">+</div>
                                            <div className="recipe-material" title={`${gachaStore.transcendental_essences} / 10 ${T.missions.rewards.transcendental_essences}`}>
                                                <EssenceIcon />
                                                <div className="material-amount-wrapper">
                                                    <span className={`material-amount ${gachaStore.transcendental_essences < 10 ? 'insufficient' : ''}`}>{gachaStore.transcendental_essences}</span>
                                                    <span className="material-required">/ 10</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="recipe-arrow">→</div>
                                        <div className="recipe-result">
                                            <span className="key-item ssr" title={T_gallery.keyNameSSR}><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M14.5,4A5.5,5.5,0,1,0,20,9.5,5.5,5.5,0,0,0,14.5,4ZM11,9.5a3.5,3.5,0,1,1,3.5,3.5A3.5,3.5,0,0,1,11,9.5ZM10,12,2,20v2H4l8-8V12Zm2-4H2v2H12V8Z"/></svg></span>
                                            <span>1</span>
                                        </div>
                                    </div>
                                    <button onClick={() => gachaStore.craftKey('SSR')} disabled={!canCraftSSR}>
                                        {T_gallery.craftButton(1)}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'convert' && (
                        <div className="crafting-tab-content">
                             <div className="crafting-grid">
                                <div className="crafting-card from-r">
                                    <div className="crafting-card-header">
                                        <h3>10 <span className="rarity-r">R</span> → 1 <span className="rarity-sr">SR</span></h3>
                                    </div>
                                    <div className="crafting-shard-info">
                                        <span>{T_gallery.shardLabelR(gachaStore.r_shards)}</span>
                                    </div>
                                    <button onClick={() => gachaStore.convertShards('R', 'SR')} disabled={!canConvertRtoSR}>
                                        {T_gallery.convertButton}
                                    </button>
                                </div>
                                <div className="crafting-card from-sr">
                                    <div className="crafting-card-header">
                                        <h3>10 <span className="rarity-sr">SR</span> → 1 <span className="rarity-ssr">SSR</span></h3>
                                    </div>
                                    <div className="crafting-shard-info">
                                        <span>{T_gallery.shardLabelSR(gachaStore.sr_shards)}</span>
                                    </div>
                                    <button onClick={() => gachaStore.convertShards('SR', 'SSR')} disabled={!canConvertSRtoSSR}>
                                        {T_gallery.convertButton}
                                    </button>
                                </div>
                                <div className="crafting-card from-elemental">
                                    <div className="crafting-card-header">
                                        <h3 className="elemental-conversion-rule">
                                            1x<ElementIcon element="fire" />,&nbsp;
                                            1x<ElementIcon element="water" />,&nbsp;
                                            1x<ElementIcon element="air" />,&nbsp;
                                            1x<ElementIcon element="earth" />
                                            &nbsp;→&nbsp;
                                            1x<EssenceIcon />
                                        </h3>
                                        <span>{T_gallery.convertEssencesTitle}</span>
                                    </div>
                                    <div className="crafting-recipe">
                                        <div className="recipe-materials">
                                            <div className="recipe-material" title={T.missions.rewards.fire_essences}><ElementIcon element="fire" /><span className={gachaStore.fire_essences < 1 ? 'insufficient' : ''}>{gachaStore.fire_essences}</span></div>
                                            <div className="recipe-material" title={T.missions.rewards.water_essences}><ElementIcon element="water" /><span className={gachaStore.water_essences < 1 ? 'insufficient' : ''}>{gachaStore.water_essences}</span></div>
                                            <div className="recipe-material" title={T.missions.rewards.air_essences}><ElementIcon element="air" /><span className={gachaStore.air_essences < 1 ? 'insufficient' : ''}>{gachaStore.air_essences}</span></div>
                                            <div className="recipe-material" title={T.missions.rewards.earth_essences}><ElementIcon element="earth" /><span className={gachaStore.earth_essences < 1 ? 'insufficient' : ''}>{gachaStore.earth_essences}</span></div>
                                        </div>
                                        <div className="recipe-arrow">→</div>
                                        <div className="recipe-result">
                                            <EssenceIcon />
                                            <span>{gachaStore.transcendental_essences}</span>
                                        </div>
                                    </div>
                                    <button onClick={gachaStore.convertElementalToTranscendental} disabled={!canConvertElemental}>
                                        {T_gallery.convertButton}
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});