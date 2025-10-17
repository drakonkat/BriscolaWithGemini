/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect } from 'react';

const PARTICLE_COUNTS = { R: 25, SR: 40, SSR: 60 };
const ANIMATION_DURATION = { R: 2000, SR: 2500, SSR: 3000 };

export const GachaUnlockAnimation = ({ rarity, onAnimationEnd }) => {
    useEffect(() => {
        const timer = setTimeout(onAnimationEnd, ANIMATION_DURATION[rarity]);
        return () => clearTimeout(timer);
    }, [rarity, onAnimationEnd]);

    const particleCount = PARTICLE_COUNTS[rarity];

    return (
        <div className={`gacha-unlock-overlay rarity-${rarity.toLowerCase()}`}>
            {(rarity === 'SR' || rarity === 'SSR') && <div className="flash" />}
            {[...Array(particleCount)].map((_, i) => (
                <div key={i} className="particle" style={{
                    '--i': i,
                    '--angle': `${(360 / particleCount) * i}deg`,
                    '--distance': `${Math.random() * 40 + 60}vmax`,
                    '--delay': `${Math.random() * 0.5}s`,
                }} />
            ))}
        </div>
    );
};