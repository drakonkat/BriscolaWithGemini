/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

export const PackSelection = ({ packs, selectedPack, setSelectedPack }) => (
    <div className="pack-selection">
        {packs.map((pack, index) => (
            <div
                key={index}
                className={`pack-card ${selectedPack === pack.name ? 'selected' : ''}`}
                onClick={() => setSelectedPack(pack.name)}
            >
                {pack.icon}
                <span>{pack.name}</span>
            </div>
        ))}
    </div>
);