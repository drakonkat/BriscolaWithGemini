/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { RANK } from './constants';
import type { Card, Suit, Language, Waifu, GameEmotionalState, Difficulty, Element, AbilityType } from './types';
import { getCardPoints } from './utils';

type AIAbilityDecision = {
    useAbility: false;
} | {
    useAbility: true;
    ability: AbilityType;
    targetCardId?: string; // ID of the card to target (for Incinerate/Fortify/Cyclone)
};

export const getAIAbilityDecision = (
    aiAbility: AbilityType,
    aiHand: Card[],
    humanHand: Card[] | null,
    deckSize: number,
    cardsOnTable: Card[]
): AIAbilityDecision => {
    switch (aiAbility) {
        case 'incinerate': {
            // Use Incinerate only if AI is second to play and the card on table is valuable
            if (cardsOnTable.length === 1) {
                const humanCardOnTable = cardsOnTable[0];
                if (getCardPoints(humanCardOnTable) >= 10) {
                    return { useAbility: true, ability: 'incinerate', targetCardId: humanCardOnTable.id };
                }
            }
            return { useAbility: false };
        }
        case 'tide':
            // Always use Tide as soon as it's available to gain information
            return { useAbility: true, ability: 'tide' };
        
        case 'cyclone': {
            // Use Cyclone if the AI has a low-value, non-briscola card and the deck is reasonably full
            const hasBadCard = aiHand.some(c => getCardPoints(c) === 0);
            if (hasBadCard && deckSize > 10) {
                const cardToSwap = aiHand.sort((a,b) => RANK[a.value] - RANK[b.value])[0];
                return { useAbility: true, ability: 'cyclone', targetCardId: cardToSwap.id };
            }
            return { useAbility: false };
        }
        case 'fortify':
            // Use Fortify if the AI has a high-point card (Asso/3) it wants to protect and win
            // This is a simple heuristic; more complex logic could check if it's necessary to win a trick.
            const highPointCard = aiHand.find(c => getCardPoints(c) >= 10);
            if (highPointCard) {
                return { useAbility: true, ability: 'fortify', targetCardId: highPointCard.id };
            }
            return { useAbility: false };
    }
    return { useAbility: false };
};


/**
 * Logica per la mossa dell'IA in modalità offline/fallback.
 * @param aiHand La mano dell'IA.
 * @param briscolaSuit Il seme di briscola.
 * @param cardsOnTable Le carte sul tavolo (0 o 1).
 * @param difficulty Il livello di difficoltà.
 * @returns La carta scelta.
 */
