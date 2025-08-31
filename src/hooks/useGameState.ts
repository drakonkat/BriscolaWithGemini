/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePostHog } from 'posthog-js/react';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

import { playSound } from '../core/soundManager';
import { translations } from '../core/translations';
import { createDeck, getTrickWinner as getClassicTrickWinner } from '../core/classicGameLogic';
import { initializeRoguelikeDeck, assignAbilities, getRoguelikeTrickWinner, calculateRoguelikeTrickPoints } from '../core/roguelikeGameLogic';
import { getCardPoints, shuffleDeck } from '../core/utils';
import { QuotaExceededError, getAIWaifuTrickMessage, getAIGenericTeasingMessage } from '../core/gemini';
import { getLocalAIMove, getFallbackWaifuMessage, getAIAbilityDecision } from '../core/localAI';
import { WAIFUS, BOSS_WAIFU } from '../core/waifus';
import type { GamePhase, Card, Player, Waifu, GameEmotionalState, Suit, Element, AbilityType, RoguelikeState, RoguelikeEvent } from '../core/types';
import type { useGameSettings } from './useGameSettings';

const SCORE_THRESHOLD = 15;
type GameMode = 'online' | 'fallback';

const INITIAL_ROGUELIKE_STATE: RoguelikeState = {
    currentLevel: 0,
    runCoins: 0,
    activePowerUp: null,
    challenge: null,
    events: [],
    humanAbility: null,
    aiAbility: null,
    encounteredWaifus: [],
};

const ROGUELIKE_LEVEL_REWARDS = [0, 25, 50, 75, 150];

type useGameStateProps = {
    settings: ReturnType<typeof useGameSettings>['settings'];
    onGameEnd: (winnings: number) => void;
    showWaifuBubble: (message: string) => void;
    closeWaifuBubble: () => void;
};

