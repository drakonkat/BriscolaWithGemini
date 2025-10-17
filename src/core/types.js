/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SUITS = ['Bastoni', 'Coppe', 'Spade', 'denara'];
export const VALUES = ['Asso', '3', 'Re', 'Cavallo', 'Fante', '7', '6', '5', '4', '2'];

export const Card = {
  id: '',
  suit: '',
  value: '',
  isBurned: false,
  isFortified: false,
  element: null,
  elementalEffectActivated: false,
  isCursed: false
};

export const PLAYERS = ['human', 'ai'];
export const GAME_PHASES = ['menu', 'playing', 'gameOver', 'power-selection', 'roguelike-map'];

export const ChatMessage = {
  sender: '',
  text: ''
};

export const LANGUAGES = ['it', 'en'];
export const GAME_EMOTIONAL_STATES = ['winning', 'losing', 'neutral'];
export const GAMEPLAY_MODES = ['classic', 'roguelike', 'dungeon'];
export const DIFFICULTIES = ['easy', 'medium', 'hard', 'nightmare', 'apocalypse'];
export const SOUNDTRACKS = ['epic', 'chill'];
export const ELEMENTS = ['fire', 'water', 'air', 'earth'];
export const ESSENCES = ELEMENTS;
export const ABILITY_TYPES = ['incinerate', 'tide', 'cyclone', 'fortify'];
export const SNACKBAR_TYPES = ['success', 'warning'];
export const MODAL_TYPES = ['rules', 'privacy', 'terms', 'gallery', 'waifuDetails', 'support', 'confirmLeave', 'chat', 'history', 'soundEditor', 'gachaSingleUnlock', 'gachaMultiUnlock', 'legend', 'settings', 'craftingMinigame', 'challengeMatch', 'challengeKeySelection', 'noKeys', 'dungeonProgress', 'dungeonEnd', 'missions', 'dungeonMatchStart', 'dungeonModifierInfo'];
export const CARD_DECK_STYLES = ['classic', 'poker'];
export const SOUND_NAMES = ['game-start', 'card-place', 'trick-win', 'trick-lose', 'chat-notify', 'game-win', 'game-lose', 'element-fire', 'element-water', 'element-air', 'element-earth', 'gacha-roll', 'gacha-unlock-r', 'gacha-unlock-sr', 'gacha-unlock-ssr', 'gacha-refund', 'gacha-multi-unlock', 'dice-roll', 'shard-shatter', 'essence-gain', 'craft-critical', 'mission-complete'];
export const DRUM_TYPES = ['kick', 'snare', 'closedHat', 'openHat'];

export const CHORDS = ['---', 'Am', 'G', 'C', 'F', 'Dm', 'E'];

export const DECADES = ['40s', '50s', '60s', '70s', '80s', '90s', '2000s', '2010s', '2020s', 'blue90s'];

export const OSCILLATOR_TYPES = ['sine', 'sawtooth', 'square', 'triangle'];

export const ROGUELIKE_POWER_UP_IDS = ['bonus_point_per_trick', 'king_bonus', 'ace_of_briscola_start', 'briscola_mastery', 'value_swap', 'last_trick_insight', 'third_eye'];

export const RoguelikePowerUp = {
  id: '',
  level: 1
};

export const RoguelikeState = {
  currentLevel: 0,
  encounteredWaifus: [],
  followers: [],
  followerAbilitiesUsedThisMatch: [],
  initialPower: null,
  activePowers: [],
  waifuOpponents: []
};

export const DUNGEON_MODIFIER_IDS = ['NONE', 'BRISCOLA_CHAOS', 'CURSED_HAND', 'ELEMENTAL_FURY', 'VALUE_INVERSION'];

export const DungeonModifier = {
  id: '',
  name: '',
  description: ''
};

export const DungeonRunState = {
  isActive: false,
  keyRarity: null,
  currentMatch: 0,
  totalMatches: 0,
  wins: 0,
  waifuOpponents: [],
  modifiers: []
};

export const ElementalClashResult = {
  type: '',
  humanRoll: 0,
  aiRoll: 0,
  winner: '',
  winningElement: '',
  losingElement: ''
};

export const TrickHistoryEntry = {
  trickNumber: 0,
  humanCard: {},
  aiCard: {},
  winner: '',
  points: 0,
  clashResult: null,
  basePoints: 0,
  bonusPoints: 0,
  bonusPointsReason: ''
};

export const RoguelikeEvent = { type: '' };

export const AbilityUseHistoryEntry = {
  isAbilityUse: true,
  trickNumber: 0,
  waifuName: '',
  abilityName: ''
};

export const MISSION_REWARD_TYPES = ['waifuCoins', 'r_shards', 'sr_shards', 'ssr_shards', 'fire_essences', 'water_essences', 'air_essences', 'earth_essences', 'transcendental_essences'];
export const MISSION_TYPES = ['daily', 'weekly'];
export const MISSION_CATEGORIES = ['gameplay', 'collection'];
export const MISSION_PROGRESS_KEYS = ['gamesWon', 'classicGamesWon', 'roguelikeGamesWon', 'dungeonRunsWon', 'cardsPlayed_coppe', 'cardsPlayed_denara', 'cardsPlayed_spade', 'cardsPlayed_bastoni', 'winOnDifficulty_hard', 'winOnDifficulty_nightmare', 'winOnDifficulty_apocalypse', 'keysCrafted', 'gachaRolls', 'elementalPowersUsed', 'waifusDefeated', 'ssrCollected', 'followersRecruited'];

export const Mission = {
  id: '',
  type: '',
  category: '',
  progressKey: '',
  target: 0,
  rewards: {}
};

export const Achievement = Mission;

export const MissionState = {
  progress: 0,
  claimed: false
};

export const AchievementState = {
  progress: 0,
  claimed: false,
  unlockedAt: null
};