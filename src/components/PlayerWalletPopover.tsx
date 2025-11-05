/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { ElementIcon } from './ElementIcon';
import { EssenceIcon } from './EssenceIcon';
import type { Language } from '../core/types';

interface PlayerWalletPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

export const PlayerWalletPopover = observer(({ isOpen, onClose, language }: PlayerWalletPopoverProps) => {
    const { gachaStore } = useStores();
    const { waifuCoins, r_shards, sr_shards, ssr_shards, r_keys, sr_keys, ssr_keys, fire_essences, water_essences, air_essences, earth_essences, transcendental_essences } = gachaStore;
    const T = translations[language];
    const T_wallet = T.playerWallet;

    // All categories are always expanded as per the screenshot
    const expandedCategories = {
        shards: true,
        keys: true,
        essences: true,
    };

    const popoverRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <div ref={popoverRef} className={`player-wallet-popover ${isOpen ? 'open' : ''}`}>
            <div className="popover-header">
                <h2>{T_wallet.title}</h2>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
            
            <div className="wallet-categories">
                {/* Shards */}
                <div className="wallet-category">
                    <button className="category-header" aria-expanded={expandedCategories.shards}>
                        <svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/></svg>
                        <h3>{T_wallet.shards}</h3>
                        {/* Removed collapse icon */}
                    </button>
                    <div className={`category-content ${expandedCategories.shards ? 'open' : ''}`}>
                        <div className="wallet-detail-item rarity-r">
                            <span>{T_wallet.shardR}</span>
                            <strong>{r_shards}</strong>
                        </div>
                        <div className="wallet-detail-item rarity-sr">
                            <span>{T_wallet.shardSR}</span>
                            <strong>{sr_shards}</strong>
                        </div>
                        <div className="wallet-detail-item rarity-ssr">
                            <span>{T_wallet.shardSSR}</span>
                            <strong>{ssr_shards}</strong>
                        </div>
                    </div>
                </div>

                {/* Keys */}
                <div className="wallet-category">
                    <button className="category-header" aria-expanded={expandedCategories.keys}>
                        <svg className="key-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14.5,4A5.5,5.5,0,1,0,20,9.5,5.5,5.5,0,0,0,14.5,4ZM11,9.5a3.5,3.5,0,1,1,3.5,3.5A3.5,3.5,0,0,1,11,9.5ZM10,12,2,20v2H4l8-8V12Zm2-4H2v2H12V8Z"/></svg>
                        <h3>{T_wallet.keys}</h3>
                        {/* Removed collapse icon */}
                    </button>
                    <div className={`category-content ${expandedCategories.keys ? 'open' : ''}`}>
                        <div className="wallet-detail-item rarity-r">
                            <span>{T_wallet.keyR}</span>
                            <strong>{r_keys}</strong>
                        </div>
                        <div className="wallet-detail-item rarity-sr">
                            <span>{T_wallet.keySR}</span>
                            <strong>{sr_keys}</strong>
                        </div>
                        <div className="wallet-detail-item rarity-ssr">
                            <span>{T_wallet.keySSR}</span>
                            <strong>{ssr_keys}</strong>
                        </div>
                    </div>
                </div>

                {/* Essences */}
                <div className="wallet-category">
                    <button className="category-header" aria-expanded={expandedCategories.essences}>
                        <EssenceIcon />
                        <h3>{T_wallet.essences}</h3>
                        {/* Removed collapse icon */}
                    </button>
                    <div className={`category-content ${expandedCategories.essences ? 'open' : ''}`}>
                        <div className="wallet-detail-item element-fire">
                            <span>{T_wallet.essenceFire}</span>
                            <strong>{fire_essences}</strong>
                        </div>
                        <div className="wallet-detail-item element-water">
                            <span>{T_wallet.essenceWater}</span>
                            <strong>{water_essences}</strong>
                        </div>
                        <div className="wallet-detail-item element-air">
                            <span>{T_wallet.essenceAir}</span>
                            <strong>{air_essences}</strong>
                        </div>
                        <div className="wallet-detail-item element-earth">
                            <span>{T_wallet.essenceEarth}</span>
                            <strong>{earth_essences}</strong>
                        </div>
                        <div className="wallet-detail-item transcendental">
                            <span>{T_wallet.essenceTranscendental}</span>
                            <strong>{transcendental_essences}</strong>
                        </div>
                    </div>
                </div>
            </div>
            {/* Display Waifu Coins below categories for now as the currency category has been removed */}
            <div className="wallet-summary-currency">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 16.5v-1c0-.83.67-1.5 1.5-1.5H12v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5H12V7h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1H9z"/></svg>
                 <strong>{waifuCoins}</strong>
            </div>
        </div>
    );
});