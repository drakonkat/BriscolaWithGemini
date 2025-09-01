/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { RANK } from './constants';
import { getCardPoints, shuffleDeck } from './utils';
import type { Card, Suit, Player, Element, AbilityType } from './types';

/**
 * Initializes a deck for Roguelike mode by assigning elements to cards based on the current level.
 * @param deck The initial deck of cards.
 * @param level The current level of the roguelike run (1-4).
 * @returns An object containing the new deck with elements assigned and a list of active elements.
 */
export const initializeRoguelikeDeck = (deck: Card[], level: number): { deck: Card[], activeElements: Element[] } => {
    const allElements: Element[] = ['fire', 'water', 'air', 'earth'];
    const elementsForLevel = shuffleDeck(allElements).slice(0, level);

    // Probability of a card having an element increases with the level
    const elementProbabilities = [0, 0.5, 0.65, 0.8, 1.0]; // level 1-4
    const probability = elementProbabilities[level];

    const assignedElements = new Set<Element>();
    const newDeck = deck.map(card => {
        if (elementsForLevel.length > 0 && Math.random() < probability) {
            const elementToAssign = elementsForLevel[Math.floor(Math.random() * elementsForLevel.length)];
            assignedElements.add(elementToAssign);
            return {
                ...card,
                element: elementToAssign
            };
        }
        return card; // No element assigned
    });
    return { deck: newDeck, activeElements: Array.from(assignedElements) };
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
  return RANK[card.value];
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
    
    const card1IsBriscola = card1.suit === briscola || card1.isTemporaryBriscola;
    const card2IsBriscola = card2.suit === briscola || card2.isTemporaryBriscola;

    const rank1 = getRoguelikeCardRank(card1);
    const rank2 = getRoguelikeCardRank(card2);

    if (card1IsBriscola && !card2IsBriscola) return starter;
    if (!card1IsBriscola && card2IsBriscola) return follower;
    
    // If both are considered briscola (real or temporary), the higher rank wins.
    if (card1IsBriscola && card2IsBriscola) {
      return rank1 > rank2 ? starter : follower;
    }
    
    // If they are of the same suit (but not briscola), the higher rank wins.
    if (card1.suit === card2.suit) {
        return rank1 > rank2 ? starter : follower;
    }
    
    // Otherwise, the starter of the trick wins.
    return starter;
};

const WEAKNESS_MAP: Partial<Record<Element, Element>> = {
    water: 'fire',
    fire: 'air',
    air: 'earth',
    earth: 'water',
};

/**
 * Determines the winner of an elemental clash based on weaknesses.
 * @param humanElement The element of the human's card.
 * @param aiElement The element of the AI's card.
 * @returns The winning player ('human' or 'ai'), or null if no weakness relationship exists.
 */
export const determineWeaknessWinner = (humanElement: Element, aiElement: Element): 'human' | 'ai' | null => {
    if (WEAKNESS_MAP[humanElement] === aiElement) return 'human';
    if (WEAKNESS_MAP[aiElement] === humanElement) return 'ai';
    return null;
};

/**
 * Calculates the points for a trick in Roguelike mode, applying elemental power effects.
 * @param humanCard The card played by the human.
 * @param aiCard The card played by the AI.
 * @param humanPowerActive Whether the human player's elemental power is active.
 * @param aiPowerActive Whether the AI player's elemental power is active.
 * @param winner The winner of the trick.
 * @param clashWinner The winner of the elemental clash, if one occurred.
 * @returns An object with the total points for the trick and the individual card points after modifications.
 */
export const calculateRoguelikeTrickPoints = (
    humanCard: Card,
    aiCard: Card,
    humanPowerActive: boolean,
    aiPowerActive: boolean,
    winner: Player,
    clashWinner: 'human' | 'ai' | 'tie' | null
) => {
    let humanCardPoints = getCardPoints(humanCard);
    let aiCardPoints = getCardPoints(aiCard);

    // Water Power: Halves opponent's card points only if the user of the power loses the trick
    if (humanPowerActive && humanCard.element === 'water' && winner === 'ai') {
        aiCardPoints = Math.floor(aiCardPoints / 2);
    }
    if (aiPowerActive && aiCard.element === 'water' && winner === 'human') {
        humanCardPoints = Math.floor(humanCardPoints / 2);
    }

    let pointsForTrick = humanCardPoints + aiCardPoints;

    // Air Power: Nullifies trick points only if the user of the power loses the trick AND the clash (if one occurred).
    const humanLostClash = clashWinner === 'ai' || clashWinner === 'tie';
    if (humanPowerActive && humanCard.element === 'air' && winner === 'ai') {
        if (clashWinner === null || humanLostClash) {
            pointsForTrick = 0;
        }
    }
    const aiLostClash = clashWinner === 'human' || clashWinner === 'tie';
    if (aiPowerActive && aiCard.element === 'air' && winner === 'human') {
        if (clashWinner === null || aiLostClash) {
            pointsForTrick = 0;
        }
    }


    return {
        pointsForTrick,
        humanCardPoints, // Points to return for Earth power
        aiCardPoints,    // Points to return for Earth power
    };
};