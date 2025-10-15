/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { runInAction } from 'mobx';
import { ClassicModeStore } from './ClassicModeStore';
import type { RootStore } from '.';
import type { DungeonRunState, Waifu, DungeonModifier, Card, TrickHistoryEntry, Element, ElementalClashResult } from '../core/types';
import { WAIFUS, BOSS_WAIFU } from '../core/waifus';
import { getImageUrl, shuffleDeck } from '../core/utils';
import { DUNGEON_MODIFIERS } from '../core/dungeonModifiers';
import { playSound } from '../core/soundManager';
import { initializeRoguelikeDeck, calculateRoguelikeTrickPoints, getRoguelikeTrickWinner, determineWeaknessWinner } from '../core/roguelikeGameLogic';
import { getCardPoints } from '../core/utils';

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

export class DungeonModeStore extends ClassicModeStore {
    dungeonRunState: DungeonRunState = this.loadDungeonState();
    nextDungeonMatchInfo: { opponent: Waifu, modifier: DungeonModifier } | null = null;
    
    // Roguelike properties needed for modifiers
    humanScorePile: Card[] = [];
    aiScorePile: Card[] = [];
    activeElements: Element[] = [];
    elementalClash: ElementalClashResult | null = null;
    trickResolutionTimer: number | null = null;
    trickResolutionCallback: (() => void) | null = null;

    constructor(rootStore: RootStore) {
        super(rootStore);
    }

    saveDungeonState() {
        localStorage.setItem('dungeon_run_state', JSON.stringify(this.dungeonRunState));
    }

    loadDungeonState(): DungeonRunState {
        return loadFromLocalStorage('dungeon_run_state', {
            isActive: false,
            keyRarity: null,
            currentMatch: 0,
            totalMatches: 0,
            wins: 0,
            waifuOpponents: [],
            modifiers: [],
        });
    }

    clearDungeonState() {
        this.dungeonRunState = {
            isActive: false,
            keyRarity: null,
            currentMatch: 0,
            totalMatches: 0,
            wins: 0,
            waifuOpponents: [],
            modifiers: [],
        };
        this.saveDungeonState();
    }

    startGame(param: Waifu | null | 'R' | 'SR' | 'SSR') {
        const rarity = typeof param === 'string' ? param : 'R'; // Fallback
        this.rootStore.uiStore.closeModal('challengeKeySelection');
        this.startDungeonRun(rarity);
    }

    startDungeonRun(rarity: 'R' | 'SR' | 'SSR') {
        const totalMatches = rarity === 'R' ? 3 : rarity === 'SR' ? 4 : 5;
        const opponents: Waifu[] = [];
        if (rarity === 'SSR') {
            const regularOpponents = shuffleDeck(WAIFUS).slice(0, totalMatches - 1);
            opponents.push(...regularOpponents, BOSS_WAIFU);
        } else {
             opponents.push(...shuffleDeck(WAIFUS).slice(0, totalMatches));
        }

        const T_dungeon_modifiers = this.T.dungeonRun.modifiers;

        // Get all possible modifiers and shuffle them once.
        const availableModifierInfos = shuffleDeck(DUNGEON_MODIFIERS.filter(m => m.id !== 'NONE'));

        // Select modifiers for the run, ensuring uniqueness as much as possible.
        const selectedModifierInfos: Pick<DungeonModifier, 'id'>[] = [];
        for (let i = 0; i < totalMatches; i++) {
            // Cycle through the shuffled modifiers. This prevents repeats for up to 4 matches.
            // For the 5th match (SSR run), it will repeat the first modifier.
            selectedModifierInfos.push(availableModifierInfos[i % availableModifierInfos.length]);
        }

        // Create the final modifier objects with translated names and descriptions.
        const modifiers: DungeonModifier[] = selectedModifierInfos.map(modifierInfo => {
            const translationString = T_dungeon_modifiers[modifierInfo.id];
            const [name, ...descriptionParts] = translationString.split(': ');
            const description = descriptionParts.join(': ');
            return { id: modifierInfo.id, name, description: description || '' };
        });

        this.dungeonRunState = {
            isActive: true,
            keyRarity: rarity,
            currentMatch: 0,
            totalMatches,
            wins: 0,
            waifuOpponents: opponents.map(w => w.name),
            modifiers,
        };
        this.saveDungeonState();
        this.prepareNextDungeonMatch();
    }

