/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { SUITS_IT, VALUES_IT, RANK } from './constants';
import type { Card, Suit, Player, Value } from './types';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  let cardId = 0;
  for (const suit of SUITS_IT as Suit[]) {
    for (const value of VALUES_IT as Value[]) {
      deck.push({ id: `card-${cardId++}`, suit, value });
    }
  }
  return deck;
};

const getCardRank = (card: Card): number => {
  return RANK[card.value];
};

export const getTrickWinner = (playedCards: Card[], starter: Player, briscola: Suit): Player => {
    const card1 = playedCards[0]; // lead card
    const card2 = playedCards[1]; // follow card
    const follower: Player = starter === 'human' ? 'ai' : 'human';
    const card1IsBriscola = card1.suit === briscola;
    const card2IsBriscola = card2.suit === briscola;

    const rank1 = getCardRank(card1);
    const rank2 = getCardRank(card2);

    if (card1IsBriscola && !card2IsBriscola) return starter;
    if (!card1IsBriscola && card2IsBriscola) return follower;
    if (card1IsBriscola && card2IsBriscola) {
      return rank1 > rank2 ? starter : follower;
    }
    if (card1.suit === card2.suit) {
        return rank1 > rank2 ? starter : follower;
    }
    return starter;
};
