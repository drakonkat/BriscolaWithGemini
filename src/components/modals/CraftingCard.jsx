/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

const EssenceIcon = ({ type = 'transcendental' }) => (
    <svg className="essence-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 8.5L12 22L22 8.5L12 2Z" />
    </svg>
);

export const CraftingCard = ({
    rarity,
    title,
    materials,
    result,
    onCraft,
    canCraft,
    craftButtonText
}) => (
    <div className={`crafting-card rarity-${rarity}`}>
        <div className="crafting-card-header">
            <h3>{title}</h3>
        </div>
        <div className="crafting-recipe">
            <div className="recipe-materials">
                {materials.map((material, index) => (
                    <React.Fragment key={index}>
                        <div className="recipe-material" title={material.title}>
                            {material.icon}
                            <div className="material-amount-wrapper">
                                <span className={`material-amount ${material.insufficient ? 'insufficient' : ''}`}>
                                    {material.amount}
                                </span>
                                <span className="material-required">/ {material.required}</span>
                            </div>
                        </div>
                        {index < materials.length - 1 && <div className="recipe-separator">+</div>}
                    </React.Fragment>
                ))}
            </div>
            <div className="recipe-arrow">→</div>
            <div className="recipe-result">
                {result.icon}
                <span>{result.amount}</span>
            </div>
        </div>
        <button onClick={onCraft} disabled={!canCraft}>
            {craftButtonText}
        </button>
    </div>
);