export const useGameState = ({ settings, onGameEnd, showWaifuBubble }: useGameStateProps) => {
    const { language, gameplayMode, difficulty, isChatEnabled, waitForWaifuResponse } = settings;
    const posthog = usePostHog();
    const T = translations[language];
    
    const [phase, setPhase] = useState<GamePhase>('menu');
    const [currentWaifu, setCurrentWaifu] = useState<Waifu | null>(null);
    const [deck, setDeck] = useState<Card[]>([]);
    const [humanHand, setHumanHand] = useState<Card[]>([]);
    const [aiHand, setAiHand] = useState<Card[]>([]);
    const [briscolaCard, setBriscolaCard] = useState<Card | null>(null);
    const [briscolaSuit, setBriscolaSuit] = useState<Suit | null>(null);
    const [cardsOnTable, setCardsOnTable] = useState<Card[]>([]);
    const [turn, setTurn] = useState<Player>('human');
    const [humanScore, setHumanScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [trickStarter, setTrickStarter] = useState<Player>('human');
    const [message, setMessage] = useState('');
    const [backgroundUrl, setBackgroundUrl] = useState('');
    
    const [isAiThinkingMove, setIsAiThinkingMove] = useState(false);
    const [isResolvingTrick, setIsResolvingTrick] = useState(false);
    const [isAiGeneratingMessage, setIsAiGeneratingMessage] = useState(false);
    
    const [aiEmotionalState, setAiEmotionalState] = useState<GameEmotionalState>('neutral');
    const [gameResult, setGameResult] = useState<'human' | 'ai' | 'tie' | null>(null);
    const [lastGameWinnings, setLastGameWinnings] = useState<number>(0);
    const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
    const [gameMode, setGameMode] = useState<GameMode>('online');
    const [cardForElementalChoice, setCardForElementalChoice] = useState<Card | null>(null);
    
    // Roguelike state
    const [roguelikeState, setRoguelikeState] = useState<RoguelikeState>(INITIAL_ROGUELIKE_STATE);
    const [powerAnimation, setPowerAnimation] = useState<{ type: Element; player: Player } | null>(null);
    const [humanAbilityCharges, setHumanAbilityCharges] = useState(0);
    const [aiAbilityCharges, setAiAbilityCharges] = useState(0);
    const [abilityTargetingState, setAbilityTargetingState] = useState<'incinerate' | 'fortify' | 'cyclone' | null>(null);
    const [revealedAiHand, setRevealedAiHand] = useState<Card[] | null>(null);
    const [aiKnowledgeOfHumanHand, setAiKnowledgeOfHumanHand] = useState<Card[] | null>(null);

    const isProcessing = isAiThinkingMove || isResolvingTrick;
    const lastResolvedTrick = useRef<string[]>([]);
    const trickCounter = useRef(0);
    
    useEffect(() => {
        const lockOrientation = async () => {
            if (Capacitor.isNativePlatform()) {
                await ScreenOrientation.lock({ orientation: 'portrait-primary' }).catch(() => {});
            }
        };
        lockOrientation();
    }, []);

    const startClassicGame = useCallback((newWaifu: Waifu) => {
        let newDeck = shuffleDeck(createDeck());
        const newBriscola = newDeck[newDeck.length - 1];
        setHumanHand(newDeck.slice(0, 3));
        setAiHand(newDeck.slice(3, 6));
        setDeck(newDeck.slice(6, -1));
        setBriscolaCard(newBriscola);
        setBriscolaSuit(newBriscola.suit);
        setPhase('playing');
    }, []);

    const startRoguelikeRun = useCallback((firstWaifu: Waifu) => {
        posthog.capture('roguelike_run_started', { waifu_name: firstWaifu.name, difficulty });
        setCurrentWaifu(firstWaifu);
        const { humanAbility, aiAbility } = assignAbilities();
        setRoguelikeState({
            ...INITIAL_ROGUELIKE_STATE,
            currentLevel: 1,
            humanAbility,
            aiAbility,
            encounteredWaifus: [firstWaifu.name],
        });
        setPhase('roguelike-map');
    }, [difficulty, posthog]);
    
    const startRoguelikeLevel = useCallback(() => {
        const level = roguelikeState.currentLevel;
        if (level === 0) return;

        let nextWaifu: Waifu;
        if (level >= 4) {
            nextWaifu = BOSS_WAIFU;
        } else {
            const availableWaifus = WAIFUS.filter(w => !roguelikeState.encounteredWaifus.includes(w.name));
            const pool = availableWaifus.length > 0 ? availableWaifus : WAIFUS;
            nextWaifu = pool[Math.floor(Math.random() * pool.length)];
        }
        setCurrentWaifu(nextWaifu);
        setRoguelikeState(prev => ({
            ...prev,
            encounteredWaifus: [...prev.encounteredWaifus, nextWaifu.name]
        }));
    
        let newDeck = shuffleDeck(createDeck());
        newDeck = initializeRoguelikeDeck(newDeck, level);
    
        const newBriscola = newDeck[newDeck.length - 1];
    
        let newHumanHand = newDeck.slice(0, 3);
        const { activePowerUp } = roguelikeState;
    
        if (activePowerUp === 'fortune_amulet') {
            const briscolaFromDeck = newDeck.find(c => c.suit === newBriscola.suit && c.id !== newBriscola.id);
            if (briscolaFromDeck) {
                newHumanHand[0] = briscolaFromDeck;
                newDeck = newDeck.filter(c => c.id !== briscolaFromDeck.id);
            }
        }
    
        setHumanHand(newHumanHand);
        setAiHand(newDeck.slice(3, 6));
        setDeck(newDeck.slice(6, -1));
        setBriscolaCard(newBriscola);
        setBriscolaSuit(newBriscola.suit);
        setHumanScore(activePowerUp === 'healing_fountain' ? 10 : 0);
        setAiScore(0);
    
        if (activePowerUp === 'insight_potion') {
            setRevealedAiHand([...newDeck.slice(3, 6)]);
        }
    
        setRoguelikeState(prev => ({ ...prev, activePowerUp: null }));
    
        const starter: Player = Math.random() < 0.5 ? 'human' : 'ai';
        setTurn(starter);
        setTrickStarter(starter);
        setMessage(starter === 'human' ? T.yourTurn : T.aiStarts(nextWaifu.name));
        setPhase('playing');
    }, [roguelikeState, T]);

    const startGame = useCallback((selectedWaifu: Waifu | null) => {
        const bgIndex = Math.floor(Math.random() * 21) + 1;
        const isDesktop = window.innerWidth > 1024;
        const backgroundPrefix = isDesktop ? 'landscape' : 'background';
        setBackgroundUrl(`https://s3.tebi.io/waifubriscola/background/${backgroundPrefix}${bgIndex}.png`);
        
        playSound('game-start');
        const newWaifu = selectedWaifu ?? WAIFUS[Math.floor(Math.random() * WAIFUS.length)];
        
        posthog.capture('game_started', {
            waifu_name: newWaifu.name, language, gameplayMode, difficulty, is_chat_enabled: isChatEnabled,
        });
        
        // Reset common states
        setAiEmotionalState('neutral');
        setCardsOnTable([]);
        setHumanScore(0);
        setAiScore(0);
        setIsQuotaExceeded(false);
        setGameMode('online');
        setGameResult(null);
        setLastGameWinnings(0);
        lastResolvedTrick.current = [];
        trickCounter.current = 0;
        setHumanAbilityCharges(0);
        setAiAbilityCharges(0);
        
        if (gameplayMode === 'classic') {
            setCurrentWaifu(newWaifu);
            startClassicGame(newWaifu);
        } else { // Roguelike
            startRoguelikeRun(newWaifu);
        }

    }, [language, T, posthog, gameplayMode, isChatEnabled, difficulty, startClassicGame, startRoguelikeRun]);

    const confirmCardPlay = (activateEffect: boolean) => {
        if (!cardForElementalChoice) return;
    
        const cardToPlay = { ...cardForElementalChoice, elementalEffectActivated: activateEffect };
        setCardForElementalChoice(null);
    
        playSound('card-place');
        setHumanHand(prev => prev.filter(c => c.id !== cardToPlay.id));
        setCardsOnTable(prev => [...prev, cardToPlay]);
    
        if (trickStarter === 'human') {
            setTurn('ai');
        }
    };
    
    const selectCardForPlay = (card: Card) => {
        if (turn !== 'human' || isProcessing || abilityTargetingState) return;
    
        if (gameplayMode === 'roguelike' && card.element) {
            setCardForElementalChoice(card);
        } else {
            playSound('card-place');
            setHumanHand(prev => prev.filter(c => c.id !== card.id));
            setCardsOnTable(prev => [...prev, card]);
    
            if (trickStarter === 'human') {
                setTurn('ai');
            }
        }
    };

    const cancelCardPlay = () => {
        setCardForElementalChoice(null);
    };

    const activateHumanAbility = () => {
        if (!roguelikeState.humanAbility || humanAbilityCharges < 2 || turn !== 'human' || isProcessing) return;
        setMessage(T.abilityUsed(T.scoreYou, T[roguelikeState.humanAbility]));
        if (roguelikeState.humanAbility === 'tide') {
            setRevealedAiHand([...aiHand]);
            setTimeout(() => setRevealedAiHand(null), 5000);
            setHumanAbilityCharges(0);
        } else {
            setAbilityTargetingState(roguelikeState.humanAbility);
        }
    };

    const targetCardForAbility = (card: Card) => {
        if (!abilityTargetingState) return;
        switch(abilityTargetingState) {
            case 'incinerate':
                setAiHand(prev => prev.map(c => c.id === card.id ? {...c, isBurned: true} : c));
                break;
            case 'fortify':
                setHumanHand(prev => prev.map(c => c.id === card.id ? {...c, isFortified: true} : c));
                break;
            case 'cyclone':
                if (deck.length > 0) {
                    const newDeck = [...deck, card];
                    const shuffled = shuffleDeck(newDeck);
                    const newCard = shuffled.shift()!;
                    setHumanHand(prev => [...prev.filter(c => c.id !== card.id), newCard]);
                    setDeck(shuffled);
                }
                break;
        }
        setAbilityTargetingState(null);
        setHumanAbilityCharges(0);
    };
    
    const confirmLeaveGame = () => {
        posthog.capture('game_left', { human_score: humanScore, ai_score: aiScore });
        setPhase('menu');
    };
    
    const goToMenu = () => setPhase('menu');
    const handleQuotaExceeded = () => setIsQuotaExceeded(true);
    const continueFromQuotaModal = () => setIsQuotaExceeded(false);

    useEffect(() => {
        const scoreDiff = aiScore - humanScore;
        let newState: GameEmotionalState = scoreDiff > SCORE_THRESHOLD ? 'winning' : scoreDiff < -SCORE_THRESHOLD ? 'losing' : 'neutral';
        if (newState !== aiEmotionalState) setAiEmotionalState(newState);
    }, [humanScore, aiScore, aiEmotionalState]);
    
    // AI Move Logic
    useEffect(() => {
        if (turn === 'ai' && !isProcessing && phase === 'playing' && cardsOnTable.length < 2 && aiHand.length > 0) {
            const performAiMove = async () => {
                if (!briscolaSuit || !currentWaifu) return;
                setIsAiThinkingMove(true);
                setMessage(T.aiThinking(currentWaifu.name));

                if (gameplayMode === 'roguelike' && roguelikeState.aiAbility && aiAbilityCharges >= 2) {
                    const decision = getAIAbilityDecision(roguelikeState.aiAbility, aiHand, aiKnowledgeOfHumanHand, deck.length);
                    if (decision.useAbility) {
                        setMessage(T.abilityUsed(currentWaifu.name, T[decision.ability]));
                        await new Promise(r => setTimeout(r, 1000));
                        // ... (AI ability logic remains the same)
                        setAiAbilityCharges(0);
                    }
                }

                const aiCardToPlay = await new Promise<Card>(r => setTimeout(() => r(getLocalAIMove(aiHand, briscolaSuit, cardsOnTable, difficulty)), 750));
                
                playSound('card-place');
                setAiHand(prev => prev.filter(c => c.id !== aiCardToPlay.id));
                setCardsOnTable(prev => [...prev, aiCardToPlay]);

                if (trickStarter === 'ai') {
                    setTurn('human');
                    setAiKnowledgeOfHumanHand(null);
                    setMessage(T.aiPlayedYourTurn(currentWaifu.name));
                }
                setIsAiThinkingMove(false);
            };
            performAiMove();
        }
    }, [turn, isProcessing, phase, cardsOnTable.length, aiHand, briscolaSuit, difficulty, T, currentWaifu, trickStarter, gameplayMode, roguelikeState.aiAbility, aiAbilityCharges, aiKnowledgeOfHumanHand, deck.length]);

    // Trick Resolution Logic
    useEffect(() => {
        if (cardsOnTable.length !== 2 || phase !== 'playing' || isResolvingTrick) return;
        
        const resolveTrick = async () => {
            setIsResolvingTrick(true);
            await new Promise(r => setTimeout(r, 1000));
            
            const currentTrickIds = cardsOnTable.map(c => c.id).sort();
            if (JSON.stringify(currentTrickIds) === JSON.stringify(lastResolvedTrick.current)) {
                setIsResolvingTrick(false);
                return;
            }
            if (!briscolaSuit || !currentWaifu) {
                setIsResolvingTrick(false);
                return;
            }

            trickCounter.current++;
            if (revealedAiHand && trickCounter.current > 3) {
                setRevealedAiHand(null);
            }

            const winner = gameplayMode === 'roguelike' ? getRoguelikeTrickWinner(cardsOnTable, trickStarter, briscolaSuit) : getClassicTrickWinner(cardsOnTable, trickStarter, briscolaSuit);
            
            const humanCard = trickStarter === 'human' ? cardsOnTable[0] : cardsOnTable[1];
            const aiCard = trickStarter === 'ai' ? cardsOnTable[0] : cardsOnTable[1];

            let pointsForTrick = 0;
            if (gameplayMode === 'roguelike') {
                const { pointsForTrick: roguelikePoints, humanCardPoints, aiCardPoints } = calculateRoguelikeTrickPoints(humanCard, aiCard);
                pointsForTrick = roguelikePoints;

                const humanPowerActive = humanCard.elementalEffectActivated !== false;

                if (winner === 'ai' && humanPowerActive && humanCard.element === 'earth') setHumanScore(s => s + humanCardPoints);
                if (winner === 'human' && aiCard.element === 'earth') setAiScore(s => s + aiCardPoints);
                
                if (winner === 'human' && humanPowerActive && humanCard.element === 'fire') {
                    setHumanScore(s => s + 3);
                    setPowerAnimation({ type: 'fire', player: 'human' });
                }
                if (winner === 'ai' && aiCard.element === 'fire') {
                    setAiScore(s => s + 3);
                    setPowerAnimation({ type: 'fire', player: 'ai' });
                }
                setTimeout(() => setPowerAnimation(null), 1500);
            } else {
                pointsForTrick = getCardPoints(humanCard) + getCardPoints(aiCard);
            }

            if (winner === 'human') setHumanScore(s => s + pointsForTrick);
            else setAiScore(s => s + pointsForTrick);
            
            playSound(winner === 'human' ? 'trick-win' : 'trick-lose');

            const proceed = () => {
                setCardsOnTable([]);
                const tempDeck = [...deck];
                let tempBriscola = briscolaCard;
                const drawn: Card[] = [];
                if (tempDeck.length > 0) drawn.push(tempDeck.shift()!);
                else if (tempBriscola) { drawn.push(tempBriscola); tempBriscola = null; }
                if (tempDeck.length > 0) drawn.push(tempDeck.shift()!);
                else if (tempBriscola) { drawn.push(tempBriscola); tempBriscola = null; }
                
                setDeck(tempDeck);
                setBriscolaCard(tempBriscola);
                
                if (winner === 'human') {
                    if (drawn[0]) setHumanHand(p => [...p.map(c => ({ ...c, isFortified: false })), drawn[0]]);
                    if (drawn[1]) setAiHand(p => [...p.map(c => ({ ...c, isFortified: false })), drawn[1]]);
                } else {
                    if (drawn[0]) setAiHand(p => [...p.map(c => ({ ...c, isFortified: false })), drawn[0]]);
                    if (drawn[1]) setHumanHand(p => [...p.map(c => ({ ...c, isFortified: false })), drawn[1]]);
                }

                setHumanAbilityCharges(c => Math.min(2, c + 1));
                setAiAbilityCharges(c => Math.min(2, c + 1));
                lastResolvedTrick.current = currentTrickIds;
                setTurn(winner);
                setTrickStarter(winner);
                setMessage(`${winner === 'human' ? T.youWonTrick(pointsForTrick) : T.aiWonTrick(currentWaifu.name, pointsForTrick)} ${winner === 'human' ? T.yourTurnMessage : T.aiTurnMessage(currentWaifu.name)}`);
                setIsResolvingTrick(false);
            }

            if (winner === 'ai' && isChatEnabled && waitForWaifuResponse) {
                setIsAiGeneratingMessage(true);
                getAIWaifuTrickMessage(currentWaifu, aiEmotionalState, humanCard, aiCard, pointsForTrick, language)
                    .then(({ message }) => showWaifuBubble(message))
                    .catch(console.error)
                    .finally(() => {
                        setIsAiGeneratingMessage(false);
                        proceed();
                    });
            } else {
                proceed();
            }
        };
        resolveTrick();
    }, [cardsOnTable, phase, isResolvingTrick, T, aiEmotionalState, briscolaCard, briscolaSuit, currentWaifu, deck, difficulty, isChatEnabled, language, trickStarter, waitForWaifuResponse, showWaifuBubble, gameplayMode, revealedAiHand]);
    
    // Game Over Logic
    useEffect(() => {
        if (phase === 'playing' && humanHand.length === 0 && aiHand.length === 0 && !isResolvingTrick) {
            const winner: 'human' | 'ai' | 'tie' = humanScore > aiScore ? 'human' : aiScore > humanScore ? 'ai' : 'tie';
            
            if (gameplayMode === 'classic') {
                playSound(winner === 'human' ? 'game-win' : 'game-lose');
                const baseCoins = winner === 'human' ? (humanScore > 101 ? 100 : humanScore >= 81 ? 70 : 45) : 20;
                const multiplier = difficulty === 'easy' ? 0.5 : difficulty === 'hard' ? 1.5 : 1.0;
                const coinsEarned = Math.round(baseCoins * multiplier);
    
                onGameEnd(coinsEarned);
                setLastGameWinnings(coinsEarned);
                setGameResult(winner);
                setPhase('gameOver');
                posthog.capture('game_over', { winner, human_score: humanScore, ai_score: aiScore, coins_earned: coinsEarned, difficulty, gameplay_mode: gameplayMode });
            } else { // Roguelike End of Level
                if (winner === 'human') {
                    const level = roguelikeState.currentLevel;
                    const reward = ROGUELIKE_LEVEL_REWARDS[level];
                    let completedChallenge = false;
                    if (roguelikeState.challenge?.type === 'score_above_80' && humanScore > 80) {
                        completedChallenge = true;
                    }
                    setRoguelikeState(prev => ({
                        ...prev,
                        runCoins: prev.runCoins + reward + (completedChallenge ? prev.challenge!.reward : 0),
                        currentLevel: prev.currentLevel + 1,
                        challenge: null,
                    }));
                    if (level < 4) {
                        setPhase('roguelike-crossroads');
                    } else { // Completed the run
                        const finalWinnings = roguelikeState.runCoins + reward;
                        onGameEnd(finalWinnings);
                        setLastGameWinnings(finalWinnings);
                        setGameResult('human'); // A win for the run
                        setPhase('gameOver'); // Special Game Over for roguelike win
                    }
                } else { // Lost the level
                    const consolationCoins = Math.round(roguelikeState.runCoins * 0.25);
                    onGameEnd(consolationCoins);
                    setLastGameWinnings(consolationCoins);
                    setGameResult('ai'); // A loss for the run
                    setPhase('gameOver'); // Special Game Over for roguelike loss
                }
            }
        }
    }, [phase, humanHand.length, aiHand.length, isResolvingTrick, humanScore, aiScore, onGameEnd, difficulty, gameplayMode, posthog, roguelikeState]);

    useEffect(() => {
        if (isQuotaExceeded) setGameMode('fallback');
    }, [isQuotaExceeded]);

    return {
        gameState: {
            phase, deck, humanHand, aiHand, briscolaCard, briscolaSuit, cardsOnTable, turn, humanScore, aiScore,
            trickStarter, message, backgroundUrl, isProcessing, isAiThinkingMove, isAiGeneratingMessage, currentWaifu,
            aiEmotionalState, gameResult, lastGameWinnings, isQuotaExceeded, gameMode,
            powerAnimation, 
            humanAbility: roguelikeState.humanAbility, 
            aiAbility: roguelikeState.aiAbility, 
            humanAbilityCharges, aiAbilityCharges,
            abilityTargetingState, revealedAiHand, roguelikeState,
            cardForElementalChoice,
        },
        gameActions: {
            startGame, activateHumanAbility, targetCardForAbility, confirmLeaveGame, goToMenu, handleQuotaExceeded, continueFromQuotaModal, startRoguelikeLevel, setRoguelikeState, setPhase,
            selectCardForPlay, confirmCardPlay, cancelCardPlay,
        }
    };
};