/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { RANK } from './constants';
// FIX: Added Waifu, GameEmotionalState, and Language to type imports.
import type { Card, Suit, Difficulty, AbilityType, Waifu, GameEmotionalState, Language } from './types';
import { getCardPoints } from './utils';

// FIX: Added missing getFallbackWaifuMessage function.
export const getFallbackWaifuMessage = (
    waifu: Waifu,
    emotionalState: GameEmotionalState,
    lang: Language,
    usedMessages: string[]
): string => {
    const messages = waifu.fallbackMessages[lang][emotionalState];
    if (!messages || messages.length === 0) {
        return '...';
    }
    
    const availableMessages = messages.filter(msg => !usedMessages.includes(msg));
    
    if (availableMessages.length > 0) {
        return availableMessages[Math.floor(Math.random() * availableMessages.length)];
    }
    
    // If all messages have been used, just pick a random one from the full list.
    return messages[Math.floor(Math.random() * messages.length)];
};

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

export type AIMoveResult = {
    cardToPlay: Card;
    newHand?: Card[];
    newDeck?: Card[];
}

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
    difficulty: Difficulty,
    humanHand: Card[] | null = null,
    deck: Card[] | null = null,
): AIMoveResult => {
    if (difficulty === 'apocalypse' && humanHand) {
        // AI is second to play
        if (cardsOnTable.length > 0) {
            // Aggressive play: Human has already played, so it's safe to play high cards to win.
            const humanCard = cardsOnTable[0];
            const leadSuit = humanCard.suit;
            const isCarico = (c: Card) => c.value === 'Asso' || c.value === '3';

            // 1. Try to play a carico of the lead suit from hand
            const carichiOfLeadSuitInHand = aiHand.filter(c => c.suit === leadSuit && isCarico(c))
                .sort((a, b) => RANK[b.value] - RANK[a.value]); // highest first
            if (carichiOfLeadSuitInHand.length > 0) {
                return { cardToPlay: carichiOfLeadSuitInHand[0] };
            }

            // 2. Try to play a briscola carico from hand
            if (humanCard.suit !== briscolaSuit) { // Human did not play briscola
                const briscolaCarichiInHand = aiHand.filter(c => c.suit === briscolaSuit && isCarico(c))
                    .sort((a, b) => RANK[a.value] - RANK[b.value]); // lowest first
                if (briscolaCarichiInHand.length > 0) {
                    return { cardToPlay: briscolaCarichiInHand[0] };
                }
            } else { // Human played a briscola
                const winningBriscolaCarichiInHand = aiHand.filter(c => c.suit === briscolaSuit && isCarico(c) && RANK[c.value] > RANK[humanCard.value])
                    .sort((a, b) => RANK[a.value] - RANK[b.value]); // lowest winning first
                if (winningBriscolaCarichiInHand.length > 0) {
                    return { cardToPlay: winningBriscolaCarichiInHand[0] };
                }
            }
            
            // 3. Try to take a carico from the deck
            if (deck && deck.length > 0) {
                let cardToTake: Card | undefined;

                // Look for carico of lead suit in deck
                const carichiOfLeadSuitInDeck = deck.filter(c => c.suit === leadSuit && isCarico(c))
                    .sort((a,b) => RANK[b.value] - RANK[a.value]); // highest first
                if (carichiOfLeadSuitInDeck.length > 0) {
                    cardToTake = carichiOfLeadSuitInDeck[0];
                }

                // If not found, look for briscola carico in deck
                if (!cardToTake) {
                    if (humanCard.suit !== briscolaSuit) {
                         const briscolaCarichiInDeck = deck.filter(c => c.suit === briscolaSuit && isCarico(c))
                            .sort((a,b) => RANK[a.value] - RANK[b.value]); // lowest first
                        if (briscolaCarichiInDeck.length > 0) {
                            cardToTake = briscolaCarichiInDeck[0];
                        }
                    } else { // Human played briscola, need a winning briscola carico
                        const winningBriscolaCarichiInDeck = deck.filter(c => c.suit === briscolaSuit && isCarico(c) && RANK[c.value] > RANK[humanCard.value])
                            .sort((a,b) => RANK[a.value] - RANK[b.value]); // lowest winning first
                        if (winningBriscolaCarichiInDeck.length > 0) {
                            cardToTake = winningBriscolaCarichiInDeck[0];
                        }
                    }
                }
                
                if (cardToTake) {
                    const cardToTakeIndex = deck.findIndex(c => c.id === cardToTake!.id);
                    
                    const sortedHand = [...aiHand].sort((a, b) => (getCardPoints(a) - getCardPoints(b)) || (RANK[a.value] - RANK[b.value]));
                    const cardToDiscard = sortedHand.find(c => c.suit !== briscolaSuit && getCardPoints(c) === 0) || sortedHand[0];

                    const tempHand = aiHand.filter(c => c.id !== cardToDiscard.id);
                    tempHand.push(cardToTake);
                    const newHand = tempHand;

                    const newDeck = [...deck];
                    newDeck.splice(cardToTakeIndex, 1, cardToDiscard);
                    
                    return {
                        cardToPlay: cardToTake,
                        newHand,
                        newDeck
                    };
                }
            }
            
            // 4. Fallback to normal winning/losing logic
            const sortedHand = [...aiHand].sort((a, b) => (getCardPoints(a) - getCardPoints(b)) || (RANK[a.value] - RANK[b.value]));
            const cardsOfLeadSuit = aiHand.filter(c => c.suit === leadSuit).sort((a, b) => RANK[b.value] - RANK[a.value]);
            if (cardsOfLeadSuit.length > 0) {
                return { cardToPlay: cardsOfLeadSuit[0] };
            }

            const winningBriscolas = aiHand.filter(aiCard => {
                const aiIsBriscola = aiCard.suit === briscolaSuit;
                const humanIsBriscola = humanCard.suit === briscolaSuit;
                if (!aiIsBriscola) return false;
                if (humanIsBriscola) return RANK[aiCard.value] > RANK[humanCard.value];
                return true;
            }).sort((a, b) => RANK[a.value] - RANK[b.value]);

            if (winningBriscolas.length > 0 && getCardPoints(humanCard) >= 10) {
                return { cardToPlay: winningBriscolas[0] };
            }
            
            const nonBriscolaLisci = sortedHand.filter(c => getCardPoints(c) === 0 && c.suit !== briscolaSuit);
            if (nonBriscolaLisci.length > 0) return { cardToPlay: nonBriscolaLisci[0] };
            
            const nonBriscolaCarichi = sortedHand.filter(c => getCardPoints(c) > 0 && c.suit !== briscolaSuit);
            if (nonBriscolaCarichi.length > 0) return { cardToPlay: nonBriscolaCarichi[0] };

            return { cardToPlay: sortedHand[0] };
        }
        // AI is first to play
        else {
            const isCarico = (c: Card) => c.value === 'Asso' || c.value === '3';
            const humanHasBriscola = humanHand.some(c => c.suit === briscolaSuit);

            if (humanHasBriscola) {
                // DEFENSIVE PLAY: Human can trump anything. Avoid giving up points.
                const humanCarichiSuits = new Set(humanHand.filter(isCarico).map(c => c.suit));

                // Priority 1: Play lowest-rank "safe" liscio (a suit where human has no carico).
                const nonBriscolaLisci = aiHand.filter(c => c.suit !== briscolaSuit && getCardPoints(c) === 0);
                const safeLisci = nonBriscolaLisci.filter(c => !humanCarichiSuits.has(c.suit)).sort((a, b) => RANK[a.value] - RANK[b.value]);
                if (safeLisci.length > 0) {
                    return { cardToPlay: safeLisci[0] };
                }

                // Priority 2: No safe lisci. Play lowest-rank briscola to probe or waste a turn.
                const briscolaCards = aiHand.filter(c => c.suit === briscolaSuit).sort((a, b) => RANK[a.value] - RANK[b.value]);
                if (briscolaCards.length > 0) {
                    return { cardToPlay: briscolaCards[0] };
                }
                
                // Priority 3: No safe lisci and no briscola. Must play a card that might give up points.
                // Sacrifice an "unsafe" liscio (we have no choice). Play lowest one.
                if (nonBriscolaLisci.length > 0) {
                     const sortedUnsafeLisci = nonBriscolaLisci.sort((a, b) => RANK[a.value] - RANK[b.value]);
                     return { cardToPlay: sortedUnsafeLisci[0] };
                }

                // Priority 4: No lisci at all. Sacrifice lowest-point non-briscola card.
                const nonBriscolaPointCards = aiHand
                    .filter(c => c.suit !== briscolaSuit)
                    .sort((a, b) => getCardPoints(a) - getCardPoints(b) || RANK[a.value] - RANK[b.value]);
                if (nonBriscolaPointCards.length > 0) {
                    return { cardToPlay: nonBriscolaPointCards[0] };
                }
                
                // Fallback: Hand contains only briscola point cards. This is handled by Priority 2.
                const sortedHand = [...aiHand].sort((a, b) => (getCardPoints(a) - getCardPoints(b)) || (RANK[a.value] - RANK[b.value]));
                return { cardToPlay: sortedHand[0] };

            } else {
                // AGGRESSIVE/SAFE PLAY: Human cannot trump.
                // Play safely against human's carichi.
    
                const humanCarichiBySuit: Partial<Record<Suit, Card[]>> = {};
                for (const card of humanHand) {
                    if (isCarico(card)) {
                        if (!humanCarichiBySuit[card.suit]) {
                            humanCarichiBySuit[card.suit] = [];
                        }
                        humanCarichiBySuit[card.suit]!.push(card);
                    }
                }
        
                const nonBriscolaCards = aiHand.filter(c => c.suit !== briscolaSuit);
                const briscolaCards = aiHand.filter(c => c.suit === briscolaSuit).sort((a, b) => RANK[a.value] - RANK[b.value]);
        
                const safeCards = nonBriscolaCards.filter(c => !humanCarichiBySuit[c.suit]);
                
                if (safeCards.length > 0) {
                    const safeLisci = safeCards.filter(c => getCardPoints(c) === 0).sort((a,b) => RANK[a.value] - RANK[b.value]);
                    if (safeLisci.length > 0) return { cardToPlay: safeLisci[0] };
        
                    const safePointCards = safeCards.filter(c => getCardPoints(c) > 0).sort((a, b) => RANK[b.value] - RANK[a.value]);
                    if (safePointCards.length > 0) return { cardToPlay: safePointCards[0] };
                }
        
                if (briscolaCards.length > 0) {
                    return { cardToPlay: briscolaCards[0] };
                }
        
                if (nonBriscolaCards.length > 0) {
                    const sortedUnsafeCards = [...nonBriscolaCards].sort((a, b) => getCardPoints(a) - getCardPoints(b) || RANK[a.value] - RANK[b.value]);
                    return { cardToPlay: sortedUnsafeCards[0] };
                }
        
                const sortedHand = [...aiHand].sort((a, b) => (getCardPoints(a) - getCardPoints(b)) || (RANK[a.value] - RANK[b.value]));
                return { cardToPlay: sortedHand[0] };
            }
        }
    }
    
    // Difficoltà Facile: gioca una carta casuale
    if (difficulty === 'easy') {
        return { cardToPlay: aiHand[Math.floor(Math.random() * aiHand.length)] };
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
            // Difficoltà Difficile: strategia più conservativa con le briscole
            if (difficulty === 'hard') {
                const bestWinningCard = winningCards[0];
                const totalTrickPoints = getCardPoints(humanCard) + getCardPoints(bestWinningCard);
                const isUsingBriscola = bestWinningCard.suit === briscolaSuit;
                
                // Non usare NESSUNA briscola per un turno con pochi punti (<10), se possibile.
                if (isUsingBriscola && totalTrickPoints < 10) {
                    const nonBriscolaLosingCards = sortedHand.filter(c => c.suit !== briscolaSuit && !winningCards.includes(c));
                    if (nonBriscolaLosingCards.length > 0) {
                        return { cardToPlay: nonBriscolaLosingCards[0] }; // Scarta un liscio
                    }
                }
            }
            // Difficoltà Media e Difficile (se non scarta): gioca la carta vincente di minor valore
            return { cardToPlay: winningCards[0] };
        }

        // Se l'IA non può vincere, scarta la carta di minor valore
        return { cardToPlay: sortedHand[0] };
    } 
    // Se l'IA è il primo giocatore
    else {
        // Difficoltà Difficile: evita di iniziare con carte di valore
        if (difficulty === 'hard') {
             const briscolaInHand = sortedHand.filter(c => c.suit === briscolaSuit);
             const nonBriscolaInHand = sortedHand.filter(c => c.suit !== briscolaSuit);

             if (nonBriscolaInHand.length === 0) {
                 return { cardToPlay: briscolaInHand[0] }; // Costretto a giocare briscola
             }
             const lowPointNonBriscola = nonBriscolaInHand.filter(c => getCardPoints(c) < 2);
             if (lowPointNonBriscola.length > 0) {
                 return { cardToPlay: lowPointNonBriscola[0] }; // Gioca un liscio non di briscola
             }
             return { cardToPlay: nonBriscolaInHand[0] }; // Costretto a giocare un carico non di briscola
        }

        // Difficoltà Media: gioca la non-briscola più bassa, o la briscola più bassa se costretto
        const nonBriscolaCards = sortedHand.filter(card => card.suit !== briscolaSuit);
        if (nonBriscolaCards.length > 0) {
            return { cardToPlay: nonBriscolaCards[0] };
        }
        return { cardToPlay: sortedHand[0] };
    }
};