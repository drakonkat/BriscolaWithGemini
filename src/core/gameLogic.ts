/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { SUITS_IT, VALUES_IT, RANK } from './constants';
import type { Card, Suit, Player, Value } from './types';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS_IT as Suit[]) {
    for (const value of VALUES_IT as Value[]) {
      deck.push({ suit, value });
    }
  }
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getTrickWinner = (playedCards: Card[], starter: Player, briscola: Suit): Player => {
    const card1 = playedCards[0]; // lead card
    const card2 = playedCards[1]; // follow card
    const follower: Player = starter === 'human' ? 'ai' : 'human';
    const card1IsBriscola = card1.suit === briscola;
    const card2IsBriscola = card2.suit === briscola;

    if (card1IsBriscola && !card2IsBriscola) return starter;
    if (!card1IsBriscola && card2IsBriscola) return follower;
    if (card1IsBriscola && card2IsBriscola) {
      return RANK[card1.value] > RANK[card2.value] ? starter : follower;
    }
    if (card1.suit === card2.suit) {
        return RANK[card1.value] > RANK[card2.value] ? starter : follower;
    }
    return starter;
};
