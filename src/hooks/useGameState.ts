/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePostHog } from 'posthog-js/react';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

import { playSound } from '../core/soundManager';
import { translations } from '../core/translations';
import { createDeck, getTrickWinner as getClassicTrickWinner } from '../core/classicGameLogic';
import { initializeRoguelikeDeck, assignAbilities, getRoguelikeTrickWinner, calculateRoguelikeTrickPoints, determineWeaknessWinner } from '../core/roguelikeGameLogic';
import { getCardPoints, shuffleDeck } from '../core/utils';
import { QuotaExceededError, getAIWaifuTrickMessage, getAIGenericTeasingMessage } from '../core/gemini';
import { getLocalAIMove, getAIAbilityDecision } from '../core/localAI';
import { WAIFUS, BOSS_WAIFU } from '../core/waifus';
import type { GamePhase, Card, Player, Waifu, GameEmotionalState, Suit, Element, AbilityType, RoguelikeState, RoguelikeEvent, ElementalClashResult, TrickHistoryEntry } from '../core/types';
import type { useGameSettings } from './useGameSettings';

const SCORE_THRESHOLD = 15;
type GameMode = 'online' | 'fallback';
type ElementalEffectStatus = 'active' | 'inactive' | 'unset';
type ArmedAbility = 'fortify' | 'sakura_blessing' | 'rei_analysis' | 'kasumi_gambit';

const SAVED_GAME_KEY = 'waifu_briscola_saved_game';

const INITIAL_ROGUELIKE_STATE: RoguelikeState = {
    currentLevel: 0,
    runCoins: 0,
    activePowerUp: null,
    challenge: null,
    humanAbility: null,
    aiAbility: null,
    encounteredWaifus: [],
    followers: [],
    followerAbilitiesUsedThisMatch: [],
};

const ROGUELIKE_LEVEL_REWARDS = [0, 25, 50, 75, 150];

type useGameStateProps = {
    settings: ReturnType<typeof useGameSettings>['settings'];
    setters: ReturnType<typeof useGameSettings>['setters'];
    onGameEnd: (winnings: number) => void;
    closeWaifuBubble: () => void;
    onAiMessageGenerated: (message: string) => void;
};