export const getLocalAIMove = (
    aiHand: Card[],
    briscolaSuit: Suit,
    cardsOnTable: Card[],
    difficulty: Difficulty
): Card => {
    // Difficoltà Facile: gioca una carta casuale
    if (difficulty === 'easy') {
        return aiHand[Math.floor(Math.random() * aiHand.length)];
    }

    const sortedHand = [...aiHand].sort((a, b) => (getCardPoints(a) - getCardPoints(b)) || (RANK[a.value] - RANK[b.value]));

    // Se l'IA è il secondo giocatore
    if (cardsOnTable.length > 0) {
        const humanCard = cardsOnTable[0];
        
        const winningCards = sortedHand.filter(aiCard => {
            const aiIsBriscola = aiCard.suit === briscolaSuit;
            const humanIsBriscola = humanCard.suit === briscolaSuit;

            if (aiIsBriscola && !humanIsBriscola) return true;
            if (!aiIsBriscola && humanIsBriscola) return false;
            if (aiIsBriscola && humanIsBriscola) return RANK[aiCard.value] > RANK[humanCard.value];
            if (aiCard.suit === humanCard.suit) return RANK[aiCard.value] > RANK[humanCard.value];
            return false;
        });

        // Se l'IA può vincere
        if (winningCards.length > 0) {
            // Logica per la modalità Roguelike (controlla se le carte hanno un elemento)
            if (winningCards[0].element) {
                // Scegli la carta vincente che massimizza i punti, considerando i poteri
                let bestCard = winningCards[0];
                let maxPotentialPoints = -1;

                for (const card of winningCards) {
                    let humanCardPoints = getCardPoints(humanCard);
                    let aiCardPoints = getCardPoints(card);

                    // Applica potere Acqua
                    if (humanCard.element === 'water') aiCardPoints = Math.floor(aiCardPoints / 2);
                    if (card.element === 'water') humanCardPoints = Math.floor(humanCardPoints / 2);
                    
                    let potentialPoints = humanCardPoints + aiCardPoints;

                    // Applica potere Fuoco
                    if (card.element === 'fire') potentialPoints += 3;

                    // Considera potere Aria (evita di sprecare carte buone per 0 punti)
                    if (humanCard.element === 'air' || card.element === 'air') {
                        potentialPoints = 0;
                    }

                    if (potentialPoints > maxPotentialPoints) {
                        maxPotentialPoints = potentialPoints;
                        bestCard = card;
                    }
                }
                return bestCard;
            }

            // Difficoltà Difficile: strategia più conservativa con le briscole
            if (difficulty === 'hard') {
                const bestWinningCard = winningCards[0];
                const totalTrickPoints = getCardPoints(humanCard) + getCardPoints(bestWinningCard);
                const isUsingBriscola = bestWinningCard.suit === briscolaSuit;
                
                // Non usare NESSUNA briscola per un turno con pochi punti (<10), se possibile.
                if (isUsingBriscola && totalTrickPoints < 10) {
                    const nonBriscolaLosingCards = sortedHand.filter(c => c.suit !== briscolaSuit && !winningCards.includes(c));
                    if (nonBriscolaLosingCards.length > 0) {
                        return nonBriscolaLosingCards[0]; // Scarta un liscio
                    }
                }
            }
            // Difficoltà Media e Difficile (se non scarta): gioca la carta vincente di minor valore
            return winningCards[0];
        }

        // Se l'IA non può vincere, scarta la carta di minor valore
        return sortedHand[0];
    } 
    // Se l'IA è il primo giocatore
    else {
        // Difficoltà Difficile: evita di iniziare con carte di valore
        if (difficulty === 'hard') {
             const briscolaInHand = sortedHand.filter(c => c.suit === briscolaSuit);
             const nonBriscolaInHand = sortedHand.filter(c => c.suit !== briscolaSuit);

             if (nonBriscolaInHand.length === 0) {
                 return briscolaInHand[0]; // Costretto a giocare briscola
             }
             const lowPointNonBriscola = nonBriscolaInHand.filter(c => getCardPoints(c) < 2);
             if (lowPointNonBriscola.length > 0) {
                 return lowPointNonBriscola[0]; // Gioca un liscio non di briscola
             }
             return nonBriscolaInHand[0]; // Costretto a giocare un carico non di briscola
        }

        // Difficoltà Media: gioca la non-briscola più bassa, o la briscola più bassa se costretto
        const nonBriscolaCards = sortedHand.filter(card => card.suit !== briscolaSuit);
        if (nonBriscolaCards.length > 0) {
            return nonBriscolaCards[0];
        }
        return sortedHand[0];
    }
};

/**
 * Seleziona un messaggio di fallback casuale dalla waifu, evitando le ripetizioni.
 * @param waifu La waifu attuale.
 * @param emotionalState Lo stato emotivo dell'IA.
 * @param lang La lingua corrente.
 * @param usedMessages Un array di messaggi già utilizzati in questa partita.
 * @returns Una stringa con il messaggio.
 */
export const getFallbackWaifuMessage = (
    waifu: Waifu,
    emotionalState: GameEmotionalState,
    lang: Language,
    usedMessages: string[] = []
): string => {
    const allMessages = waifu.fallbackMessages[lang][emotionalState]
        || waifu.fallbackMessages[lang].neutral
        || [];

    if (allMessages.length === 0) {
        return lang === 'it' ? "Bel turno!" : "Nice trick!";
    }

    let availableMessages = allMessages.filter(msg => !usedMessages.includes(msg));
    
    // Se tutti i messaggi per questa categoria sono stati usati, li rende di nuovo disponibili.
    if (availableMessages.length === 0) {
        availableMessages = allMessages;
    }

    return availableMessages[Math.floor(Math.random() * availableMessages.length)];
};