    prepareNextDungeonMatch = () => {
        this.rootStore.uiStore.closeModal('dungeonProgress');
        if (!this.dungeonRunState.isActive) return;

        const nextMatchIndex = this.dungeonRunState.currentMatch;
        if (nextMatchIndex >= this.dungeonRunState.totalMatches) {
            this.endDungeonRun(true);
            return;
        }

        runInAction(() => {
            const waifuName = this.dungeonRunState.waifuOpponents[nextMatchIndex];
            const opponent = WAIFUS.find(w => w.name === waifuName) ?? BOSS_WAIFU;
            const modifier = this.dungeonRunState.modifiers[nextMatchIndex];
            
            this.nextDungeonMatchInfo = { opponent, modifier };
            this.rootStore.uiStore.openModal('dungeonMatchStart');
        });
    }

    startPreparedDungeonMatch = () => {
        if (!this.nextDungeonMatchInfo) return;

        runInAction(() => {
            this.rootStore.uiStore.closeModal('dungeonMatchStart');
            this.dungeonRunState.currentMatch++;
            this.saveDungeonState();
            this._initializeNewGame(this.nextDungeonMatchInfo!.opponent);
            playSound('game-start');
            this.nextDungeonMatchInfo = null;
        });
    }

    _initializeNewGame(waifu: Waifu) {
        super._initializeNewGame(waifu);
        runInAction(() => {
            this.humanScorePile = [];
            this.aiScorePile = [];
            this.elementalClash = null;
            if(this.trickResolutionTimer) clearTimeout(this.trickResolutionTimer);
            this.trickResolutionCallback = null;
            this.trickResolutionTimer = null;
            
            const modifier = this.dungeonRunState.modifiers[this.dungeonRunState.currentMatch - 1];
            if (modifier && modifier.id === 'ELEMENTAL_FURY') {
                const allCards = [...this.deck, ...this.humanHand, ...this.aiHand];
                if (this.briscolaCard) allCards.push(this.briscolaCard);
    
                const { deck: deckWithElements, activeElements } = initializeRoguelikeDeck(allCards, 3);
                this.activeElements = activeElements;
    
                const safeCardMap = (card: Card) => {
                    const cardWithElement = deckWithElements.find(wc => wc.id === card.id);
                    if (!cardWithElement) {
                        console.error('DungeonModeStore: Could not find card with element for ID:', card.id);
                        return card; // return original card if not found
                    }
                    return cardWithElement;
                };

                // Re-assign cards with elements back to their places safely
                this.humanHand = this.humanHand.map(safeCardMap);
                this.aiHand = this.aiHand.map(safeCardMap);
                this.deck = this.deck.map(safeCardMap);
                if (this.briscolaCard) {
                    this.briscolaCard = safeCardMap(this.briscolaCard);
                }
            }

            if (modifier && modifier.id === 'CURSED_HAND') {
                if (this.humanHand.length > 0) {
                    const cursedIndex = Math.floor(Math.random() * this.humanHand.length);
                    this.humanHand[cursedIndex].isCursed = true;
                }
            }
        });
    }

