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
    name: (lang) => translations[lang].roguelike.powers.bonus_point_per_trick.name, 
    description: (lang, level) => translations[lang].roguelike.powers.bonus_point_per_trick.desc(level), 
    maxLevel: 3 
  },
  'king_bonus': { 
    name: (lang) => translations[lang].roguelike.powers.king_bonus.name, 
    description: (lang, level) => translations[lang].roguelike.powers.king_bonus.desc(level), 
    maxLevel: 3
  },
  'ace_of_briscola_start': { 
    name: (lang) => translations[lang].roguelike.powers.ace_of_briscola_start.name, 
    description: (lang, level) => translations[lang].roguelike.powers.ace_of_briscola_start.desc(level), 
    maxLevel: 3
  },
  'briscola_mastery': { 
    name: (lang) => translations[lang].roguelike.powers.briscola_mastery.name, 
    description: (lang, level) => translations[lang].roguelike.powers.briscola_mastery.desc(level), 
    maxLevel: 3 
  },
  'value_swap': { 
    name: (lang) => translations[lang].roguelike.powers.value_swap.name, 
    description: (lang, level) => translations[lang].roguelike.powers.value_swap.desc(4 - level), 
    maxLevel: 3 
  },
  'last_trick_insight': { 
    name: (lang) => translations[lang].roguelike.powers.last_trick_insight.name, 
    description: (lang, level) => translations[lang].roguelike.powers.last_trick_insight.desc(level), 
    maxLevel: 3
  },
  'third_eye': {
    name: (lang) => translations[lang].roguelike.powers.third_eye.name,
    description: (lang, level) => translations[lang].roguelike.powers.third_eye.desc,
    maxLevel: 1
  },
};

export const ALL_POWER_UP_IDS = Object.keys(POWER_UP_DEFINITIONS) as RoguelikePowerUpId[];