/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: The 'Suit' type is not exported from '@google/genai'. It has been removed from this import.
// 'Chat' is only used as a type, so using 'import type' is more accurate.
import type {Chat} from '@google/genai';
import {useEffect, useState, useMemo, useCallback, useRef} from 'react';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { usePostHog } from 'posthog-js/react';

import { playSound } from '../core/soundManager';
import { POINTS } from '../core/constants';
import { translations } from '../core/translations';
import { createDeck, shuffleDeck, getTrickWinner } from '../core/gameLogic';
import { getCardId } from '../core/utils';
import { QuotaExceededError, ai, getAIWaifuTrickMessage } from '../core/gemini';
import { getLocalAIMove, getFallbackWaifuMessage } from '../core/localAI';
import { WAIFUS } from '../core/waifus';
// FIX: The 'Suit' type is now correctly imported from the local types definition file.
import type { GamePhase, Language, Card, Player, ChatMessage, Waifu, GameEmotionalState, Suit, GameplayMode } from '../core/types';

import { Menu } from './Menu';
import { GameBoard } from './GameBoard';
import { GameOverModal } from './GameOverModal';
import { ChatPanel } from './ChatPanel';
import { QuotaExceededModal } from './QuotaExceededModal';
import { RulesModal } from './RulesModal';
import { WaifuDetailsModal } from './WaifuDetailsModal';
import { ConfirmationModal } from './ConfirmationModal';
import { SupportModal } from './SupportModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';
import { Snackbar } from './Snackbar';
import { GalleryModal } from './GalleryModal';
import { FullscreenImageModal } from './FullscreenImageModal';

const SCORE_THRESHOLD = 15; // Point difference to trigger personality change
type GameMode = 'online' | 'fallback';
type SnackbarType = 'success' | 'warning';

type BackgroundItem = {
    url: string;
    rarity: 'R' | 'SR' | 'SSR';
};

const BACKGROUNDS: BackgroundItem[] = [
    { url: 'https://s3.tebi.io/waifubriscola/background/landscape1.png', rarity: 'R' },
    { url: 'https://s3.tebi.io/waifubriscola/background/landscape2.png', rarity: 'SR' },
    { url: 'https://s3.tebi.io/waifubriscola/background/landscape3.png', rarity: 'R' },
    { url: 'https://s3.tebi.io/waifubriscola/background/background1.png', rarity: 'SSR' },
    { url: 'https://s3.tebi.io/waifubriscola/background/background2.png', rarity: 'SR' },
    { url: 'https://s3.tebi.io/waifubriscola/background/background3.png', rarity: 'R' },
];

