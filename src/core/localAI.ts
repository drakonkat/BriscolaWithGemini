/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { RANK, POINTS } from './constants';
import type { Card, Suit, Language, Waifu, GameEmotionalState, Difficulty } from './types';

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

    const sortedHand = [...aiHand].sort((a, b) => (POINTS[a.value] - POINTS[b.value]) || (RANK[a.value] - RANK[b.value]));

    // Se l'IA è il secondo giocatore
    if (cardsOnTable.length > 0) {
        const humanCard = cardsOnTable[0];
        const trickPoints = POINTS[humanCard.value];

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
            // Difficoltà Difficile: strategia più conservativa con le briscole di valore
            if (difficulty === 'hard') {
                const bestWinningCard = winningCards[0];
                const totalTrickPoints = trickPoints + POINTS[bestWinningCard.value];
                const isUsingBriscola = bestWinningCard.suit === briscolaSuit;
                
                // Non usare un Asso o un 3 di briscola per un turno con pochi punti
                if (isUsingBriscola && POINTS[bestWinningCard.value] >= 10 && totalTrickPoints < 10) {
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
             const lowPointNonBriscola = nonBriscolaInHand.filter(c => POINTS[c.value] < 2);
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