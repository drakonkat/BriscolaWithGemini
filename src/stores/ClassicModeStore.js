/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { runInAction, reaction, makeObservable, action, computed, override } from 'mobx';
import { getCardPoints, shuffleDeck } from '../core/utils.js';
import { getTrickWinner as getClassicTrickWinner } from '../core/classicGameLogic.js';
import { GameStateStore } from './GameStateStore.js';
import { createDeck } from '../core/classicGameLogic.js';
import { getImageUrl } from '../core/utils.js';
import { playSound } from '../core/soundManager.js';
import { WAIFUS } from '../core/waifus.js';
import { getLocalAIMove } from '../core/localAI.js';

export class ClassicModeStore extends GameStateStore {

    constructor(rootStore) {
        super(rootStore);
        makeObservable(this, {
            startGame: action,
            _initializeNewGame: action,
            resolveTrick: action,
            handleEndOfGame: action,
            getCardPoints: action,
            // FIX: Use 'override' for methods and getters already annotated in the base class.
            saveGame: override,
            loadGame: override,
            clearSavedGame: override,
            resumeGame: override,
            hasSavedGame: override,
        });

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

    startGame(param) {
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

    _initializeNewGame(waifu) {
        this._resetState();
        this.currentWaifu = waifu;
        this.backgroundUrl = getImageUrl(`/background/landscape${Math.floor(Math.random() * 21) + 1}.png`);

        const newDeck = createDeck();
        const shuffledDeck = shuffleDeck(newDeck);

        const playerHand = shuffledDeck.splice(0, 3);
        const computerHand = shuffledDeck.splice(0, 3);
        const briscola = shuffledDeck.length > 0 ? shuffledDeck.pop() : null;

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

        const trickWinner = getClassicTrickWinner(this.cardsOnTable, this.trickStarter, this.briscolaSuit);
        const points = this.getCardPoints(humanCard) + this.getCardPoints(aiCard);

        const newHistoryEntry = {
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
                this.message = this.T.aiWonTrick(this.currentWaifu.name, points);
                playSound('trick-lose');
            }

            this.cardsOnTable = [];

            // The logic to continue the game is now handled inside drawCards to ensure proper sequencing.
            this.drawCards(trickWinner);

        }), 1500);
    }

    handleAiTurn() {
        if (this.phase !== 'playing' || this.turn !== 'ai' || this.cardsOnTable.length === 2) return;
        this.isProcessing = true;

        const { difficulty } = this.rootStore.gameSettingsStore;
        const humanHandForAI = difficulty === 'apocalypse' ? this.humanHand : null;
        const deckForAI = (difficulty === 'apocalypse' || difficulty === 'nightmare') ? this.deck : null;

        const aiMoveResult = getLocalAIMove(this.aiHand, this.briscolaSuit, this.cardsOnTable, difficulty, humanHandForAI, deckForAI);

        if (aiMoveResult.newHand && aiMoveResult.newDeck) {
            this.aiHand = aiMoveResult.newHand;
            this.deck = aiMoveResult.newDeck;
        }

        this.playAiCard(aiMoveResult.cardToPlay);
    }

    handleEndOfGame() {
        if (this.humanHand.length === 0 && this.aiHand.length === 0 && !this.isResolvingTrick) {
            let winner = 'tie';
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

    getCardPoints(card) {
        return getCardPoints(card);
    }

    // FIX: Implemented abstract methods from GameStateStore to resolve inheritance error.
    get hasSavedGame() {
        try {
            return localStorage.getItem('classic_save') !== null;
        } catch (error) {
            console.warn('Could not access localStorage for saved game check.', error);
            return false;
        }
    }

    saveGame() {
        if (this.phase !== 'playing') return;
        const stateToSave = {
            phase: 'playing',
            turn: this.turn,
            trickStarter: this.trickStarter,
            humanHand: this.humanHand,
            aiHand: this.aiHand,
            deck: this.deck,
            cardsOnTable: this.cardsOnTable,
            briscolaCard: this.briscolaCard,
            briscolaSuit: this.briscolaSuit,
            humanScore: this.humanScore,
            aiScore: this.aiScore,
            trickHistory: this.trickHistory,
            currentWaifu: this.currentWaifu,
            trickCounter: this.trickCounter,
        };
        try {
            localStorage.setItem('classic_save', JSON.stringify(stateToSave));
        } catch (error) {
            console.error("Failed to save classic game:", error);
        }
    }

    loadGame() {
        try {
            const savedGame = localStorage.getItem('classic_save');
            if (savedGame) {
                const savedState = JSON.parse(savedGame);
                runInAction(() => {
                    this.phase = savedState.phase;
                    this.turn = savedState.turn;
                    this.trickStarter = savedState.trickStarter;
                    this.humanHand = savedState.humanHand;
                    this.aiHand = savedState.aiHand;
                    this.deck = savedState.deck;
                    this.cardsOnTable = savedState.cardsOnTable;
                    this.briscolaCard = savedState.briscolaCard;
                    this.briscolaSuit = savedState.briscolaSuit;
                    this.humanScore = savedState.humanScore;
                    this.aiScore = savedState.aiScore;
                    this.trickHistory = savedState.trickHistory;
                    this.currentWaifu = savedState.currentWaifu;
                    this.trickCounter = savedState.trickCounter;
                    this.backgroundUrl = getImageUrl(`/background/landscape${Math.floor(Math.random() * 21) + 1}.png`);
                    if (this.currentWaifu) {
                        this.message = this.turn === 'human' ? this.T.yourTurnMessage : this.T.aiStarts(this.currentWaifu.name);
                        this.rootStore.chatStore.resetChat(this.currentWaifu);
                    } else {
                        this.message = this.T.yourTurnMessage;
                    }
                });
                return true;
            }
        } catch (error) {
            console.error("Failed to load classic game:", error);
            this.clearSavedGame();
        }
        return false;
    }

    clearSavedGame() {
        try {
            localStorage.removeItem('classic_save');
        } catch (error) {
            console.error("Failed to clear saved classic game:", error);
        }
    }

    resumeGame() {
        if (this.loadGame()) {
            this.rootStore.posthog?.capture('game_resumed', { gameplay_mode: 'classic' });
        }
    }
}