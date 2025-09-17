/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { translations } from './translations';
import type { RoguelikePowerUpId, Language } from './types';

export const POWER_UP_DEFINITIONS: Record<RoguelikePowerUpId, {
    name: (lang: Language) => string;
    description: (lang: Language, level: number) => string;
    maxLevel: number;
}> = {
  'bonus_point_per_trick': { 
    // FIX: Corrected translation path
    name: (lang) => translations[lang].roguelike.powers.bonus_point_per_trick.name, 
    // FIX: Corrected translation path
    description: (lang, level) => translations[lang].roguelike.powers.bonus_point_per_trick.desc(level), 
    maxLevel: 3 
  },
  'king_bonus': { 
    // FIX: Corrected translation path
    name: (lang) => translations[lang].roguelike.powers.king_bonus.name, 
    // FIX: Corrected translation path
    description: (lang, level) => translations[lang].roguelike.powers.king_bonus.desc(level * 5), 
    maxLevel: 2 
  },
  'ace_of_briscola_start': { 
    // FIX: Corrected translation path
    name: (lang) => translations[lang].roguelike.powers.ace_of_briscola_start.name, 
    // FIX: Corrected translation path
    description: (lang) => translations[lang].roguelike.powers.ace_of_briscola_start.desc(), 
    maxLevel: 1 
  },
  'briscola_mastery': { 
    // FIX: Corrected translation path
    name: (lang) => translations[lang].roguelike.powers.briscola_mastery.name, 
    // FIX: Corrected translation path
    description: (lang, level) => translations[lang].roguelike.powers.briscola_mastery.desc(level * 2), 
    maxLevel: 3 
  },
  'value_swap': { 
    // FIX: Corrected translation path
    name: (lang) => translations[lang].roguelike.powers.value_swap.name, 
    // FIX: Corrected translation path
    description: (lang) => translations[lang].roguelike.powers.value_swap.desc(), 
    maxLevel: 1 
  },
  'last_trick_insight': { 
    // FIX: Corrected translation path
    name: (lang) => translations[lang].roguelike.powers.last_trick_insight.name, 
    // FIX: Corrected translation path
    description: (lang) => translations[lang].roguelike.powers.last_trick_insight.desc(), 
    maxLevel: 1 
  },
};

export const ALL_POWER_UP_IDS = Object.keys(POWER_UP_DEFINITIONS) as RoguelikePowerUpId[];