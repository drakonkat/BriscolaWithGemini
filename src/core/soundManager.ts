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

const soundFiles: Record<SoundName, string> = {
  'game-start': 'https://s3.tebi.io/waifubriscola/sounds/game-start.ogg',
  'card-place': 'https://s3.tebi.io/waifubriscola/sounds/card-place.ogg',
  'trick-win': 'https://s3.tebi.io/waifubriscola/sounds/trick-win.ogg',
  'trick-lose': 'https://s3.tebi.io/waifubriscola/sounds/trick-lose.ogg',
  'chat-notify': 'https://s3.tebi.io/waifubriscola/sounds/chat-notify.ogg',
  'game-win': 'https://s3.tebi.io/waifubriscola/sounds/game-win.ogg',
  'game-lose': 'https://s3.tebi.io/waifubriscola/sounds/game-lose.ogg',
};

const audioCache: { [key in SoundName]?: HTMLAudioElement } = {};

// Preload audio files
Object.entries(soundFiles).forEach(([name, src]) => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audioCache[name as SoundName] = audio;
});


export const playSound = (name: SoundName) => {
  const audio = audioCache[name];
  if (audio) {
    // Stop and rewind before playing to allow for rapid succession
    audio.pause();
    audio.currentTime = 0;
    // The play() method returns a Promise which can be safely ignored.
    // We add a .catch() to prevent unhandled promise rejection errors.
    audio.play().catch(error => console.log(`Audio play failed: ${error}`));
  }
};
