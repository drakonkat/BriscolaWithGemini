/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { DungeonModifier } from './types';

// This file provides the base definitions. The translated names/descriptions
// are applied in the DungeonModeStore.
export const DUNGEON_MODIFIERS: Pick<DungeonModifier, 'id'>[] = [
    { id: 'NONE' },
    { id: 'BRISCOLA_CHAOS' },
    { id: 'GHOST_HAND' },
    { id: 'ELEMENTAL_FURY' },
    { id: 'VALUE_INVERSION' },
];