    selectCardForPlay(card: Card, activatePower?: boolean) {
        const modifier = this.dungeonRunState.modifiers[this.dungeonRunState.currentMatch - 1];
        const isCursedHandMode = modifier?.id === 'CURSED_HAND';
        const wasCardCursed = card.isCursed;

        // The validation check should only run in cursed hand mode.
        if (isCursedHandMode && wasCardCursed) {
            const cardsOfSameSuit = this.humanHand.filter(c => c.suit === card.suit);
            if (cardsOfSameSuit.length > 1) {
                this.rootStore.uiStore.showSnackbar(this.T.cursedCardError, 'warning');
                return;
            }
        }

        // This call will modify `this.humanHand` synchronously
        super.selectCardForPlay(card, activatePower);

        // After playing the card, apply the new curse if applicable.
        if (isCursedHandMode && wasCardCursed && this.humanHand.length > 0) {
            runInAction(() => {
                // Ensure no other card is cursed (defensive programming)
                this.humanHand.forEach(c => c.isCursed = false);
                const newCursedIndex = Math.floor(Math.random() * this.humanHand.length);
                this.humanHand[newCursedIndex].isCursed = true;
            });
        }
    }

    resolveTrick() {
        if (this.cardsOnTable.length < 2 || this.isResolvingTrick) return;
        this.isResolvingTrick = true;
        
        const modifier = this.dungeonRunState.modifiers[this.dungeonRunState.currentMatch - 1];

        const humanCard = this.trickStarter === 'human' ? this.cardsOnTable[0] : this.cardsOnTable[1];
        const aiCard = this.trickStarter === 'ai' ? this.cardsOnTable[0] : this.cardsOnTable[1];

        const trickWinner = getRoguelikeTrickWinner(this.cardsOnTable, this.trickStarter, this.briscolaSuit!, []);
        let points = 0;
        let newHistoryEntry: TrickHistoryEntry;
        
        let trickResolutionDelay = 1500;

        if (modifier?.id === 'ELEMENTAL_FURY') {
            this.elementalClash = null;
            let clashWinner: 'human' | 'ai' | 'tie' | null = null;

            if (humanCard.element && aiCard.element) {
                const weaknessWinner = determineWeaknessWinner(humanCard.element, aiCard.element);
                if (weaknessWinner) {
                    clashWinner = weaknessWinner;
                    this.elementalClash = { type: 'weakness', winner: weaknessWinner, winningElement: weaknessWinner === 'human' ? humanCard.element : aiCard.element, losingElement: weaknessWinner === 'human' ? aiCard.element : humanCard.element };
                } else {
                    playSound('dice-roll');
                    const humanRoll = Math.floor(Math.random() * 100) + 1;
                    const aiRoll = Math.floor(Math.random() * 100) + 1;
                    if (humanRoll > aiRoll) clashWinner = 'human';
                    else if (aiRoll > humanRoll) clashWinner = 'ai';
                    else clashWinner = 'tie';
                    this.elementalClash = { type: 'dice', humanRoll, aiRoll, winner: clashWinner };
                }
            }
            
            const { totalPoints, basePoints, bonusPoints, bonusReasons } = calculateRoguelikeTrickPoints(
                humanCard, aiCard, trickWinner, clashWinner, this.briscolaSuit!, [], this.humanScorePile, this.aiScorePile, this.T, true
            );
            points = totalPoints;
            newHistoryEntry = { trickNumber: this.trickCounter + 1, humanCard, aiCard, winner: trickWinner, points, basePoints, bonusPoints, bonusPointsReason: bonusReasons.join(', '), clashResult: this.elementalClash ?? undefined };
        
            trickResolutionDelay = this.elementalClash ? (this.elementalClash.type === 'dice' && this.rootStore.gameSettingsStore.isDiceAnimationEnabled ? 5000 : 2000) : 1500;
        } else {
            points = this.getCardPoints(humanCard) + this.getCardPoints(aiCard);
            newHistoryEntry = { trickNumber: this.trickCounter + 1, humanCard, aiCard, winner: trickWinner, points, basePoints: points, bonusPoints: 0, bonusPointsReason: '' };
        }

        this.trickHistory.push(newHistoryEntry);
        this.lastTrick = newHistoryEntry;
        
        this.trickResolutionCallback = () => runInAction(() => {
            if (this.trickResolutionCallback === null) return;

            if (trickWinner === 'human') {
                this.humanScore += points;
                this.humanScorePile.push(humanCard, aiCard);
                this.message = this.T.youWonTrick(points);
                playSound('trick-win');
            } else {
                this.aiScore += points;
                this.aiScorePile.push(humanCard, aiCard);
                this.message = this.T.aiWonTrick(this.currentWaifu!.name, points);
                playSound('trick-lose');
            }

            this.cardsOnTable = [];
            this.elementalClash = null; // Clear it after showing
            this.trickCounter++;

            const currentModifier = this.dungeonRunState.modifiers[this.dungeonRunState.currentMatch - 1];
            if (currentModifier?.id === 'BRISCOLA_CHAOS' && this.trickCounter > 0 && this.trickCounter % 3 === 0 && this.deck.length > 0) {
                const oldBriscola = this.briscolaCard;
                
                // Create a pool of potential new briscola cards from the deck.
                // Exclude the current briscola card to ensure it changes, if possible.
                let potentialNewBriscolas = this.deck.filter(c => !oldBriscola || c.id !== oldBriscola.id);
                
                // If filtering leaves no cards (i.e., the only card in deck is same as briscola), use the whole deck.
                if (potentialNewBriscolas.length === 0) {
                    potentialNewBriscolas = this.deck;
                }
            
                // Select a new briscola from the potential candidates
                const newBriscolaIndex = Math.floor(Math.random() * potentialNewBriscolas.length);
                const newBriscola = potentialNewBriscolas[newBriscolaIndex];
                
                // Update the deck: remove the new briscola, add the old one back.
                const newDeck = this.deck.filter(c => c.id !== newBriscola.id);
                if (oldBriscola) {
                    newDeck.push(oldBriscola);
                }
                this.deck = shuffleDeck(newDeck);
                
                // Set the new briscola card and suit
                this.briscolaCard = newBriscola;
                this.briscolaSuit = newBriscola.suit;
            }

            if(this.trickResolutionTimer) clearTimeout(this.trickResolutionTimer);
            this.trickResolutionTimer = null;
            this.trickResolutionCallback = null;

            this.drawCards(trickWinner);

        });

        this.trickResolutionTimer = window.setTimeout(this.trickResolutionCallback, trickResolutionDelay);
    }
    
