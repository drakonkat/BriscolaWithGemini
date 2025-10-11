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
  isTemporaryBriscola?: boolean;
};
export type Player = 'human' | 'ai';
// FIX: Added 'roguelike-map' to GamePhase to support the roguelike game flow.
export type GamePhase = 'menu' | 'playing' | 'gameOver' | 'power-selection' | 'roguelike-map';
export type ChatMessage = { sender: 'human' | 'ai'; text: string; };
export type Language = 'it' | 'en';
export type Waifu = WaifuType;
export type GameEmotionalState = 'winning' | 'losing' | 'neutral';
export type GameplayMode = 'classic' | 'roguelike';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'nightmare' | 'apocalypse';
export type Soundtrack = 'epic' | 'chill';
export type Element = 'fire' | 'water' | 'air' | 'earth';
export type AbilityType = 'incinerate' | 'tide' | 'cyclone' | 'fortify';
export type SnackbarType = 'success' | 'warning';
export type ModalType = 'rules' | 'privacy' | 'terms' | 'gallery' | 'waifuDetails' | 'support' | 'confirmLeave' | 'chat' | 'history' | 'soundEditor' | 'gachaSingleUnlock' | 'gachaMultiUnlock' | 'legend' | 'settings';
export type CardDeckStyle = 'classic' | 'poker';
export type SoundName =
  | 'game-start'
  | 'card-place'
  | 'trick-win'
  | 'trick-lose'
  | 'chat-notify'
  | 'game-win'
  | 'game-lose'
  | 'element-fire'
  | 'element-water'
  | 'element-air'
  | 'element-earth'
  | 'gacha-roll'
  | 'gacha-unlock-r'
  | 'gacha-unlock-sr'
  | 'gacha-unlock-ssr'
  | 'gacha-refund'
  | 'gacha-multi-unlock'
  | 'dice-roll';
export type DrumType = 'kick' | 'snare' | 'closedHat' | 'openHat';

export type Chord = '---' | 'Am' | 'G' | 'C' | 'F' | 'Dm' | 'E';
export const CHORDS: Chord[] = ['---', 'Am', 'G', 'C', 'F', 'Dm', 'E'];

export type Decade = '40s' | '50s' | '60s' | '70s' | '80s' | '90s' | '2000s' | '2010s' | '2020s' | 'blue90s';


// FIX: Added OscillatorType to be used for sound settings.
export type OscillatorType = 'sine' | 'sawtooth' | 'square' | 'triangle';

export type RoguelikePowerUpId = 
  'bonus_point_per_trick' | 
  'king_bonus' | 
  'ace_of_briscola_start' | 
  'briscola_mastery' | 
  'value_swap' |
  'last_trick_insight' |
  'third_eye';

export interface RoguelikePowerUp {
  id: RoguelikePowerUpId;
  level: number;
}

// FIX: Added missing properties to RoguelikeState to support game state management.
export type RoguelikeState = {
    currentLevel: number; // 0 = before starting, 1-4 = in progress
    encounteredWaifus: string[];
    followers: Waifu[];
    followerAbilitiesUsedThisMatch: string[];
    initialPower: RoguelikePowerUpId | null;
    activePowers: RoguelikePowerUp[];
};

export type ElementalClashResult = {
    type: 'dice';
    humanRoll: number;
    aiRoll: number;
    winner: 'human' | 'ai' | 'tie';
} | {
    type: 'weakness';
    winner: 'human' | 'ai';
    winningElement: Element;
    losingElement: Element;
};

export type TrickHistoryEntry = {
  trickNumber: number;
  humanCard: Card;
  aiCard: Card;
  winner: Player;
  points: number;
  clashResult?: ElementalClashResult;
  basePoints: number;
  bonusPoints: number;
  bonusPointsReason: string;
};

// FIX: Added RoguelikeEvent type definition.
export type RoguelikeEvent = { type: 'market' | 'witch_hut' | 'healing_fountain' | 'challenge_altar' };

export type AbilityUseHistoryEntry = {
  isAbilityUse: true;
  trickNumber: number;
  waifuName: string;
  abilityName: string;
};

export type HistoryEntry = TrickHistoryEntry | AbilityUseHistoryEntry;