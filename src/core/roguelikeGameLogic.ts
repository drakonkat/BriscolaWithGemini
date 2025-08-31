/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { RANK } from './constants';
import { getCardPoints, shuffleDeck } from './utils';
import type { Card, Suit, Player, Element, AbilityType } from './types';

/**
 * Initializes a deck for Roguelike mode by assigning a random element to each card.
 * @param deck The initial deck of cards.
 * @returns A new deck with elements assigned to each card.
 */
export const initializeRoguelikeDeck = (deck: Card[]): Card[] => {
    const elements: Element[] = ['fire', 'water', 'air', 'earth'];
    return deck.map(card => ({
        ...card,
        element: elements[Math.floor(Math.random() * elements.length)]
    }));
};

/**
 * Shuffles and assigns unique abilities to the human and AI player.
 * @returns An object containing the assigned abilities for each player.
 */
export const assignAbilities = (): { humanAbility: AbilityType, aiAbility: AbilityType } => {
    const abilities: AbilityType[] = ['incinerate', 'tide', 'cyclone', 'fortify'];
    const shuffledAbilities = shuffleDeck(abilities);
    return { humanAbility: shuffledAbilities[0], aiAbility: shuffledAbilities[1] };
};

/**
 * Gets the rank of a card, considering Roguelike effects like 'Fortify'.
 * @param card The card to evaluate.
 * @returns The numerical rank of the card.
 */
const getRoguelikeCardRank = (card: Card): number => {
  const baseRank = RANK[card.value];
  if (card.isFortified) {
    return baseRank + 5;
  }
  return baseRank;
};

/**
 * Determines the winner of a trick in Roguelike mode, considering card rank modifications.
 * @param playedCards The two cards played in the trick.
 * @param starter The player who started the trick.
 * @param briscola The trump suit.
 * @returns The winning player.
 */
export const getRoguelikeTrickWinner = (playedCards: Card[], starter: Player, briscola: Suit): Player => {
    const card1 = playedCards[0];
    const card2 = playedCards[1];
    const follower: Player = starter === 'human' ? 'ai' : 'human';
    const card1IsBriscola = card1.suit === briscola;
    const card2IsBriscola = card2.suit === briscola;

    const rank1 = getRoguelikeCardRank(card1);
    const rank2 = getRoguelikeCardRank(card2);

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

/**
 * Calculates the points for a trick in Roguelike mode, applying elemental power effects.
 * @param humanCard The card played by the human.
 * @param aiCard The card played by the AI.
 * @returns An object with the total points for the trick and the individual card points after modifications.
 */
export const calculateRoguelikeTrickPoints = (humanCard: Card, aiCard: Card) => {
    let humanCardPoints = getCardPoints(humanCard);
    let aiCardPoints = getCardPoints(aiCard);

    // Water Power: Halves opponent's card points
    if (humanCard.element === 'water') aiCardPoints = Math.floor(aiCardPoints / 2);
    if (aiCard.element === 'water') humanCardPoints = Math.floor(humanCardPoints / 2);

    let pointsForTrick = humanCardPoints + aiCardPoints;

    // Air Power: Nullifies trick points
    if (humanCard.element === 'air' || aiCard.element === 'air') {
        pointsForTrick = 0;
    }

    return {
        pointsForTrick,
        humanCardPoints, // Points to return for Earth power
        aiCardPoints,    // Points to return for Earth power
    };
};
