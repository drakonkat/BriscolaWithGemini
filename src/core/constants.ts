/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Value, Difficulty } from './types';

export const SUITS_IT = ['Bastoni', 'Coppe', 'Spade', 'denara'];
export const VALUES_IT = ['Asso', '3', 'Re', 'Cavallo', 'Fante', '7', '6', '5', '4', '2'];
export const SUITS_EN = ['Batons', 'Cups', 'Swords', 'Coins'];
export const VALUES_EN = ['Ace', '3', 'King', 'Knight', 'Jack', '7', '6', '5', '4', '2'];

export const POINTS: { [key: string]: number } = {
  'Asso': 11, '3': 10, 'Re': 4, 'Cavallo': 3, 'Fante': 2,
  '7': 0, '6': 0, '5': 0, '4': 0, '2': 0,
};

export const RANK: { [key: string]: number } = {
  'Asso': 10, '3': 9, 'Re': 8, 'Cavallo': 7, 'Fante': 6,
  '7': 5, '6': 4, '5': 3, '4': 2, '2': 1,
};

export const valueToFileNumber: { [key in Value]: number } = {
    'Asso': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    'Fante': 8, 'Cavallo': 9, 'Re': 10,
};

export const ROGUELIKE_REWARDS: Record<Difficulty, { win: number; loss: number[] }> = {
  easy:      { win: 750,  loss: [0, 10, 50, 125, 250] }, // loss[level] for level 1, 2, 3, 4
  medium:    { win: 1500, loss: [0, 20, 100, 250, 500] },
  hard:      { win: 2250, loss: [0, 30, 150, 375, 750] },
  nightmare: { win: 2600, loss: [0, 40, 500, 1000, 1800] },
  apocalypse: { win: 3000, loss: [0, 50, 750, 1500, 2250] },
};