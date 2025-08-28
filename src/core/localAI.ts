/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { RANK, POINTS } from './constants';
import type { Card, Suit, Language, Waifu, GameEmotionalState } from './types';

/**
 * Logica per la mossa dell'IA in modalità offline/fallback.
 * @param aiHand La mano dell'IA.
 * @param briscolaSuit Il seme di briscola.
 * @param cardsOnTable Le carte sul tavolo (0 o 1).
 * @returns La carta scelta.
 */
export const getLocalAIMove = (
    aiHand: Card[],
    briscolaSuit: Suit,
    cardsOnTable: Card[]
): Card => {
    // Ordina le carte per valore (dal più basso al più alto)
    const sortedHand = [...aiHand].sort((a, b) => (POINTS[a.value] - POINTS[b.value]) || (RANK[a.value] - RANK[b.value]));

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

        // Se può vincere, gioca la carta vincente di minor valore
        if (winningCards.length > 0) {
            return winningCards[0];
        }

        // Se non può vincere, scarta la carta di minor valore (un "liscio")
        return sortedHand[0];
    }

    // Se l'IA è il primo giocatore
    else {
        const nonBriscolaCards = sortedHand.filter(card => card.suit !== briscolaSuit);
        // Se ha carte non di briscola, gioca quella di minor valore
        if (nonBriscolaCards.length > 0) {
            return nonBriscolaCards[0];
        }
        // Altrimenti, è costretto a giocare la briscola di minor valore
        return sortedHand[0];
    }
};

/**
 * Seleziona un messaggio di fallback casuale dalla waifu.
 * @param waifu La waifu attuale.
 * @param emotionalState Lo stato emotivo dell'IA.
 * @param lang La lingua corrente.
 * @returns Una stringa con il messaggio.
 */
export const getFallbackWaifuMessage = (
    waifu: Waifu,
    emotionalState: GameEmotionalState,
    lang: Language
): string => {
    const messages = waifu.fallbackMessages[lang][emotionalState]
        || waifu.fallbackMessages[lang].neutral
        || [];

    if (messages.length === 0) {
        return lang === 'it' ? "Bel turno!" : "Nice trick!";
    }

    return messages[Math.floor(Math.random() * messages.length)];
};
