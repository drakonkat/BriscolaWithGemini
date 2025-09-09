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
export type GamePhase = 'menu' | 'playing' | 'gameOver' | 'roguelike-map';
export type ChatMessage = { sender: 'human' | 'ai'; text: string; };
export type Language = 'it' | 'en';
export type Waifu = WaifuType;
export type GameEmotionalState = 'winning' | 'losing' | 'neutral';
export type GameplayMode = 'classic' | 'roguelike';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'nightmare';
export type Soundtrack = 'epic' | 'chill';
export type Element = 'fire' | 'water' | 'air' | 'earth';
export type AbilityType = 'incinerate' | 'tide' | 'cyclone' | 'fortify';
export type SnackbarType = 'success' | 'warning';
export type ModalType = 'rules' | 'privacy' | 'terms' | 'gallery' | 'waifuDetails' | 'support' | 'confirmLeave' | 'chat' | 'history' | 'event' | 'soundEditor' | 'gachaSingleUnlock' | 'gachaMultiUnlock';
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
  | 'gacha-multi-unlock';
export type DrumType = 'kick' | 'snare' | 'closedHat' | 'openHat';

// FIX: Added OscillatorType to be used for sound settings.
export type OscillatorType = 'sine' | 'sawtooth' | 'square' | 'triangle';

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
    humanAbility: AbilityType | null;
    aiAbility: AbilityType | null;
    encounteredWaifus: string[];
    followers: Waifu[];
    followerAbilitiesUsedThisMatch: string[];
    justWonLevel?: boolean;
    eventTypesForCrossroads?: RoguelikeEvent['type'][];
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
};