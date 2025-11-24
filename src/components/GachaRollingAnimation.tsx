/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { WaifuCoinIcon } from './icons/WaifuCoinIcon';

export const GachaRollingAnimation = () => {
    return (
        <div className="gacha-rolling-overlay">
            <div className="gacha-coin">
                <WaifuCoinIcon />
            </div>
        </div>
    );
};