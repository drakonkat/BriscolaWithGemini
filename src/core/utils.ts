/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { SUITS_IT, VALUES_IT, valueToFileNumber, POINTS } from './constants';
import { translations } from './translations';
import type { Card, Language, CardDeckStyle } from './types';

const WEB_IMAGE_BASE_URL = 'https://s3.tebi.io/waifubriscola';
const LOCAL_IMAGE_BASE_URL = 'public/assets'; 

const useWebImages = !(process.env.FETCH_IMAGE_FROM_WEB === '1');
const IMAGE_BASE_URL = useWebImages ? WEB_IMAGE_BASE_URL : LOCAL_IMAGE_BASE_URL;

export const getImageUrl = (path: string): string => {
    // path should start with a `/`, e.g., `/classic/spade1.png`
    return `${IMAGE_BASE_URL}${path}`;
}

export const getCardId = (card: Card, lang: Language): string => {
  const valueIndex = VALUES_IT.indexOf(card.value);
  const suitIndex = SUITS_IT.indexOf(card.suit);
  const translatedValue = translations[lang].values[valueIndex];
  const translatedSuit = translations[lang].suits[suitIndex];
  return `${translatedValue}${translations[lang].cardIdConnector}${translatedSuit}`;
}

export const getCardImagePath = (card: Card, style: CardDeckStyle): string => {
  const suit = card.suit.toLowerCase();
  const number = valueToFileNumber[card.value];
  return getImageUrl(`/${style}/${suit}${number}.png`);
};

/**
 * Calculates the points of a card, considering status effects like being burned.
 * @param card The card to evaluate.
 * @returns The number of points the card is worth.
 */
export const getCardPoints = (card: Card): number => {
  if (card.isBurned) {
    return 0;
  }
  return POINTS[card.value];
};

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * This function is generic and can be used for any array type.
 * @param array The array to shuffle.
 * @returns A new shuffled array.
 */
export const shuffleDeck = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};