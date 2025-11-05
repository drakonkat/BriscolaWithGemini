/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

// This component is specifically for the 'transcendental' essence icon.
// Elemental essences use ElementIcon.
export const EssenceIcon: React.FC = () => {
    return (
        <svg className="essence-icon-svg" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 8.5L12 22L22 8.5L12 2Z" />
        </svg>
    );
};