    forceCloseClashModal = () => {
        if (this.trickResolutionTimer && this.trickResolutionCallback) {
            clearTimeout(this.trickResolutionTimer);
            this.trickResolutionTimer = null; 
            this.trickResolutionCallback();
        } else {
            this.elementalClash = null;
        }
    }

    getCardPoints(card: Card): number {
        const modifier = this.dungeonRunState.modifiers[this.dungeonRunState.currentMatch - 1];
        if (modifier?.id === 'VALUE_INVERSION') {
            const invertedPoints: { [key: string]: number } = {
                'Asso': 0, '3': 0, 'Re': 0, 'Cavallo': 0, 'Fante': 0,
                '7': 2, '6': 3, '5': 4, '4': 10, '2': 11,
            };
            return invertedPoints[card.value];
        }
        return getCardPoints(card);
    }


    handleEndOfGame() {
        if (this.humanHand.length === 0 && this.aiHand.length === 0 && !this.isResolvingTrick) {
            let winner: 'human' | 'ai' | 'tie' = 'tie';
            if (this.humanScore > this.aiScore) winner = 'human';
            if (this.aiScore > this.humanScore) winner = 'ai';
            if (this.humanScore === 60 && this.aiScore === 60) winner = 'tie';
            if (this.humanScore === this.aiScore && this.humanScore > 60) winner = 'human';

            this.gameResult = winner;

            if (!this.dungeonRunState.isActive) {
                 super.handleEndOfGame();
                 return;
            }
            
            const didWinMatch = this.gameResult === 'human';

            if (didWinMatch) {
                this.dungeonRunState.wins++;
            }

            const rewards = {
                coins: didWinMatch ? 50 + (this.dungeonRunState.currentMatch * 25) : 10,
                shards: { R: 0, SR: 0, SSR: 0 }
            };
            if(didWinMatch) {
                if(this.dungeonRunState.keyRarity === 'R') rewards.shards.R = 1;
                if(this.dungeonRunState.keyRarity === 'SR') rewards.shards.SR = 1;
                if(this.dungeonRunState.keyRarity === 'SSR') rewards.shards.SSR = 1;
            }
            this.rootStore.gachaStore.lastDungeonMatchRewards = rewards;
            this.rootStore.gachaStore.addCoins(rewards.coins);
            if(rewards.shards.R > 0) this.rootStore.gachaStore.addShards('R', rewards.shards.R);
            if(rewards.shards.SR > 0) this.rootStore.gachaStore.addShards('SR', rewards.shards.SR);
            if(rewards.shards.SSR > 0) this.rootStore.gachaStore.addShards('SSR', rewards.shards.SSR);
            
            this.saveDungeonState();
            
            this.phase = 'gameOver';

            if (didWinMatch) {
                if (this.dungeonRunState.currentMatch < this.dungeonRunState.totalMatches) {
                    this.rootStore.uiStore.openModal('dungeonProgress');
                } else {
                    this.endDungeonRun(true);
                }
            }
            // In case of loss, we just set the phase to gameOver.
            // GameModals will pick this up and show the match loss screen.
        }
    }

