/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { runInAction, reaction } from 'mobx';
import { getCardPoints, shuffleDeck } from '../core/utils';
import type { Waifu, Card, TrickHistoryEntry } from '../core/types';
import { getTrickWinner as getClassicTrickWinner } from '../core/classicGameLogic';
import { GameStateStore } from './GameStateStore';
import { createDeck } from '../core/classicGameLogic';
import { getImageUrl } from '../core/utils';
import { playSound } from '../core/soundManager';
import { WAIFUS } from '../core/waifus';
import type { RootStore } from '.';

export class ClassicModeStore extends GameStateStore {

    constructor(rootStore: RootStore) {
        super(rootStore);

        this.addReactionDisposer(reaction(
            () => this.cardsOnTable.length,
            (length) => {
                if (this.phase === 'playing' && length === 2 && !this.isResolvingTrick) {
                    this.resolveTrick();
                }
            }
        ));
        this.addReactionDisposer(reaction(() => ({phase: this.phase, turn: this.turn, cardsOnTable: this.cardsOnTable.length}), this.handleAiTurn.bind(this)));
    }

    startGame(param: Waifu | null | 'R' | 'SR' | 'SSR') {
        const selectedWaifu = typeof param === 'object' && param ? param : null;
        this.clearSavedGame();
        const waifu = selectedWaifu ?? WAIFUS[Math.floor(Math.random() * WAIFUS.length)];
        this._initializeNewGame(waifu);
        
        this.rootStore.posthog?.capture('game_started', { 
            gameplay_mode: 'classic', 
            difficulty: this.rootStore.gameSettingsStore.difficulty,
            waifu: waifu.name,
        });
    }
    
    _initializeNewGame(waifu: Waifu) {
        this._resetState();
        this.currentWaifu = waifu;
        this.backgroundUrl = getImageUrl(`/background/landscape${Math.floor(Math.random() * 21) + 1}.png`);
        
        const newDeck = createDeck();
        const shuffledDeck = shuffleDeck(newDeck);

        const playerHand = shuffledDeck.splice(0, 3);
        const computerHand = shuffledDeck.splice(0, 3);
        const briscola = shuffledDeck.length > 0 ? shuffledDeck.pop()! : null;

        this.deck = shuffledDeck;
        this.humanHand = playerHand;
        this.aiHand = computerHand;
        this.briscolaCard = briscola;
        this.briscolaSuit = briscola?.suit ?? (this.deck.length > 0 ? this.deck[this.deck.length - 1].suit : 'Spade');
        this.trickStarter = 'human';
        this.turn = 'human';
        this.message = this.T.yourTurnMessage;
        
        this.rootStore.chatStore.resetChat(waifu);
        
        this.phase = 'playing';
    }

    resolveTrick() {
        if (this.cardsOnTable.length < 2 || this.isResolvingTrick) return;

        this.isResolvingTrick = true;
        const trickId = this.cardsOnTable.map(c => c.id).sort().join('-');
        if (this.lastResolvedTrick.includes(trickId)) {
            this.isResolvingTrick = false;
            return;
        }
        this.lastResolvedTrick.push(trickId);
        this.trickCounter++;
        
        const humanCard = this.trickStarter === 'human' ? this.cardsOnTable[0] : this.cardsOnTable[1];
        const aiCard = this.trickStarter === 'ai' ? this.cardsOnTable[0] : this.cardsOnTable[1];
        
        const trickWinner = getClassicTrickWinner(this.cardsOnTable, this.trickStarter, this.briscolaSuit!);
        const points = this.getCardPoints(humanCard) + this.getCardPoints(aiCard);

        const newHistoryEntry: TrickHistoryEntry = {
            trickNumber: this.trickCounter,
            humanCard,
            aiCard,
            winner: trickWinner,
            points,
            basePoints: points,
            bonusPoints: 0,
            bonusPointsReason: ''
        };
        this.trickHistory.push(newHistoryEntry);
        this.lastTrick = newHistoryEntry;
        
        setTimeout(() => runInAction(() => {
            if (trickWinner === 'human') {
                this.humanScore += points;
                this.message = this.T.youWonTrick(points);
                playSound('trick-win');
            } else {
                this.aiScore += points;
                this.message = this.T.aiWonTrick(this.currentWaifu!.name, points);
                playSound('trick-lose');
            }

            this.cardsOnTable = [];
            
            // The logic to continue the game is now handled inside drawCards to ensure proper sequencing.
            this.drawCards(trickWinner);

        }), 1500);
    }
    
    handleEndOfGame() {
        if (this.humanHand.length === 0 && this.aiHand.length === 0 && !this.isResolvingTrick) {
            let winner: 'human' | 'ai' | 'tie' = 'tie';
            if (this.humanScore > this.aiScore) winner = 'human';
            if (this.aiScore > this.humanScore) winner = 'ai';
            if (this.humanScore === 60 && this.aiScore === 60) winner = 'tie';
            if (this.humanScore === this.aiScore && this.humanScore > 60) winner = 'human';

            let winnings = 0;
            const { difficulty, gameplayMode } = this.rootStore.gameSettingsStore;

            this.clearSavedGame();

            if (winner === 'human') {
                this.rootStore.missionStore.incrementProgress('gamesWon');
                if (gameplayMode === 'classic') this.rootStore.missionStore.incrementProgress('classicGamesWon');
                if (difficulty === 'hard' || difficulty === 'nightmare' || difficulty === 'apocalypse') this.rootStore.missionStore.incrementProgress('winOnDifficulty_hard');
                if (difficulty === 'nightmare') this.rootStore.missionStore.incrementProgress('winOnDifficulty_nightmare');
                if (difficulty === 'apocalypse') this.rootStore.missionStore.incrementProgress('winOnDifficulty_apocalypse');
                if (this.currentWaifu) this.rootStore.missionStore.trackUnique('waifusDefeated', this.currentWaifu.name);
            }

            let difficultyMultiplier = 1.0;
            if (difficulty === 'easy') difficultyMultiplier = 0.5;
            else if (difficulty === 'hard' || difficulty === 'nightmare' || difficulty === 'apocalypse') difficultyMultiplier = 1.5;

            if (winner === 'human') {
                if (difficulty === 'apocalypse') winnings = 500;
                else if (difficulty === 'nightmare') winnings = 250;
                else {
                    if (this.humanScore >= 101) winnings = Math.round(100 * difficultyMultiplier);
                    else if (this.humanScore >= 81) winnings = Math.round(70 * difficultyMultiplier);
                    else winnings = Math.round(45 * difficultyMultiplier);
                }
            } else {
                winnings = Math.round(20 * difficultyMultiplier);
            }
            this.rootStore.gachaStore.addCoins(winnings);
            this.lastGameWinnings = winnings;
            this.gameResult = winner;
            this.phase = 'gameOver';

            this.rootStore.posthog?.capture('game_over', { 
                human_score: this.humanScore, 
                ai_score: this.aiScore, 
                winner, 
                winnings,
                gameplay_mode: gameplayMode,
                is_dungeon_run: false,
            });
        }
    }

    getCardPoints(card: Card): number {
        return getCardPoints(card);
    }
}