export function App() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [language, setLanguage] = useState<Language>('it');
  const [gameplayMode, setGameplayMode] = useState<GameplayMode>('classic');
  const [isChatEnabled, setIsChatEnabled] = useState(true);
  const [waitForWaifuResponse, setWaitForWaifuResponse] = useState(true);
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
  const [currentWaifu, setCurrentWaifu] = useState<Waifu | null>(null);
  
  // Stati di caricamento specifici
  const [isAiThinkingMove, setIsAiThinkingMove] = useState(false);
  const [isResolvingTrick, setIsResolvingTrick] = useState(false);
  const [isAiGeneratingMessage, setIsAiGeneratingMessage] = useState(false);
  const [animatingCard, setAnimatingCard] = useState<{ card: Card; player: Player } | null>(null);
  const [drawingCards, setDrawingCards] = useState<{ destination: Player }[] | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isAiChatting, setIsAiChatting] = useState(false);
  const [hasChattedThisTurn, setHasChattedThisTurn] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isWaifuModalOpen, setIsWaifuModalOpen] = useState(false);
  const [isConfirmLeaveModalOpen, setIsConfirmLeaveModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [aiEmotionalState, setAiEmotionalState] = useState<GameEmotionalState>('neutral');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [menuBackgroundUrl, setMenuBackgroundUrl] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType }>({ message: '', type: 'success' });
  const [unlockedBackgrounds, setUnlockedBackgrounds] = useState<string[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string>('');
  
  // Gestione modalità di gioco e quota API
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('online');
  const [usedFallbackMessages, setUsedFallbackMessages] = useState<string[]>([]);
  const [gameResult, setGameResult] = useState<'human' | 'ai' | 'tie' | null>(null);

  // Valuta di gioco
  const [waifuCoins, setWaifuCoins] = useState<number>(0);
  const [lastGameWinnings, setLastGameWinnings] = useState<number>(0);
  const [hasRolledGacha, setHasRolledGacha] = useState(false);
  const [waifuBubbleMessage, setWaifuBubbleMessage] = useState<string>('');

  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastResolvedTrick = useRef<string[]>([]);
  const posthog = usePostHog();

  // Stato derivato per disabilitare l'input dell'utente
  const isProcessing = isAiThinkingMove || isResolvingTrick;
  const T = useMemo(() => translations[language], [language]);
  const aiName = useMemo(() => currentWaifu?.name ?? '', [currentWaifu]);

  useEffect(() => {
      setMessage(T.welcomeMessage);
      const bgIndex = Math.floor(Math.random() * 3) + 1;
      setMenuBackgroundUrl(`https://s3.tebi.io/waifubriscola/background/landscape${bgIndex}.png`);
  }, [T]);
  
  useEffect(() => {
    try {
      const savedUnlocked = localStorage.getItem('unlocked_backgrounds');
      if (savedUnlocked) setUnlockedBackgrounds(JSON.parse(savedUnlocked));

      const savedCoins = localStorage.getItem('waifu_coins');
      if (savedCoins) setWaifuCoins(parseInt(savedCoins, 10));

      const savedRolled = localStorage.getItem('has_rolled_gacha');
      if (savedRolled) setHasRolledGacha(JSON.parse(savedRolled));

      const savedChatSetting = localStorage.getItem('is_chat_enabled');
      if (savedChatSetting !== null) setIsChatEnabled(JSON.parse(savedChatSetting));
      
      const savedWaitSetting = localStorage.getItem('wait_for_waifu_response');
      if (savedWaitSetting !== null) setWaitForWaifuResponse(JSON.parse(savedWaitSetting));
      
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('is_chat_enabled', JSON.stringify(isChatEnabled));
    } catch (error) {
        console.error("Failed to save chat setting to localStorage", error);
    }
  }, [isChatEnabled]);

  useEffect(() => {
    try {
        localStorage.setItem('wait_for_waifu_response', JSON.stringify(waitForWaifuResponse));
    } catch (error) {
        console.error("Failed to save wait setting to localStorage", error);
    }
  }, [waitForWaifuResponse]);

  useEffect(() => {
    const lockOrientation = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Lock to portrait
          await ScreenOrientation.lock({ orientation: 'portrait-primary' });
        } catch (error) {
          // Can be ignored in browser
          console.info('Screen orientation lock not supported in this environment.');
        }
      }
    };

    lockOrientation();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const showPage = params.get('show');
    if (showPage === 'privacy') {
        setIsPrivacyModalOpen(true);
    } else if (showPage === 'terms') {
        setIsTermsModalOpen(true);
    }
  }, []);

  const refreshMenuBackground = useCallback(() => {
    const bgIndex = Math.floor(Math.random() * 3) + 1;
    setMenuBackgroundUrl(`https://s3.tebi.io/waifubriscola/background/landscape${bgIndex}.png`);
  }, []);

  const showWaifuBubble = useCallback((message: string) => {
    if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
    }
    setWaifuBubbleMessage(message);
    bubbleTimeoutRef.current = setTimeout(() => {
        setWaifuBubbleMessage('');
    }, 5000); // Display for 5 seconds
  }, []);

  const updateChatSession = useCallback((waifu: Waifu, history: ChatMessage[], emotionalState: GameEmotionalState, lang: Language) => {
    if (!isChatEnabled) return;
    const systemInstruction = waifu.systemInstructions[lang][emotionalState];
    const apiHistory = [...history];

    // 1. The API requires the history to start with a 'user' role.
    // Our chatHistory state starts with the AI's greeting.
    // We prepend a placeholder user message to satisfy the API.
    if (apiHistory.length === 0 || apiHistory[0].sender === 'ai') {
        apiHistory.unshift({ sender: 'human', text: lang === 'it' ? 'Ciao! Iniziamo a giocare.' : 'Hi! Let\'s start playing.' });
    }

    // 2. The API requires strict alternation of 'user' and 'model' roles.
    // Game events can add consecutive 'ai' messages.
    // We clean the history by merging consecutive messages from the same sender.
    const cleanedHistoryForApi: { role: string; parts: { text: string }[] }[] = [];
    if (apiHistory.length > 0) {
        // Start with the first message (which we've ensured is 'human')
        cleanedHistoryForApi.push({
            role: 'user',
            parts: [{ text: apiHistory[0].text }]
        });

        for (let i = 1; i < apiHistory.length; i++) {
            const currentMsg = apiHistory[i];
            const lastMessageInCleaned = cleanedHistoryForApi[cleanedHistoryForApi.length - 1];
            const currentRole = currentMsg.sender === 'human' ? 'user' : 'model';

            if (currentRole === lastMessageInCleaned.role) {
                // If the role is the same as the last one, merge the text.
                lastMessageInCleaned.parts[0].text += `\n\n${currentMsg.text}`;
            } else {
                // Otherwise, add a new message to the history.
                cleanedHistoryForApi.push({ role: currentRole, parts: [{ text: currentMsg.text }] });
            }
        }
    }
    
    const newChat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
      history: cleanedHistoryForApi,
    });
    setChatSession(newChat);
  }, [isChatEnabled]);

  const startGame = useCallback((selectedWaifu: Waifu | null) => {
    const bgIndex = Math.floor(Math.random() * 3) + 1;
    const isDesktop = window.innerWidth > 1024;
    const backgroundPrefix = isDesktop ? 'landscape' : 'background';
    setBackgroundUrl(`https://s3.tebi.io/waifubriscola/background/${backgroundPrefix}${bgIndex}.png`);
    
    playSound('game-start');
    const newWaifu = selectedWaifu ?? WAIFUS[Math.floor(Math.random() * WAIFUS.length)];
    setCurrentWaifu(newWaifu);
    
    posthog.capture('game_started', {
        waifu_name: newWaifu.name,
        language: language,
        selection_mode: selectedWaifu ? 'specific' : 'random',
        gameplay_mode: gameplayMode,
        is_chat_enabled: isChatEnabled,
    });

    const emotionalState = 'neutral';
    setAiEmotionalState(emotionalState);
    
    if (isChatEnabled) {
      const initialAiMessage: ChatMessage = { sender: 'ai', text: newWaifu.initialChatMessage[language] };
      const initialHistory: ChatMessage[] = [initialAiMessage];
      setChatHistory(initialHistory);
      updateChatSession(newWaifu, initialHistory, emotionalState, language);
      showWaifuBubble(initialAiMessage.text);
    } else {
      setChatHistory([]);
      setChatSession(null);
    }

    const newDeck = shuffleDeck(createDeck());
    const newBriscola = newDeck[newDeck.length - 1];
    
    setHumanHand(newDeck.slice(0, 3));
    setAiHand(newDeck.slice(3, 6));
    setDeck(newDeck.slice(6, -1));
    setBriscolaCard(newBriscola);
    setBriscolaSuit(newBriscola.suit);
    
    setPhase('playing');
    setHumanScore(0);
    setAiScore(0);
    setCardsOnTable([]);
    const starter: Player = Math.random() < 0.5 ? 'human' : 'ai';
    setTurn(starter);
    setTrickStarter(starter);
    setHasChattedThisTurn(false);
    setIsQuotaExceeded(false);
    setGameMode('online');
    setUsedFallbackMessages([]); // Reset used fallback messages for new game
    setTokenCount(0);
    setGameResult(null);
    setLastGameWinnings(0);
    setUnreadMessageCount(0);
    lastResolvedTrick.current = [];
    setMessage(starter === 'human' ? T.yourTurn : T.aiStarts(newWaifu.name));
  }, [language, T, updateChatSession, posthog, gameplayMode, isChatEnabled, showWaifuBubble]);
  
  const handleConfirmLeave = () => {
    posthog.capture('game_left', {
        human_score: humanScore,
        ai_score: aiScore,
        total_tokens_used: tokenCount
    });
    setIsConfirmLeaveModalOpen(false);
    setPhase('menu');
  };
  
  // Update AI emotional state based on score
  useEffect(() => {
    const scoreDiff = aiScore - humanScore;
    let newState: GameEmotionalState = 'neutral';
    if (scoreDiff > SCORE_THRESHOLD) {
      newState = 'winning';
    } else if (scoreDiff < -SCORE_THRESHOLD) {
      newState = 'losing';
    }
    
    if (newState !== aiEmotionalState) {
      setAiEmotionalState(newState);
    }
  }, [humanScore, aiScore, aiEmotionalState]);

  // Re-create chat session when emotional state changes
  useEffect(() => {
    if (currentWaifu && phase === 'playing' && chatSession && gameMode === 'online' && isChatEnabled) {
      updateChatSession(currentWaifu, chatHistory, aiEmotionalState, language);
    }
  }, [aiEmotionalState, chatHistory, chatSession, currentWaifu, language, updateChatSession, gameMode, isChatEnabled]);

  const handleSendChatMessage = async (userMessage: string) => {
      if (isQuotaExceeded || !chatSession || gameMode === 'fallback' || !isChatEnabled) return;
      
      posthog.capture('chat_message_sent', {
        waifu_name: aiName,
        message_length: userMessage.length,
        emotional_state: aiEmotionalState
      });

      const humanMessage: ChatMessage = { sender: 'human', text: userMessage };
      setChatHistory(prev => [...prev, humanMessage]);
      setIsAiChatting(true);
      setHasChattedThisTurn(true);
  
      try {
        const response = await chatSession.sendMessage({ message: userMessage });
        const aiMessage: ChatMessage = { sender: 'ai', text: response.text };
        const tokensUsed = response.usageMetadata?.totalTokenCount ?? 0;
        setTokenCount(prev => prev + tokensUsed);
        
        posthog.capture('gemini_request_completed', {
            source: 'chat_message',
            tokens_used: tokensUsed,
            waifu_name: aiName,
            emotional_state: aiEmotionalState,
            language: language,
        });

        setChatHistory(prev => [...prev, aiMessage]);
        if (!isChatModalOpen) {
          showWaifuBubble(aiMessage.text);
          setUnreadMessageCount(prev => prev + 1);
        }
        playSound('chat-notify');
      } catch (error: any) {
        if (error.toString().includes('RESOURCE_EXHAUSTED')) {
            posthog.capture('api_quota_exceeded', { source: 'chat_message' });
            setIsQuotaExceeded(true);
        } else {
            console.error("Error sending chat message:", error);
            const fallbackMessage: ChatMessage = { sender: 'ai', text: T.chatFallback };
            setChatHistory(prev => [...prev, fallbackMessage]);
        }
      } finally {
        setIsAiChatting(false);
      }
    };

  const handlePlayCard = (card: Card) => {
    if (turn !== 'human' || isProcessing || animatingCard) return;
    
    const playCardAsync = async () => {
      playSound('card-place');
      setHumanHand(prev => prev.filter(c => getCardId(c, language) !== getCardId(card, language)));
      setAnimatingCard({ card, player: 'human' });

      await new Promise(resolve => setTimeout(resolve, 500));

      setCardsOnTable(prev => [...prev, card]);
      setAnimatingCard(null);

      if (trickStarter === 'human') {
        setTurn('ai');
      }
    };
    playCardAsync();
  };
  
  useEffect(() => {
    if (turn === 'ai' && !isProcessing && phase === 'playing' && cardsOnTable.length < 2 && aiHand.length > 0 && !animatingCard) {
      const performAiMove = async () => {
        setIsAiThinkingMove(true);
        setMessage(T.aiThinking(aiName));
        
        try {
          if (!briscolaSuit) {
            return; // Safeguard
          }
          
          const aiCardToPlay = await new Promise<Card>(resolve =>
            setTimeout(() => resolve(getLocalAIMove(aiHand, briscolaSuit, cardsOnTable)), 750)
          );

          playSound('card-place');
          setAiHand(prev => prev.filter(c => getCardId(c, language) !== getCardId(aiCardToPlay, language)));
          setAnimatingCard({ card: aiCardToPlay, player: 'ai' });
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setCardsOnTable(prev => [...prev, aiCardToPlay]);
          setAnimatingCard(null);

          if (trickStarter === 'ai') {
            setTurn('human');
            setHasChattedThisTurn(false);
            setMessage(T.aiPlayedYourTurn(aiName));
          }
        } catch (error) {
          console.error("Error during local AI move, AI will not play a card.", error);
        } finally {
          setIsAiThinkingMove(false);
        }
      };

      performAiMove();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, isProcessing, phase, cardsOnTable, aiHand, animatingCard]);

  useEffect(() => {
    if (cardsOnTable.length !== 2 || phase !== 'playing' || isResolvingTrick) {
      return;
    }
  
    const resolveTrick = async () => {
      setIsResolvingTrick(true);
  
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      const currentTrickCardIds = cardsOnTable.map(c => getCardId(c, language)).sort();
      if (JSON.stringify(currentTrickCardIds) === JSON.stringify(lastResolvedTrick.current)) {
        console.warn("Attempted to resolve the same trick twice. Aborting.");
        setIsResolvingTrick(false);
        return;
      }
  
      if (!briscolaSuit || !currentWaifu) {
        setIsResolvingTrick(false);
        return;
      }
  
      const winner = getTrickWinner(cardsOnTable, trickStarter, briscolaSuit);
      const points = POINTS[cardsOnTable[0].value] + POINTS[cardsOnTable[1].value];
  
      const proceedToNextTurn = async () => {
        const trickMessage = winner === 'human' ? T.youWonTrick(points) : T.aiWonTrick(aiName, points);
        const soundToPlay = winner === 'human' ? 'trick-win' : 'trick-lose';
        playSound(soundToPlay);
    
        const tempDeck = [...deck];
        let tempBriscolaCard = briscolaCard;
        const drawnCards: Card[] = [];
        for (let i = 0; i < 2; i++) {
          if (tempDeck.length > 0) {
            drawnCards.push(tempDeck.shift()!);
          } else if (tempBriscolaCard) {
            drawnCards.push(tempBriscolaCard);
            tempBriscolaCard = null;
          }
        }
    
        setCardsOnTable([]);
    
        if (drawnCards.length > 0) {
          playSound('card-place');
          const drawAnimations = [];
          drawAnimations.push({ destination: winner });
          if (drawnCards.length > 1) {
            drawAnimations.push({ destination: winner === 'human' ? 'ai' : 'human' });
          }
          setDrawingCards(drawAnimations);
    
          await new Promise(resolve => setTimeout(resolve, 600));
          setDrawingCards(null);
        }
    
        const newHumanCard = winner === 'human' ? drawnCards[0] : drawnCards[1];
        const newAiCard = winner === 'human' ? drawnCards[1] : drawnCards[0];
    
        setDeck(tempDeck);
        setBriscolaCard(tempBriscolaCard);
        if (winner === 'human') {
          setHumanScore(s => s + points);
          if (newHumanCard) setHumanHand(prev => [...prev, newHumanCard]);
          if (newAiCard) setAiHand(prev => [...prev, newAiCard]);
          setHasChattedThisTurn(false);
        } else {
          setAiScore(s => s + points);
          if (newAiCard) setAiHand(prev => [...prev, newAiCard]);
          if (newHumanCard) setHumanHand(prev => [...prev, newHumanCard]);
        }
    
        lastResolvedTrick.current = currentTrickCardIds;
        setTurn(winner);
        setTrickStarter(winner);
        setMessage(`${trickMessage} ${winner === 'human' ? T.yourTurnMessage : T.aiTurnMessage(aiName)}`);
        setIsResolvingTrick(false);
      };

      const generateWaifuMessage = async () => {
        const humanPlayedCard = trickStarter === 'human' ? cardsOnTable[0] : cardsOnTable[1];
        const aiPlayedCard = trickStarter === 'ai' ? cardsOnTable[0] : cardsOnTable[1];
        let messageToShow = '';
  
        if (gameMode === 'fallback') {
          const fallbackMsg = getFallbackWaifuMessage(currentWaifu, aiEmotionalState, language, usedFallbackMessages);
          setUsedFallbackMessages(prev => [...prev, fallbackMsg]);
          setChatHistory(prev => [...prev, { sender: 'ai', text: fallbackMsg }]);
          messageToShow = fallbackMsg;
        } else {
          setIsAiGeneratingMessage(true);
          try {
            const { message: waifuMsg, tokens: tokensUsed } = await getAIWaifuTrickMessage(currentWaifu, aiEmotionalState, humanPlayedCard, aiPlayedCard, points, language);
            posthog.capture('gemini_request_completed', {
                source: 'trick_comment',
                tokens_used: tokensUsed,
                waifu_name: aiName,
                emotional_state: aiEmotionalState,
                language: language,
                points_won_trick: points,
            });
            setTokenCount(prev => prev + tokensUsed);
            setChatHistory(prev => [...prev, { sender: 'ai', text: waifuMsg }]);
            messageToShow = waifuMsg;
          } catch (error) {
            if (error instanceof QuotaExceededError) {
              posthog.capture('api_quota_exceeded', { source: 'trick_comment' });
              setIsQuotaExceeded(true);
            } else {
              console.error("Error generating waifu message:", error);
            }
          } finally {
            setIsAiGeneratingMessage(false);
          }
        }
        
        if (messageToShow) {
          showWaifuBubble(messageToShow);
        }
        if (!isChatModalOpen) {
          setUnreadMessageCount(prev => prev + 1);
        }
        playSound('chat-notify');
      };

      if (winner === 'ai' && isChatEnabled) {
        if (waitForWaifuResponse) {
          await generateWaifuMessage();
          await new Promise(resolve => setTimeout(resolve, 500)); 
          proceedToNextTurn();
        } else {
          generateWaifuMessage();
          proceedToNextTurn();
        }
      } else {
        proceedToNextTurn();
      }
    };
  
    resolveTrick();
  }, [
    T, aiEmotionalState, aiName, briscolaCard, briscolaSuit, cardsOnTable,
    currentWaifu, deck, gameMode, language, isResolvingTrick, trickStarter,
    posthog, usedFallbackMessages, isChatModalOpen, isChatEnabled, waitForWaifuResponse, showWaifuBubble
  ]);
  
  // The end of the game logic
  useEffect(() => {
    if (phase === 'playing' && humanHand.length === 0 && aiHand.length === 0 && deck.length === 0 && cardsOnTable.length === 0 && !isResolvingTrick) {
      let winner: 'human' | 'ai' | 'tie';
      if (humanScore > aiScore) {
        winner = 'human';
        playSound('game-win');
      } else if (aiScore > humanScore) {
        winner = 'ai';
        playSound('game-lose');
      } else {
        winner = 'tie';
      }

      let coinsEarned = 0;
      if (winner === 'human') {
        if (humanScore > 101) {
          coinsEarned = 100;
        } else if (humanScore >= 81) {
          coinsEarned = 70;
        } else if (humanScore >= 61) {
          coinsEarned = 45;
        }
      } else { // Loss or Tie
        coinsEarned = 20;
      }
      
      setLastGameWinnings(coinsEarned);
      const newTotalCoins = waifuCoins + coinsEarned;
      setWaifuCoins(newTotalCoins);
      localStorage.setItem('waifu_coins', newTotalCoins.toString());

      setGameResult(winner);
      setPhase('gameOver');
      posthog.capture('game_over', {
          winner,
          human_score: humanScore,
          ai_score: aiScore,
          score_difference: Math.abs(humanScore - aiScore),
          waifu_name: currentWaifu?.name,
          total_tokens_used: tokenCount,
          coins_earned: coinsEarned,
          is_chat_enabled: isChatEnabled,
      });
    }
  }, [phase, humanHand.length, aiHand.length, deck.length, cardsOnTable.length, humanScore, aiScore, isResolvingTrick, posthog, currentWaifu, tokenCount, waifuCoins, isChatEnabled]);
  
  // Handle switching to fallback mode
  useEffect(() => {
    if (isQuotaExceeded && gameMode === 'online') {
      setGameMode('fallback');
      setMessage(prev => `${prev}\n${T.offlineModeActive}`);
    }
  }, [isQuotaExceeded, gameMode, T]);

  const handleContinueFromQuotaModal = () => {
      setIsQuotaExceeded(false); // Hide the modal
      setGameMode('fallback');
      // The game continues where it left off, but now using local AI
  };
  
  const handleOpenWaifuDetails = () => {
      if (currentWaifu) {
        setIsWaifuModalOpen(true);
      }
  };

  const handleSubscriptionInterest = useCallback(() => {
    posthog.capture('subscription_interest_expressed', {
        waifu_name: currentWaifu?.name,
        language,
    });
    setIsSupportModalOpen(false);
    setSnackbar({ message: T.supportModal.subscriptionInterestThanks, type: 'success' });
  }, [posthog, currentWaifu, language, T.supportModal.subscriptionInterestThanks]);

  const handleGachaRoll = useCallback(() => {
    const GACHA_COST = 100;
    const isFirstRoll = !hasRolledGacha;

    if (!isFirstRoll && waifuCoins < GACHA_COST) {
        setSnackbar({ message: T.gallery.gachaNotEnoughCoins, type: 'warning' });
        return;
    }

    const locked = BACKGROUNDS.filter(bg => !unlockedBackgrounds.includes(bg.url));
    if (locked.length === 0) {
      setSnackbar({ message: T.gallery.gachaAllUnlocked, type: 'success' });
      return;
    }

    if (!isFirstRoll) {
        const newTotalCoins = waifuCoins - GACHA_COST;
        setWaifuCoins(newTotalCoins);
        localStorage.setItem('waifu_coins', newTotalCoins.toString());
    }

    // 100% chance to win on first roll, 50% otherwise
    if (isFirstRoll || Math.random() < 0.50) { 
        const rand = Math.random();
        let rarityToPull: 'R' | 'SR' | 'SSR';

        if (rand < 0.05) { // 5% for SSR
            rarityToPull = 'SSR';
        } else if (rand < 0.20) { // 15% for SR (0.05 + 0.15)
            rarityToPull = 'SR';
        } else { // 80% for R
            rarityToPull = 'R';
        }

        let pool = locked.filter(item => item.rarity === rarityToPull);
        
        // Pity system: if no items of the pulled rarity are available, try other rarities.
        if (pool.length === 0) {
            if (rarityToPull === 'SSR') {
                pool = locked.filter(item => item.rarity === 'SR');
                if (pool.length === 0) pool = locked.filter(item => item.rarity === 'R');
            } else if (rarityToPull === 'SR') {
                pool = locked.filter(item => item.rarity === 'R');
                if (pool.length === 0) pool = locked.filter(item => item.rarity === 'SSR');
            } else { // rarityToPull was 'R'
                pool = locked.filter(item => item.rarity === 'SR');
                if (pool.length === 0) pool = locked.filter(item => item.rarity === 'SSR');
            }
        }
        
        if (pool.length === 0) {
            pool = locked;
        }

        if (pool.length > 0) {
            const toUnlock = pool[Math.floor(Math.random() * pool.length)];
            const newUnlocked = [...unlockedBackgrounds, toUnlock.url];
            setUnlockedBackgrounds(newUnlocked);
            localStorage.setItem('unlocked_backgrounds', JSON.stringify(newUnlocked));
            setSnackbar({ message: T.gallery.gachaSuccess(toUnlock.rarity), type: 'success' });
            posthog.capture('gacha_success', { 
                unlocked_background: toUnlock.url,
                rarity: toUnlock.rarity,
                unlocked_count: newUnlocked.length,
                is_first_roll: isFirstRoll,
            });
        } else {
             setSnackbar({ message: T.gallery.gachaFailure, type: 'success' });
             posthog.capture('gacha_failure', { reason: 'pity_system_failed', is_first_roll: isFirstRoll });
        }
    } else {
      setSnackbar({ message: T.gallery.gachaFailure, type: 'success' });
      posthog.capture('gacha_failure', { reason: '50_percent_roll_failed' });
    }
    
    if (isFirstRoll) {
        setHasRolledGacha(true);
        localStorage.setItem('has_rolled_gacha', 'true');
    }
  }, [unlockedBackgrounds, T, posthog, waifuCoins, hasRolledGacha]);

  const handleImageSelect = (url: string) => {
    setFullscreenImage(url);
  };

  const handleCloseFullscreen = () => {
    setFullscreenImage('');
  };

  const handleOpenChat = () => {
    setIsChatModalOpen(true);
    setUnreadMessageCount(0);
  };
  
  const handleWaitForWaifuResponseChange = (enabled: boolean) => {
    setWaitForWaifuResponse(enabled);
    if (!enabled) {
        setSnackbar({ message: T.fastModeEnabled, type: 'success' });
    }
  };

  const isAiTyping = isAiChatting || isAiGeneratingMessage;

  if (phase === 'menu') {
    return (
      <>
        <Menu
          language={language}
          gameplayMode={gameplayMode}
          isChatEnabled={isChatEnabled}
          waitForWaifuResponse={waitForWaifuResponse}
          backgroundUrl={menuBackgroundUrl}
          waifuCoins={waifuCoins}
          onLanguageChange={setLanguage}
          onGameplayModeChange={setGameplayMode}
          onChatEnabledChange={setIsChatEnabled}
          onWaitForWaifuResponseChange={handleWaitForWaifuResponseChange}
          onWaifuSelected={startGame}
          onShowRules={() => setIsRulesModalOpen(true)}
          onShowPrivacy={() => setIsPrivacyModalOpen(true)}
          onShowTerms={() => setIsTermsModalOpen(true)}
          onShowSupport={() => setIsSupportModalOpen(true)}
          onRefreshBackground={refreshMenuBackground}
          onShowGallery={() => setIsGalleryModalOpen(true)}
        />
        <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} language={language} />
        <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} language={language} />
        <TermsAndConditionsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} language={language} />
        <GalleryModal
          isOpen={isGalleryModalOpen}
          onClose={() => setIsGalleryModalOpen(false)}
          language={language}
          backgrounds={BACKGROUNDS}
          unlockedBackgrounds={unlockedBackgrounds}
          waifuCoins={waifuCoins}
          onGachaRoll={handleGachaRoll}
          onImageSelect={handleImageSelect}
          hasRolledGacha={hasRolledGacha}
        />
        {isSupportModalOpen && (
            <SupportModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                onSubscriptionInterest={handleSubscriptionInterest}
                language={language}
            />
        )}
        <FullscreenImageModal
          isOpen={!!fullscreenImage}
          imageUrl={fullscreenImage}
          onClose={handleCloseFullscreen}
          language={language}
        />
        <Snackbar
          message={snackbar.message}
          onClose={() => setSnackbar({ message: '', type: 'success' })}
          lang={language}
          type={snackbar.type}
        />
      </>
    );
  }

  return (
    <div className={`app-container ${isChatModalOpen ? 'chat-open-mobile' : ''} ${!isChatEnabled ? 'chat-disabled' : ''}`}>
      <GameBoard
        aiName={aiName}
        aiScore={aiScore}
        aiHand={aiHand}
        humanScore={humanScore}
        humanHand={humanHand}
        briscolaCard={briscolaCard}
        deckSize={deck.length + (briscolaCard ? 1 : 0)}
        cardsOnTable={cardsOnTable}
        message={message}
        isProcessing={isProcessing}
        isAiThinkingMove={isAiThinkingMove}
        turn={turn}
        onPlayCard={handlePlayCard}
        onGoToMenu={() => setIsConfirmLeaveModalOpen(true)}
        onOpenSupportModal={() => setIsSupportModalOpen(true)}
        language={language}
        backgroundUrl={backgroundUrl}
        animatingCard={animatingCard}
        drawingCards={drawingCards}
        currentWaifu={currentWaifu}
        onOpenChat={handleOpenChat}
        unreadMessageCount={unreadMessageCount}
        isAiTyping={isAiTyping}
        waifuBubbleMessage={waifuBubbleMessage}
      />
      {isChatEnabled && currentWaifu &&
        <ChatPanel
          history={chatHistory}
          aiName={aiName}
          onSendMessage={handleSendChatMessage}
          isChatting={isAiChatting}
          isAiGeneratingMessage={isAiGeneratingMessage}
          isPlayerTurn={turn === 'human'}
          hasChattedThisTurn={hasChattedThisTurn}
          onModalClose={() => setIsChatModalOpen(false)}
          lang={language}
          gameMode={gameMode}
          waifu={currentWaifu}
          onAvatarClick={handleOpenWaifuDetails}
        />
      }

      {phase === 'gameOver' && gameResult && (
        <GameOverModal
          humanScore={humanScore}
          aiScore={aiScore}
          aiName={aiName}
          winner={gameResult}
          onPlayAgain={() => startGame(currentWaifu)}
          language={language}
          winnings={lastGameWinnings}
        />
      )}
      {isQuotaExceeded && gameMode === 'online' && ( // Mostra solo se la modalità non è già fallback
        <QuotaExceededModal language={language} onContinue={handleContinueFromQuotaModal} />
      )}
      {currentWaifu && (
          <WaifuDetailsModal 
            isOpen={isWaifuModalOpen}
            onClose={() => setIsWaifuModalOpen(false)}
            waifu={currentWaifu}
            language={language}
          />
      )}
      {isSupportModalOpen && (
        <SupportModal
            isOpen={isSupportModalOpen}
            onClose={() => setIsSupportModalOpen(false)}
            onSubscriptionInterest={handleSubscriptionInterest}
            language={language}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmLeaveModalOpen}
        onClose={() => setIsConfirmLeaveModalOpen(false)}
        onConfirm={handleConfirmLeave}
        title={T.confirmLeave.title}
        message={T.confirmLeave.message}
        confirmText={T.confirmLeave.confirm}
        cancelText={T.confirmLeave.cancel}
      />
      <Snackbar
          message={snackbar.message}
          onClose={() => setSnackbar({ message: '', type: 'success' })}
          lang={language}
          type={snackbar.type}
        />
    </div>
  );
}