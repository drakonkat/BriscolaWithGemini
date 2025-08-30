/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type SoundName =
  | 'game-start'
  | 'card-place'
  | 'trick-win'
  | 'trick-lose'
  | 'chat-notify'
  | 'game-win'
  | 'game-lose';

/**
 * Plays a sound effect. This function is currently a no-op as audio
 * functionality is temporarily disabled.
 * @param name The name of the sound to play.
 */
export const playSound = (name: SoundName) => {
  // NO-OP: Audio functionality is temporarily disabled.
};
