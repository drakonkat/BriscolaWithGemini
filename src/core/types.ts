/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Waifu as WaifuType } from './waifus';

export type Suit = 'Bastoni' | 'Coppe' | 'Spade' | 'denara';
export type Value = 'Asso' | '3' | 'Re' | 'Cavallo' | 'Fante' | '7' | '6' | '5' | '4' | '2';
export type Card = { 
  id: string; 
  suit: Suit; 
  value: Value; 
  isBurned?: boolean;
  isFortified?: boolean;
  element?: Element;
  elementalEffectActivated?: boolean;
};
export type Player = 'human' | 'ai';
export type GamePhase = 'menu' | 'playing' | 'gameOver' | 'roguelike-map' | 'roguelike-crossroads';
export type ChatMessage = { sender: 'human' | 'ai'; text: string; };
export type Language = 'it' | 'en';
export type Waifu = WaifuType;
export type GameEmotionalState = 'winning' | 'losing' | 'neutral';
export type GameplayMode = 'classic' | 'roguelike';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Soundtrack = 'epic' | 'chill';
export type Element = 'fire' | 'water' | 'air' | 'earth';
export type AbilityType = 'incinerate' | 'tide' | 'cyclone' | 'fortify';

// FIX: Added 'healing_fountain' to the PlayerPowerUp type to allow it to be set as an active power-up.
export type PlayerPowerUp = 'fortune_amulet' | 'insight_potion' | 'coin_pouch' | 'healing_fountain';

export type RoguelikeEvent = {
    type: 'market' | 'witch_hut' | 'healing_fountain' | 'challenge_altar';
    title: string;
    description: string;
    choices: {
        text: string;
        description?: string;
        action: () => void;
    }[];
};

export type RoguelikeState = {
    currentLevel: number; // 0 = on map before starting, 1-4 = in progress
    runCoins: number;
    activePowerUp: PlayerPowerUp | null;
    challenge: { type: 'score_above_80', reward: number, completed: boolean } | null;
    events: RoguelikeEvent[];
    humanAbility: AbilityType | null;
    aiAbility: AbilityType | null;
    encounteredWaifus: string[];
};