export const useGameState = ({ settings, setters, onGameEnd, onAiMessageGenerated, closeWaifuBubble }: useGameStateProps) => {
    const { language, gameplayMode, difficulty, isChatEnabled, waitForWaifuResponse } = settings;
    const posthog = usePostHog();
    const T = useMemo(() => translations[language], [language]);
    
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
    const [elementalClash, setElementalClash] = useState<ElementalClashResult | null>(null);
    const [lastTrickHighlights, setLastTrickHighlights] = useState<{ human: ElementalEffectStatus, ai: ElementalEffectStatus }>({ human: 'unset', ai: 'unset' });
    const [humanAbilityCharges, setHumanAbilityCharges] = useState(0);
    const [aiAbilityCharges, setAiAbilityCharges] = useState(0);
    const [abilityTargetingState, setAbilityTargetingState] = useState<'incinerate' | 'cyclone' | null>(null);
    const [abilityArmed, setAbilityArmed] = useState<ArmedAbility | null>(null);
    const [abilityUsedThisTurn, setAbilityUsedThisTurn] = useState<{ ability: AbilityType; originalCard: Card } | null>(null);
    const [revealedAiHand, setRevealedAiHand] = useState<Card[] | null>(null);
    const [guaranteedClashWinner, setGuaranteedClashWinner] = useState<Player | null>(null);
    const [isKasumiModalOpen, setIsKasumiModalOpen] = useState(false);
    const [activeElements, setActiveElements] = useState<Element[]>([]);
    const [isAiUsingAbility, setIsAiUsingAbility] = useState(false);

    // History State
    const [trickHistory, setTrickHistory] = useState<TrickHistoryEntry[]>([]);
    const [lastTrick, setLastTrick] = useState<TrickHistoryEntry | null>(null);

    const [hasSavedGame, setHasSavedGame] = useState(() => !!localStorage.getItem(SAVED_GAME_KEY));

    const isProcessing = isResolvingTrick;
    const lastResolvedTrick = useRef<string[]>([]);
    const trickCounter = useRef(0);
    const clashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const resolveTrickCallbackRef = useRef<(() => void) | null>(null);
    const humanAbilityUsedInTrick = useRef(false);
    const aiAbilityUsedInTrick = useRef(false);

    const clearSavedGame = useCallback(() => {
        localStorage.removeItem(SAVED_GAME_KEY);
        setHasSavedGame(false);
    }, []);
    
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

        // Always have the human player start in classic mode to avoid hangs.
        const starter: Player = 'human';
        setTurn(starter);
        setTrickStarter(starter);
        setMessage(T.yourTurn);

        setPhase('playing');
    }, [T]);

    const startRoguelikeRun = useCallback((firstWaifu: Waifu) => {
        posthog.capture('roguelike_run_started', { waifu_name: firstWaifu.name, difficulty });
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

        // Reset per-match state for a clean start
        setCardsOnTable([]);
        setTrickHistory([]);
        setLastTrick(null);
        trickCounter.current = 0;
        lastResolvedTrick.current = [];
        setAbilityUsedThisTurn(null);
        setAbilityTargetingState(null);
        setAbilityArmed(null);
        setElementalClash(null);
        setLastTrickHighlights({ human: 'unset', ai: 'unset' });
        setGuaranteedClashWinner(null);
        setRoguelikeState(p => ({...p, followerAbilitiesUsedThisMatch: []}));

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
    
        const initialDeck = shuffleDeck(createDeck());
        const { deck: elementalDeck, activeElements: newActiveElements } = initializeRoguelikeDeck(initialDeck, level);
        setActiveElements(newActiveElements);
    
        let newDeck = elementalDeck;
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
        setTrickHistory([]);
        setLastTrick(null);
        setAbilityUsedThisTurn(null);
        setActiveElements([]);
        setRoguelikeState(INITIAL_ROGUELIKE_STATE);
        
        if (gameplayMode === 'classic') {
            setCurrentWaifu(newWaifu);
            startClassicGame(newWaifu);
        } else {
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

        let cardToPlay = card;
        if (abilityArmed === 'fortify') {
            cardToPlay = { ...card, isTemporaryBriscola: true };
            setAbilityArmed(null);
            setHumanAbilityCharges(0);
            humanAbilityUsedInTrick.current = true;
            setMessage(T.yourTurnMessage);
        }

        if (abilityUsedThisTurn) {
            setAbilityUsedThisTurn(null); // Confirm the action, lock it in
        }

        if (gameplayMode === 'roguelike' && card.element && !card.isTemporaryBriscola) {
            setCardForElementalChoice(cardToPlay);
        } else {
            playSound('card-place');
            setHumanHand(prev => prev.filter(c => c.id !== cardToPlay.id));
            setCardsOnTable(prev => [...prev, cardToPlay]);
    
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

        if (roguelikeState.humanAbility === 'incinerate' && (cardsOnTable.length !== 1 || trickStarter === 'human')) {
            return; 
        }

        if (roguelikeState.humanAbility === 'tide') {
            setMessage(T.abilityUsed(T.scoreYou, T.tide));
            setRevealedAiHand([...aiHand]);
            setTimeout(() => setRevealedAiHand(null), 5000);
            setHumanAbilityCharges(0);
            humanAbilityUsedInTrick.current = true;
        } else if (roguelikeState.humanAbility === 'fortify') {
            setAbilityArmed('fortify');
        } else {
            setAbilityTargetingState(roguelikeState.humanAbility as 'incinerate' | 'cyclone');
        }
    };

    const cancelAbilityTargeting = () => {
        setAbilityTargetingState(null);
    };

    const targetCardInHandForAbility = (card: Card) => {
        if (!abilityTargetingState || abilityTargetingState === 'incinerate') return;
        
        if (abilityTargetingState === 'cyclone') {
            if (deck.length > 0) {
                const newDeck = [...deck, card];
                const shuffled = shuffleDeck(newDeck);
                const newCard = shuffled.shift()!;
                setHumanHand(prev => [...prev.filter(c => c.id !== card.id), newCard]);
                setDeck(shuffled);
            }
        }
        setAbilityTargetingState(null);
        setHumanAbilityCharges(0);
        humanAbilityUsedInTrick.current = true;
    };

    const targetCardOnTableForAbility = () => {
        if (abilityTargetingState !== 'incinerate' || cardsOnTable.length !== 1) return;
        const cardToBurn = cardsOnTable[0];
        
        setAbilityUsedThisTurn({ ability: 'incinerate', originalCard: cardToBurn });
        setCardsOnTable([{ ...cardToBurn, isBurned: true }]);
        
        setMessage(T.confirmOrUndoMessage);
        
        setAbilityTargetingState(null);
        setHumanAbilityCharges(0);
        humanAbilityUsedInTrick.current = true;
    };

    const onUndoAbilityUse = () => {
        if (!abilityUsedThisTurn) return;

        setCardsOnTable([abilityUsedThisTurn.originalCard]);
        setHumanAbilityCharges(2); // Refund charges
        setAbilityUsedThisTurn(null);
        setMessage(T.yourTurnMessage); // Reset message
    };
    
    const activateFollowerAbility = (waifuName: string) => {
        const T = translations[language];
        let abilityArmed: ArmedAbility | null = null;
        let abilityName = '';
        switch(waifuName) {
            case 'Sakura': 
                abilityArmed = 'sakura_blessing'; 
                abilityName = T.sakura_blessing;
                break;
            case 'Rei':
                 if (aiScore >= 5) {
                    abilityArmed = 'rei_analysis';
                    abilityName = T.rei_analysis;
                }
                break;
            case 'Kasumi':
                abilityArmed = 'kasumi_gambit';
                abilityName = T.kasumi_gambit;
                break;
        }

        if (!abilityArmed) return;

        setAbilityArmed(abilityArmed);
        setMessage(T.followerAbilityArmed(waifuName, abilityName));
        
        // Instant abilities
        if (abilityArmed === 'rei_analysis') {
            setHumanScore(p => p + 5);
            setAiScore(p => p - 5);
            setRoguelikeState(p => ({...p, followerAbilitiesUsedThisMatch: [...p.followerAbilitiesUsedThisMatch, waifuName]}));
            setAbilityArmed(null);
            setMessage(T.yourTurnMessage);
        } else if (abilityArmed === 'kasumi_gambit') {
            setIsKasumiModalOpen(true);
        } else if (abilityArmed === 'sakura_blessing') {
            setGuaranteedClashWinner('human');
            setRoguelikeState(p => ({...p, followerAbilitiesUsedThisMatch: [...p.followerAbilitiesUsedThisMatch, waifuName]}));
            setAbilityArmed(null);
            setMessage(T.yourTurnMessage);
        }
    };
    
    const cancelFollowerAbility = () => {
        setAbilityArmed(null);
        setMessage(T.yourTurnMessage);
    };

    const closeKasumiModal = () => {
        setIsKasumiModalOpen(false);
        setAbilityArmed(null);
        setMessage(T.yourTurnMessage);
    };

    const handleKasumiCardSwap = (cardFromHand: Card) => {
        if (briscolaCard) {
            setBriscolaCard(cardFromHand);
            setBriscolaSuit(cardFromHand.suit);
            setHumanHand(p => [...p.filter(c => c.id !== cardFromHand.id), briscolaCard]);
            setRoguelikeState(p => ({...p, followerAbilitiesUsedThisMatch: [...p.followerAbilitiesUsedThisMatch, 'Kasumi']}));
        }
        closeKasumiModal();
    };


    const confirmLeaveGame = () => {
        posthog.capture('game_left', { human_score: humanScore, ai_score: aiScore });
        clearSavedGame();
        setPhase('menu');
    };
    
    const goToMenu = () => setPhase('menu');
    const handleQuotaExceeded = () => {
        setIsQuotaExceeded(true);
        setGameMode('fallback');
    };
    const continueFromQuotaModal = () => setIsQuotaExceeded(false);

    const forceCloseClashModal = useCallback(() => {
        if (clashTimeoutRef.current && resolveTrickCallbackRef.current) {
            clearTimeout(clashTimeoutRef.current);
            resolveTrickCallbackRef.current();
            clashTimeoutRef.current = null;
            resolveTrickCallbackRef.current = null;
        }
    }, []);

    const resetJustWonLevelFlag = useCallback(() => {
        setRoguelikeState(p => ({ ...p, justWonLevel: false }));
    }, []);

    const resolveTrick = useCallback(async (humanCard: Card, aiCard: Card, trickWinner: Player, clashResult: ElementalClashResult | null) => {
        const humanCardFinal = cardsOnTable.find(c => c.id === humanCard.id) || humanCard;
        const aiCardFinal = cardsOnTable.find(c => c.id === aiCard.id) || aiCard;

        let points = getCardPoints(humanCardFinal) + getCardPoints(aiCardFinal);
        
        let humanPowerActive = humanCardFinal.elementalEffectActivated ?? false;
        let aiPowerActive = aiCardFinal.elementalEffectActivated ?? false;
        
        if (gameplayMode === 'roguelike') {
            const clashWinner = clashResult?.winner ?? null;
            const result = calculateRoguelikeTrickPoints(humanCardFinal, aiCardFinal, humanPowerActive, aiPowerActive, trickWinner, clashWinner);
            points = result.pointsForTrick;

            if (trickWinner === 'human' && humanPowerActive && humanCardFinal.element === 'fire') {
                points += 3;
                setPowerAnimation({type: 'fire', player: 'human'});
                setTimeout(() => setPowerAnimation(null), 1500);
            }
            if (trickWinner === 'ai' && aiPowerActive && aiCardFinal.element === 'fire') {
                points += 3;
                setPowerAnimation({type: 'fire', player: 'ai'});
                setTimeout(() => setPowerAnimation(null), 1500);
            }

            if (trickWinner === 'ai' && humanPowerActive && humanCardFinal.element === 'earth') {
                 setHumanScore(prev => prev + result.humanCardPoints);
            }
             if (trickWinner === 'human' && aiPowerActive && aiCardFinal.element === 'earth') {
                 setAiScore(prev => prev + result.aiCardPoints);
            }
        }

        trickCounter.current += 1;
        if (gameplayMode === 'roguelike') {
            if (trickCounter.current % 2 === 0) {
                if (!humanAbilityUsedInTrick.current) {
                    setHumanAbilityCharges(c => Math.min(2, c + 1));
                }
                if (!aiAbilityUsedInTrick.current) {
                    setAiAbilityCharges(c => Math.min(2, c + 1));
                }
            }
        }

        const newTrickHistoryEntry: TrickHistoryEntry = {
            trickNumber: trickCounter.current,
            humanCard: humanCardFinal,
            aiCard: aiCardFinal,
            winner: trickWinner,
            points,
            clashResult: clashResult ?? undefined,
        };
        setTrickHistory(prev => [...prev, newTrickHistoryEntry]);
        setLastTrick(newTrickHistoryEntry);

        if (trickWinner === 'human') {
            setHumanScore(prev => prev + points);
            playSound('trick-win');
            setMessage(T.youWonTrick(points));
        } else {
            setAiScore(prev => prev + points);
            playSound('trick-lose');
            setMessage(T.aiWonTrick(currentWaifu?.name ?? 'AI', points));
        }
        
        setTurn(trickWinner);
        setTrickStarter(trickWinner);
        setElementalClash(null);
        setLastTrickHighlights({ human: 'unset', ai: 'unset' });

        if (isChatEnabled && !isQuotaExceeded && gameMode === 'online' && currentWaifu) {
            if (trickWinner === 'ai' && waitForWaifuResponse) {
                setIsAiGeneratingMessage(true);
                try {
                    const { message } = await getAIWaifuTrickMessage(currentWaifu, aiEmotionalState, humanCardFinal, aiCardFinal, points, language);
                    onAiMessageGenerated(message);
                } catch (e) {
                    if (e instanceof QuotaExceededError) handleQuotaExceeded();
                } finally {
                    setIsAiGeneratingMessage(false);
                }
            } else if (trickCounter.current > 1 && Math.random() < 0.25) { // 25% chance for random tease after trick 1
                getAIGenericTeasingMessage(currentWaifu, aiEmotionalState, aiScore, humanScore, language)
                    .then(({message}) => onAiMessageGenerated(message))
                    .catch(e => { if (e instanceof QuotaExceededError) handleQuotaExceeded(); });
            }
        }
        
        // Wait for message to display, then draw cards
        setTimeout(() => {
            const newDeck = [...deck];
            let newHumanHand = [...humanHand];
            let newAiHand = [...aiHand];
            let newBriscolaCard = briscolaCard;

            const drawOrder: Player[] = trickWinner === 'human' ? ['human', 'ai'] : ['ai', 'human'];

            for (const player of drawOrder) {
                let cardDrawn = null;
                if (newDeck.length > 0) {
                    cardDrawn = newDeck.shift()!;
                } else if (newBriscolaCard) {
                    cardDrawn = newBriscolaCard;
                    newBriscolaCard = null; // Briscola card is taken
                }

                if (cardDrawn) {
                    if (player === 'human') {
                        newHumanHand.push(cardDrawn);
                    } else {
                        newAiHand.push(cardDrawn);
                    }
                }
            }
            
            setHumanHand(newHumanHand);
            setAiHand(newAiHand);
            setDeck(newDeck);
            setBriscolaCard(newBriscolaCard);
            setCardsOnTable([]);
            setIsResolvingTrick(false);
            humanAbilityUsedInTrick.current = false;
            aiAbilityUsedInTrick.current = false;

            if(trickWinner === 'human') {
                setMessage(T.yourTurnMessage);
            }

        }, 1500);

    }, [T, currentWaifu, deck, humanHand, aiHand, briscolaCard, isChatEnabled, gameMode, isQuotaExceeded, aiEmotionalState, language, gameplayMode, waitForWaifuResponse, onAiMessageGenerated, aiScore, humanScore, cardsOnTable]);

    const resumeGame = useCallback(() => {
        const savedGameJson = localStorage.getItem(SAVED_GAME_KEY);
        if (!savedGameJson) return;

        try {
            const saved = JSON.parse(savedGameJson);

            // Restore settings
            setters.setLanguage(saved.settings.language);
            setters.setGameplayMode(saved.settings.gameplayMode);
            setters.setDifficulty(saved.settings.difficulty);
            setters.setIsChatEnabled(saved.settings.isChatEnabled);
            setters.setWaitForWaifuResponse(saved.settings.waitForWaifuResponse);
            setters.setSoundtrack(saved.settings.soundtrack);

            // Restore game state
            const waifu = WAIFUS.find(w => w.name === saved.currentWaifuName) || (BOSS_WAIFU.name === saved.currentWaifuName ? BOSS_WAIFU : null);
            setCurrentWaifu(waifu);
            setDeck(saved.deck);
            setHumanHand(saved.humanHand);
            setAiHand(saved.aiHand);
            setBriscolaCard(saved.briscolaCard);
            setBriscolaSuit(saved.briscolaSuit);
            setCardsOnTable(saved.cardsOnTable);
            setTurn(saved.turn);
            setHumanScore(saved.humanScore);
            setAiScore(saved.aiScore);
            setTrickStarter(saved.trickStarter);
            setMessage(saved.message);
            setBackgroundUrl(saved.backgroundUrl);
            setAiEmotionalState(saved.aiEmotionalState);
            setGameMode(saved.gameMode);
            setTrickHistory(saved.trickHistory || []);
            setLastTrick(saved.lastTrick || null);
            setRoguelikeState(saved.roguelikeState);
            setActiveElements(saved.activeElements || []);
            setHumanAbilityCharges(saved.humanAbilityCharges);
            setAiAbilityCharges(saved.aiAbilityCharges);
            setCardForElementalChoice(saved.cardForElementalChoice);
            setElementalClash(saved.elementalClash);
            setLastTrickHighlights(saved.lastTrickHighlights || { human: 'unset', ai: 'unset' });
            setAbilityTargetingState(saved.abilityTargetingState);
            setAbilityArmed(saved.abilityArmed);
            setAbilityUsedThisTurn(saved.abilityUsedThisTurn);
            setRevealedAiHand(saved.revealedAiHand);
            setIsKasumiModalOpen(saved.isKasumiModalOpen);
            
            lastResolvedTrick.current = saved.lastResolvedTrick || [];
            trickCounter.current = saved.trickCounter || 0;

            setPhase('playing');
            posthog.capture('game_resumed');

        } catch (e) {
            console.error("Failed to load saved game", e);
            clearSavedGame(); // Clear corrupted data
        }
    }, [setters, clearSavedGame, posthog]);
    
    const stateToSave = useMemo(() => ({
        settings,
        currentWaifuName: currentWaifu?.name ?? null,
        deck, humanHand, aiHand, briscolaCard, briscolaSuit, cardsOnTable, turn,
        humanScore, aiScore, trickStarter, message, backgroundUrl, aiEmotionalState,
        gameMode, trickHistory, lastTrick, roguelikeState, activeElements, humanAbilityCharges,
        aiAbilityCharges, lastResolvedTrick: lastResolvedTrick.current, trickCounter: trickCounter.current,
        cardForElementalChoice, elementalClash, lastTrickHighlights, abilityTargetingState, abilityArmed,
        abilityUsedThisTurn, revealedAiHand, isKasumiModalOpen,
    }), [
        settings, currentWaifu, deck, humanHand, aiHand, briscolaCard, briscolaSuit, cardsOnTable, turn,
        humanScore, aiScore, trickStarter, message, backgroundUrl, aiEmotionalState, gameMode, trickHistory,
        lastTrick, roguelikeState, activeElements, humanAbilityCharges, aiAbilityCharges,
        cardForElementalChoice, elementalClash, lastTrickHighlights, abilityTargetingState, abilityArmed,
        abilityUsedThisTurn, revealedAiHand, isKasumiModalOpen
    ]);
    
    useEffect(() => {
        if (phase === 'playing') {
            localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(stateToSave));
            setHasSavedGame(true);
        }
    }, [phase, stateToSave]);

    useEffect(() => {
        if (phase !== 'playing') return;
    
        const scoreDiff = humanScore - aiScore;
        let newState: GameEmotionalState = 'neutral';
        if (scoreDiff > SCORE_THRESHOLD) newState = 'losing';
        else if (scoreDiff < -SCORE_THRESHOLD) newState = 'winning';
        setAiEmotionalState(newState);
    
    }, [humanScore, aiScore, phase]);

    useEffect(() => {
        if (phase !== 'playing' || cardsOnTable.length < 2) return;
        
        const trickId = cardsOnTable.map(c => c.id).sort().join('-');
        if (lastResolvedTrick.current.includes(trickId)) return;
        lastResolvedTrick.current.push(trickId);
    
        setIsResolvingTrick(true);
        const humanCard = trickStarter === 'human' ? cardsOnTable[0] : cardsOnTable[1];
        const aiCard = trickStarter === 'ai' ? cardsOnTable[0] : cardsOnTable[1];
        
        const resolve = (clashResult: ElementalClashResult | null) => {
            let getTrickWinner = gameplayMode === 'classic' ? getClassicTrickWinner : getRoguelikeTrickWinner;
            const trickWinner = getTrickWinner(cardsOnTable, trickStarter, briscolaSuit!);
            resolveTrick(humanCard, aiCard, trickWinner, clashResult);
        };

        if (gameplayMode === 'roguelike' && humanCard.element && aiCard.element) {
            let clashWinner: 'human' | 'ai' | 'tie' | null = null;
            let finalClashResult: ElementalClashResult | null = null;
            
            if (guaranteedClashWinner) {
                clashWinner = guaranteedClashWinner;
                setGuaranteedClashWinner(null);
            } else {
                clashWinner = determineWeaknessWinner(humanCard.element, aiCard.element);
            }
            if (clashWinner) { 
                finalClashResult = {
                    type: 'weakness',
                    winner: clashWinner,
                    winningElement: clashWinner === 'human' ? humanCard.element! : aiCard.element!,
                    losingElement: clashWinner === 'human' ? aiCard.element! : humanCard.element!,
                };
            } else { // Dice roll
                const humanRoll = Math.floor(Math.random() * 100) + 1;
                const aiRoll = Math.floor(Math.random() * 100) + 1;
                clashWinner = humanRoll > aiRoll ? 'human' : aiRoll > humanRoll ? 'ai' : 'tie';
                finalClashResult = { type: 'dice', humanRoll, aiRoll, winner: clashWinner };
            }
            
            setElementalClash(finalClashResult);

            setLastTrickHighlights({
                human: (clashWinner === 'human' && humanCard.elementalEffectActivated) ? 'active' : 'inactive',
                ai: (clashWinner === 'ai' && aiCard.elementalEffectActivated) ? 'active' : 'inactive'
            });

            resolveTrickCallbackRef.current = () => resolve(finalClashResult);
            clashTimeoutRef.current = setTimeout(() => {
                resolve(finalClashResult);
                clashTimeoutRef.current = null;
                resolveTrickCallbackRef.current = null;
            }, 5000);

        } else {
            setLastTrickHighlights({
                human: humanCard.elementalEffectActivated ? 'active' : (humanCard.element ? 'inactive' : 'unset'),
                ai: aiCard.elementalEffectActivated ? 'active' : (aiCard.element ? 'inactive' : 'unset')
            });
            setTimeout(() => resolve(null), 500); // Short delay to see cards
        }
    
    }, [cardsOnTable, phase, trickStarter, briscolaSuit, resolveTrick, gameplayMode, guaranteedClashWinner]);

    useEffect(() => {
        // Check if it's AI's turn to act
        if (phase !== 'playing' || turn !== 'ai' || isProcessing || cardsOnTable.length >= 2 || aiHand.length === 0 || isAiUsingAbility) {
            return;
        }
    
        const performAiAction = () => {
            // Step 1: Decide if AI should use an ability
            if (gameplayMode === 'roguelike' && roguelikeState.aiAbility && aiAbilityCharges >= 2) {
                const decision = getAIAbilityDecision(roguelikeState.aiAbility, aiHand, null, deck.length, cardsOnTable);
                if (decision.useAbility) {
                    setIsAiUsingAbility(true); // Prevent re-triggering while ability is processed
                    setAiAbilityCharges(0); // Reset charges for ANY used ability
                    aiAbilityUsedInTrick.current = true;
                    setMessage(T.abilityUsed(currentWaifu?.name ?? 'AI', T[decision.ability]));
    
                    // Apply ability effect
                    switch (decision.ability) {
                        case 'tide':
                            setRevealedAiHand([...humanHand]);
                            setTimeout(() => setRevealedAiHand(null), 5000);
                            break;
                        case 'incinerate':
                            if (cardsOnTable.length === 1 && decision.targetCardId) {
                                const cardToBurn = cardsOnTable[0];
                                if (cardToBurn.id === decision.targetCardId) {
                                    setCardsOnTable([{ ...cardToBurn, isBurned: true }]);
                                }
                            }
                            break;
                        case 'cyclone':
                            if (decision.targetCardId && deck.length > 0) {
                                const cardToSwap = aiHand.find(c => c.id === decision.targetCardId);
                                if (cardToSwap) {
                                    const newDeck = [...deck, cardToSwap];
                                    const shuffled = shuffleDeck(newDeck);
                                    const newCard = shuffled.shift()!;
                                    setAiHand(prev => [...prev.filter(c => c.id !== cardToSwap.id), newCard]);
                                    setDeck(shuffled);
                                }
                            }
                            break;
                        case 'fortify':
                            if (decision.targetCardId) {
                                setAiHand(prev => prev.map(c => c.id === decision.targetCardId ? { ...c, isTemporaryBriscola: true } : c));
                            }
                            break;
                    }
                    
                    // Allow the effect to re-run after a short delay to play the card with updated state
                    setTimeout(() => setIsAiUsingAbility(false), 500); 
                    return; // Exit, the effect will re-run to play the card
                }
            }
    
            // Step 2: Play a card (if no ability was used in this run)
            if (!currentWaifu) return;
    
            let chosenCard: Card = getLocalAIMove(aiHand, briscolaSuit!, cardsOnTable, difficulty);
    
            if (chosenCard.element) {
                chosenCard = { ...chosenCard, elementalEffectActivated: true };
            }
    
            playSound('card-place');
            setMessage(T.aiPlayedYourTurn(currentWaifu.name));
            setAiHand(prev => prev.filter(c => c.id !== chosenCard.id));
            setCardsOnTable(prev => [...prev, chosenCard]);
    
            if (trickStarter === 'ai') {
                setTurn('human');
            }
        };
    
        performAiAction();
    
    }, [T, aiAbilityCharges, aiHand, briscolaSuit, cardsOnTable, currentWaifu, deck, difficulty, gameplayMode, humanHand, isProcessing, phase, roguelikeState.aiAbility, trickStarter, turn, isAiUsingAbility]);
    
    useEffect(() => {
        if (phase === 'playing' && humanHand.length === 0 && aiHand.length === 0 && !isProcessing) {
            let winner: 'human' | 'ai' | 'tie' = 'tie';
            if (humanScore > aiScore) winner = 'human';
            if (aiScore > humanScore) winner = 'ai';
            if (humanScore === 60 && aiScore === 60) winner = 'tie';
            if (humanScore === aiScore && humanScore > 60) winner = 'human';

            let winnings = 0;
            let difficultyMultiplier = 1.0;
            if (difficulty === 'easy') difficultyMultiplier = 0.5;
            else if (difficulty === 'hard') difficultyMultiplier = 1.5;

            clearSavedGame();

            posthog.capture('game_over', {
                human_score: humanScore, ai_score: aiScore, winner, winnings,
            });

            if (gameplayMode === 'classic') {
                if (winner === 'human') {
                    if (humanScore >= 101) winnings = Math.round(100 * difficultyMultiplier);
                    else if (humanScore >= 81) winnings = Math.round(70 * difficultyMultiplier);
                    else winnings = Math.round(45 * difficultyMultiplier);
                } else {
                    winnings = Math.round(20 * difficultyMultiplier);
                }
                onGameEnd(winnings);
                setLastGameWinnings(winnings);
                setGameResult(winner);
                setPhase('gameOver');
            } else { // Roguelike
                if (winner === 'human') {
                    const levelJustWon = roguelikeState.currentLevel;
                    winnings = ROGUELIKE_LEVEL_REWARDS[levelJustWon];
                    const newRunCoins = roguelikeState.runCoins + winnings;

                    const allEventTypes: RoguelikeEvent['type'][] = ['market', 'witch_hut', 'healing_fountain', 'challenge_altar'];
                    const chosenEventTypes = shuffleDeck(allEventTypes).slice(0, 2);

                    setRoguelikeState(p => ({
                        ...p,
                        runCoins: newRunCoins,
                        currentLevel: p.currentLevel + 1,
                        followers: p.currentLevel <= 3 && currentWaifu ? [...p.followers, currentWaifu] : p.followers,
                        followerAbilitiesUsedThisMatch: [], // Recharge on win
                        justWonLevel: true,
                        eventTypesForCrossroads: chosenEventTypes,
                    }));

                    if (levelJustWon >= 4) {
                        onGameEnd(newRunCoins);
                        setLastGameWinnings(newRunCoins);
                    }
                    setGameResult(winner);
                    setPhase('gameOver');
                } else { // Lost roguelike level
                    if (roguelikeState.currentLevel === 1) {
                         const consolation = difficulty === 'easy' ? 10 : difficulty === 'hard' ? 30 : 20;
                         winnings = consolation;
                    } else {
                        winnings = Math.round(roguelikeState.runCoins / 2);
                    }
                    onGameEnd(winnings);
                    setLastGameWinnings(winnings);
                    setGameResult(winner);
                    setPhase('gameOver');
                }
            }
        }
    }, [humanHand.length, aiHand.length, phase, isProcessing, humanScore, aiScore, onGameEnd, posthog, difficulty, gameplayMode, roguelikeState, currentWaifu, clearSavedGame]);

    return {
        gameState: {
            phase, currentWaifu, deck, humanHand, aiHand, briscolaCard, briscolaSuit, cardsOnTable,
            turn, humanScore, aiScore, trickStarter, message, backgroundUrl, isProcessing,
            isAiGeneratingMessage, aiEmotionalState, gameResult, lastGameWinnings, isQuotaExceeded, gameMode,
            powerAnimation, humanAbility: roguelikeState.humanAbility, aiAbility: roguelikeState.aiAbility,
            humanAbilityCharges, aiAbilityCharges, abilityTargetingState, abilityUsedThisTurn,
            revealedAiHand, cardForElementalChoice, elementalClash, lastTrickHighlights, trickHistory, lastTrick,
            activeElements, roguelikeState, abilityArmed, isKasumiModalOpen,
            hasSavedGame,
        },
        gameActions: {
            setPhase,
            startGame, selectCardForPlay, confirmCardPlay, cancelCardPlay, goToMenu, handleQuotaExceeded,
            continueFromQuotaModal, forceCloseClashModal, activateHumanAbility, cancelAbilityTargeting,
            targetCardInHandForAbility, targetCardOnTableForAbility, onUndoAbilityUse, confirmLeaveGame,
            startRoguelikeLevel, setRoguelikeState, activateFollowerAbility, cancelFollowerAbility,
            closeKasumiModal, handleKasumiCardSwap, resetJustWonLevelFlag,
            resumeGame,
        }
    };
};
