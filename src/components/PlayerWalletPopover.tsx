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
import { CloseIcon } from './icons/CloseIcon';
import { ShardIcon } from './icons/ShardIcon';
import { KeyIcon } from './icons/KeyIcon';
import { WaifuCoinIcon } from './icons/WaifuCoinIcon';

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
                    <CloseIcon />
                </button>
            </div>
            
            <div className="wallet-categories">
                {/* Shards */}
                <div className="wallet-category">
                    <button className="category-header" aria-expanded={expandedCategories.shards}>
                        <ShardIcon className="shard-icon-svg" />
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
                        <KeyIcon className="key-icon-svg" />
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
                            {/* FIX: Access the correct translation key for essenceAir */}
                            <span>{T_wallet.essenceAir}</span>
                            <strong>{air_essences}</strong>
                        </div>
                        <div className="wallet-detail-item element-earth">
                            {/* FIX: Access the correct translation key for essenceEarth */}
                            <span>{T_wallet.essenceEarth}</span>
                            <strong>{earth_essences}</strong>
                        </div>
                        <div className="wallet-detail-item transcendental">
                            {/* FIX: Access the correct translation key for essenceTranscendental */}
                            <span>{T_wallet.essenceTranscendental}</span>
                            <strong>{transcendental_essences}</strong>
                        </div>
                    </div>
                </div>
            </div>
            {/* Display Waifu Coins below categories for now as the currency category has been removed */}
            <div className="wallet-summary-currency">
                 <WaifuCoinIcon />
                 <strong>{waifuCoins}</strong>
            </div>
        </div>
    );
});