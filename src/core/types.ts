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
};
export type Player = 'human' | 'ai';
export type GamePhase = 'menu' | 'playing' | 'gameOver';
export type ChatMessage = { sender: 'human' | 'ai'; text: string; };
export type Language = 'it' | 'en';
export type Waifu = WaifuType;
export type GameEmotionalState = 'winning' | 'losing' | 'neutral';
export type GameplayMode = 'classic' | 'roguelike';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Soundtrack = 'epic' | 'chill';
export type Element = 'fire' | 'water' | 'air' | 'earth';
export type AbilityType = 'incinerate' | 'tide' | 'cyclone' | 'fortify';