    endDungeonRun(didWin: boolean) {
        const { keyRarity, wins } = this.dungeonRunState;
        if (!keyRarity) return;
        
        let unlockedBg = null;
        let totalCoins = 0;
        const totalShards = { R: 0, SR: 0, SSR: 0 };
        let totalEssences = 0;

        if (didWin) {
            this.rootStore.gachaStore.spendKey(keyRarity);
            const { background, isNew } = this.rootStore.gachaStore.unlockDungeonBackground(keyRarity);
            if (isNew) {
                unlockedBg = background;
            }

            switch(keyRarity) {
                case 'R':
                    totalCoins = 250;
                    totalShards.R = 5;
                    totalShards.SR = 1;
                    if (!isNew) totalShards.R += 10;
                    break;
                case 'SR':
                    totalCoins = 600;
                    totalShards.R = 10;
                    totalShards.SR = 5;
                    totalEssences = 5;
                    this.rootStore.gachaStore.addKey('R');
                    if (!isNew) totalShards.SR += 5;
                    break;
                case 'SSR':
                    totalCoins = 1200;
                    totalShards.R = 15;
                    totalShards.SR = 10;
                    totalShards.SSR = 1;
                    totalEssences = 10;
                    this.rootStore.gachaStore.addKey('SR');
                    if (!isNew) totalShards.SSR += 1;
                    break;
            }
            
            this.rootStore.gachaStore.addCoins(totalCoins);
            this.rootStore.gachaStore.addShards('R', totalShards.R);
            this.rootStore.gachaStore.addShards('SR', totalShards.SR);
            this.rootStore.gachaStore.addShards('SSR', totalShards.SSR);
            // FIX: Grant transcendental essences instead of fire essences.
            if (totalEssences > 0) this.rootStore.gachaStore.addTranscendentalEssences(totalEssences);

            this.rootStore.missionStore.incrementProgress('dungeonRunsWon');
        }
        
        this.rootStore.gachaStore.lastDungeonRunRewards = {
            coins: totalCoins,
            shards: totalShards,
            unlockedBackground: unlockedBg,
        };

        this.rootStore.posthog?.capture('dungeon_run_completed', {
            rarity: keyRarity,
            wins,
            total_matches: this.dungeonRunState.totalMatches,
            did_win_run: didWin,
        });

        this.clearDungeonState();
        this.rootStore.uiStore.openModal('dungeonEnd');
    }
}
