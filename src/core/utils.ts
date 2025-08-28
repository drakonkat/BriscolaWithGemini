/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { SUITS_IT, VALUES_IT, valueToFileNumber } from './constants';
import { translations } from './translations';
import type { Card, Language } from './types';

export const getCardId = (card: Card, lang: Language): string => {
  const valueIndex = VALUES_IT.indexOf(card.value);
  const suitIndex = SUITS_IT.indexOf(card.suit);
  const translatedValue = translations[lang].values[valueIndex];
  const translatedSuit = translations[lang].suits[suitIndex];
  return `${translatedValue}${translations[lang].cardIdConnector}${translatedSuit}`;
}

export const getCardImagePath = (card: Card): string => {
  const suit = card.suit.toLowerCase();
  const number = valueToFileNumber[card.value];
  return `https://s3.tebi.io/waifubriscola/classic/${suit}${number}.png`;
};

export const getWaifuMessage = (points: number, lang: Language): string => {
  const messages = translations[lang].waifuMessages;
  let category: 'zero' | 'low' | 'medium' | 'high';
  if (points === 0) category = 'zero';
  else if (points <= 5) category = 'low';
  else if (points <= 11) category = 'medium';
  else category = 'high';
  
  const selectedMessages = messages[category];
  return selectedMessages[Math.floor(Math.random() * selectedMessages.length)];
};
