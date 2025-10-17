/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { RANK } from './constants.js';

export const getFallbackWaifuMessage = (
    waifu,
    emotionalState,
    lang,
    usedMessages
) => {
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

export const getAIAbilityDecision = (
    aiAbility,
    aiHand,
    humanHand,
    deckSize,
    cardsOnTable
) => {
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
    aiHand,
    briscolaSuit,
    cardsOnTable,
    difficulty,
    humanHand = null,
    deck = null,
) => {
    if (difficulty === 'apocalypse' && humanHand) {
        // AI is second to play
        if (cardsOnTable.length > 0) {
            // Aggressive play: Human has already played, so it's safe to play high cards to win.
            const humanCard = cardsOnTable[0];
            const leadSuit = humanCard.suit;
            const isCarico = (c) => c.value === 'Asso' || c.value === '3';

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
                let cardToTake;

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
                    const cardToTakeIndex = deck.findIndex(c => c.id === cardToTake.id);

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
            const isCarico = (c) => c.value === 'Asso' || c.value === '3';
            const humanHasBriscola = humanHand.some(c => c.suit === briscolaSuit);
            const humanCarichiSuits = new Set(humanHand.filter(isCarico).map(c => c.suit));

            const aiBriscolaCards = aiHand.filter(c => c.suit === briscolaSuit).sort((a, b) => RANK[a.value] - RANK[b.value]);
            const aiNonBriscolaCards = aiHand.filter(c => c.suit !== briscolaSuit);

            const safeNonBriscola = aiNonBriscolaCards.filter(c => !humanCarichiSuits.has(c.suit));
            const unsafeNonBriscola = aiNonBriscolaCards.filter(c => humanCarichiSuits.has(c.suit));

            // --- DECISION LOGIC ---

            // 1. Can I play a safe non-briscola card?
            if (safeNonBriscola.length > 0) {
                // If human can't trump, try to score points safely.
                if (!humanHasBriscola) {
                    const safePointCards = safeNonBriscola.filter(c => getCardPoints(c) > 0).sort((a, b) => RANK[b.value] - RANK[a.value]);
                    if (safePointCards.length > 0) {
                        return { cardToPlay: safePointCards[0] };
                    }
                }

                // Either human can trump (so play defensively) or no safe point cards are available. Play lowest safe liscio.
                const safeLisci = safeNonBriscola.filter(c => getCardPoints(c) === 0).sort((a, b) => RANK[a.value] - RANK[b.value]);
                if (safeLisci.length > 0) {
                    return { cardToPlay: safeLisci[0] };
                }

                // This case is rare: AI has safe cards, but they are all point cards, AND human has briscola.
                // It's safer to lead with briscola than a point card that could be left on the table.
                // But the next check for briscola handles this. If we get here, it means we must play a safe point card.
                const sortedSafe = safeNonBriscola.sort((a,b) => getCardPoints(a) - getCardPoints(b) || RANK[a.value] - RANK[b.value]);
                return { cardToPlay: sortedSafe[0] };
            }

            // 2. No safe non-briscola cards available. Play lowest briscola as the next safest move.
            if (aiBriscolaCards.length > 0) {
                return { cardToPlay: aiBriscolaCards[0] };
            }

            // 3. No safe cards and no briscola. Forced to play an unsafe card. Sacrifice the one with least value.
            // This is the only option left besides point-only briscola cards.
            if (unsafeNonBriscola.length > 0) {
                const sortedUnsafe = unsafeNonBriscola.sort((a, b) => getCardPoints(a) - getCardPoints(b) || RANK[a.value] - RANK[b.value]);
                return { cardToPlay: sortedUnsafe[0] };
            }

            // 4. Fallback: AI hand must only contain briscola cards, which should have been handled by step 2.
            // To be safe, just play the lowest value card in hand.
            const sortedHand = [...aiHand].sort((a, b) => (getCardPoints(a) - getCardPoints(b)) || (RANK[a.value] - RANK[b.value]));
            return { cardToPlay: sortedHand[0] };
        }
    }

    if (difficulty === 'nightmare' && deck && deck.length > 0) {
        const isCarico = (c) => c.value === 'Asso' || c.value === '3';

        // AI is second to play
        if (cardsOnTable.length > 0) {
            const humanCard = cardsOnTable[0];

            // Try to win, but if not possible, check deck
            const winningCardsInHand = aiHand.filter(aiCard => {
                const aiIsBriscola = aiCard.suit === briscolaSuit;
                const humanIsBriscola = humanCard.suit === briscolaSuit;
                if (aiIsBriscola && !humanIsBriscola) return true;
                if (!aiIsBriscola && humanIsBriscola) return false;
                if (aiIsBriscola && humanIsBriscola) return RANK[aiCard.value] > RANK[humanCard.value];
                if (aiCard.suit === humanCard.suit) return RANK[aiCard.value] > RANK[humanCard.value];
                return false;
            });

            // If it can't win with hand cards, and trick has points, check deck
            if (winningCardsInHand.length === 0 && getCardPoints(humanCard) > 0) {
                let cardToTake;

                // Look for winning briscola carico
                if (humanCard.suit !== briscolaSuit) {
                    const briscolaCarichiInDeck = deck.filter(c => c.suit === briscolaSuit && isCarico(c))
                        .sort((a,b) => RANK[a.value] - RANK[b.value]); // lowest first
                    if (briscolaCarichiInDeck.length > 0) cardToTake = briscolaCarichiInDeck[0];
                } else { // Human played briscola
                    const winningBriscolaCarichiInDeck = deck.filter(c => c.suit === briscolaSuit && isCarico(c) && RANK[c.value] > RANK[humanCard.value])
                        .sort((a,b) => RANK[a.value] - RANK[b.value]); // lowest winning first
                    if (winningBriscolaCarichiInDeck.length > 0) cardToTake = winningBriscolaCarichiInDeck[0];
                }

                // Look for winning lead suit carico
                if (!cardToTake && humanCard.suit !== briscolaSuit) {
                    const leadSuitCarichiInDeck = deck.filter(c => c.suit === humanCard.suit && isCarico(c) && RANK[c.value] > RANK[humanCard.value])
                        .sort((a,b) => RANK[a.value] - RANK[b.value]);
                    if (leadSuitCarichiInDeck.length > 0) cardToTake = leadSuitCarichiInDeck[0];
                }

                if (cardToTake) {
                    const cardToTakeIndex = deck.findIndex(c => c.id === cardToTake.id);
                    const sortedHand = [...aiHand].sort((a, b) => (getCardPoints(a) - getCardPoints(b)) || (RANK[a.value] - RANK[b.value]));
                    const cardToDiscard = sortedHand.find(c => c.suit !== briscolaSuit && getCardPoints(c) === 0) || sortedHand[0];
                    const newHand = [...aiHand.filter(c => c.id !== cardToDiscard.id), cardToTake];
                    const newDeck = [...deck];
                    newDeck.splice(cardToTakeIndex, 1, cardToDiscard);
                    return { cardToPlay: cardToTake, newHand, newDeck };
                }
            }
        } else { // AI is first to play, proactively improve hand.
            const bestCardInDeck = [...deck].sort((a, b) => {
                const isABriscola = a.suit === briscolaSuit;
                const isBBriscola = b.suit === briscolaSuit;
                if (isABriscola && !isBBriscola) return -1;
                if (!isABriscola && isBBriscola) return 1;
                const pointsA = getCardPoints(a);
                const pointsB = getCardPoints(b);
                if (pointsA !== pointsB) return pointsB - pointsA;
                return RANK[b.value] - RANK[a.value];
            })[0];

            const worstCardInHand = [...aiHand].sort((a,b) => {
                const isABriscola = a.suit === briscolaSuit;
                const isBBriscola = b.suit === briscolaSuit;
                if (isABriscola && !isBBriscola) return 1;
                if (!isABriscola && isBBriscola) return -1;
                const pointsA = getCardPoints(a);
                const pointsB = getCardPoints(b);
                if (pointsA !== pointsB) return pointsA - pointsB;
                return RANK[a.value] - RANK[b.value];
            })[0];

            const isBestDeckCardGood = getCardPoints(bestCardInDeck) >= 10 || (bestCardInDeck.suit === briscolaSuit && RANK[bestCardInDeck.value] >= RANK['Fante']);
            const isWorstHandCardBad = getCardPoints(worstCardInHand) === 0 && worstCardInHand.suit !== briscolaSuit;

            if (isBestDeckCardGood && isWorstHandCardBad) {
                const cardToTake = bestCardInDeck;
                const cardToTakeIndex = deck.findIndex(c => c.id === cardToTake.id);
                const cardToDiscard = worstCardInHand;

                const newHand = [...aiHand.filter(c => c.id !== cardToDiscard.id), cardToTake];
                const newDeck = [...deck];
                newDeck.splice(cardToTakeIndex, 1, cardToDiscard);

                const sortedHand = [...newHand].sort((a, b) => (getCardPoints(a) - getCardPoints(b)) || (RANK[a.value] - RANK[b.value]));
                const nonBriscolaInHand = sortedHand.filter(c => c.suit !== briscolaSuit);
                let cardToPlay;
                if (nonBriscolaInHand.length === 0) {
                      cardToPlay = sortedHand[0];
                } else {
                    const lowPointNonBriscola = nonBriscolaInHand.filter(c => getCardPoints(c) < 2);
                    if (lowPointNonBriscola.length > 0) {
                          cardToPlay = lowPointNonBriscola[0];
                    } else {
                          cardToPlay = nonBriscolaInHand[0];
                    }
                }
                return { cardToPlay, newHand, newDeck };
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