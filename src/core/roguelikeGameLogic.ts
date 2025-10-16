/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { RANK } from './constants';
import { getCardPoints, shuffleDeck } from './utils';
import type { Card, Suit, Player, Element, AbilityType, RoguelikePowerUp, Value } from './types';
import { translations } from './translations';

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
 * Gets the rank of a card, considering Roguelike effects like 'Fortify'.
 * @param card The card to evaluate.
 * @returns The numerical rank of the card.
 */
const getRoguelikeCardRank = (card: Card): number => {
  return RANK[card.value];
};

/**
 * Determines the winner of a trick in Roguelike mode, considering card rank modifications and special powers.
 * @param playedCards The two cards played in the trick.
 * @param starter The player who started the trick.
 * @param briscola The trump suit.
 * @param activePowers The list of active power-ups for the human player.
 * @returns The winning player.
 */
export const getRoguelikeTrickWinner = (playedCards: Card[], starter: Player, briscola: Suit, activePowers: RoguelikePowerUp[] = []): Player => {
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
    
    // If they are of the same suit (but not briscola), check for powers and then rank.
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
 * @param winner The winner of the trick.
 * @param clashWinner The winner of the elemental clash, if one occurred.
 * @returns An object with the total points for the trick and the individual card points after modifications.
 */
export const calculateRoguelikeTrickPoints = (
    humanCard: Card,
    aiCard: Card,
    winner: Player,
    clashWinner: 'human' | 'ai' | 'tie' | null,
    briscolaSuit: Suit,
    activePowers: RoguelikePowerUp[],
    humanScorePile: Card[],
    aiScorePile: Card[],
    T: typeof translations['it'] | typeof translations['en'],
    isElementalFury: boolean = false,
) => {
    let humanCardPoints = getCardPoints(humanCard);
    let aiCardPoints = getCardPoints(aiCard);
    const basePoints = humanCardPoints + aiCardPoints;
    let bonusPoints = 0;
    const bonusReasons: string[] = [];
    let airBonus = 0;

    const isHumanPowerActive = isElementalFury || ((humanCard.elementalEffectActivated ?? false) && clashWinner !== 'ai');
    const isAiPowerActive = isElementalFury || ((aiCard.elementalEffectActivated ?? false) && clashWinner !== 'human');

    // Water Power: Halves winning card's points if the power user loses the trick
    if (isHumanPowerActive && humanCard.element === 'water' && winner === 'ai') {
        const reduction = Math.ceil(getCardPoints(aiCard) / 2);
        aiCardPoints -= reduction;
        if (reduction > 0) bonusReasons.push(T.history.bonusReasons.water(reduction));
    }
    if (isAiPowerActive && aiCard.element === 'water' && winner === 'human') {
        const reduction = Math.ceil(getCardPoints(humanCard) / 2);
        humanCardPoints -= reduction;
        if (reduction > 0) bonusReasons.push(T.history.bonusReasons.water(reduction));
    }

    // Fire Power: +3 bonus points for winning with a fire card
    if (winner === 'human' && isHumanPowerActive && humanCard.element === 'fire') {
        bonusPoints += 3;
        bonusReasons.push(T.history.bonusReasons.fire);
    }
    if (winner === 'ai' && isAiPowerActive && aiCard.element === 'fire') {
        bonusPoints += 3;
        bonusReasons.push(T.history.bonusReasons.fire);
    }

    // Air Power: Bonus points for collected air cards
    if (winner === 'human' && isHumanPowerActive && humanCard.element === 'air') {
        const airCardsInPile = humanScorePile.filter(card => card.element === 'air').length;
        if (airCardsInPile > 0) {
            airBonus = airCardsInPile;
            bonusPoints += airBonus;
            bonusReasons.push(T.history.bonusReasons.air(airBonus));
        }
    }
    if (winner === 'ai' && isAiPowerActive && aiCard.element === 'air') {
        const airCardsInPile = aiScorePile.filter(card => card.element === 'air').length;
        if (airCardsInPile > 0) {
            airBonus = airCardsInPile;
            bonusPoints += airBonus;
            bonusReasons.push(T.history.bonusReasons.air(airBonus));
        }
    }

    // Roguelike passive power points
    if (winner === 'human') {
        const bonusPointPower = activePowers.find(p => p.id === 'bonus_point_per_trick');
        if (bonusPointPower) {
            bonusPoints += bonusPointPower.level;
            bonusReasons.push(T.history.bonusReasons.tribute(bonusPointPower.level));
        }

        const headhunterPower = activePowers.find(p => p.id === 'king_bonus');
        if (headhunterPower) {
            const playedCardValue = humanCard.value;
            if (playedCardValue === 'Fante' || playedCardValue === 'Cavallo' || playedCardValue === 'Re') {
                const headhunterBonus = headhunterPower.level * 2;
                bonusPoints += headhunterBonus;
                bonusReasons.push(T.history.bonusReasons.headhunter(headhunterBonus));
            }
        }

        const briscolaMasteryPower = activePowers.find(p => p.id === 'briscola_mastery');
        if (briscolaMasteryPower && (humanCard.suit === briscolaSuit || humanCard.isTemporaryBriscola)) {
            const masteryBonus = briscolaMasteryPower.level * 2;
            bonusPoints += masteryBonus;
            bonusReasons.push(T.history.bonusReasons.mastery(masteryBonus));
        }
    }

    const totalPoints = humanCardPoints + aiCardPoints + bonusPoints;
    
    // Earth power: recovers the original points of the card
    const humanCardPointsReturned = (winner === 'ai' && isHumanPowerActive && humanCard.element === 'earth') ? getCardPoints(humanCard) : 0;
    const aiCardPointsReturned = (winner === 'human' && isAiPowerActive && aiCard.element === 'earth') ? getCardPoints(aiCard) : 0;
    
    if (humanCardPointsReturned > 0) bonusReasons.push(T.history.bonusReasons.earth(humanCardPointsReturned));
    if (aiCardPointsReturned > 0) bonusReasons.push(T.history.bonusReasons.earth(aiCardPointsReturned));

    return {
        totalPoints,
        basePoints,
        bonusPoints: totalPoints - basePoints,
        bonusReasons,
        humanCardPointsReturned,
        aiCardPointsReturned,
        airBonus,
    };
};
