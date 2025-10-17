/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { SUITS_IT, VALUES_IT, RANK } from './constants.js';

export const createDeck = () => {
  const deck = [];
  let cardId = 0;
  for (const suit of SUITS_IT) {
    for (const value of VALUES_IT) {
      deck.push({ id: `card-${cardId++}`, suit, value });
    }
  }
  return deck;
};

const getCardRank = (card) => {
  return RANK[card.value];
};

export const getTrickWinner = (playedCards, starter, briscola) => {
    const card1 = playedCards[0]; // lead card
    const card2 = playedCards[1]; // follow card
    const follower = starter === 'human' ? 'ai' : 'human';
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