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
import type { GamePhase, Language, Card, Player, ChatMessage, Waifu, GameEmotionalState, Suit } from '../core/types';

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

const SCORE_THRESHOLD = 15; // Point difference to trigger personality change
type GameMode = 'online' | 'fallback';

export function App() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [language, setLanguage] = useState<Language>('it');
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
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [aiEmotionalState, setAiEmotionalState] = useState<GameEmotionalState>('neutral');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [menuBackgroundUrl, setMenuBackgroundUrl] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  
  // Gestione modalità di gioco e quota API
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('online');
  const [usedFallbackMessages, setUsedFallbackMessages] = useState<string[]>([]);
  const [gameResult, setGameResult] = useState<'human' | 'ai' | 'tie' | null>(null);


  // Stato derivato per disabilitare l'input dell'utente
  const isProcessing = isAiThinkingMove || isResolvingTrick;
  const lastResolvedTrick = useRef<string[]>([]);
  const posthog = usePostHog();

  const T = useMemo(() => translations[language], [language]);
  const aiName = useMemo(() => currentWaifu?.name ?? '', [currentWaifu]);

  useEffect(() => {
      setMessage(T.welcomeMessage);
      const bgIndex = Math.floor(Math.random() * 3) + 1;
      setMenuBackgroundUrl(`https://s3.tebi.io/waifubriscola/background/landscape${bgIndex}.png`);
  }, [T]);
  
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

  const updateChatSession = useCallback((waifu: Waifu, history: ChatMessage[], emotionalState: GameEmotionalState, lang: Language) => {
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
  }, []);

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
        selection_mode: selectedWaifu ? 'specific' : 'random'
    });

    const emotionalState = 'neutral';
    setAiEmotionalState(emotionalState);
    
    // Directly set the initial message and initialize the chat session
    const initialAiMessage: ChatMessage = { sender: 'ai', text: newWaifu.initialChatMessage[language] };
    const initialHistory: ChatMessage[] = [initialAiMessage];
    setChatHistory(initialHistory);
    updateChatSession(newWaifu, initialHistory, emotionalState, language);

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
    setUnreadMessageCount(0);
    lastResolvedTrick.current = [];
    setMessage(starter === 'human' ? T.yourTurn : T.aiStarts(newWaifu.name));
  }, [language, T, updateChatSession, posthog]);
  
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
    if (currentWaifu && phase === 'playing' && chatSession && gameMode === 'online') {
      updateChatSession(currentWaifu, chatHistory, aiEmotionalState, language);
    }
  }, [aiEmotionalState, chatHistory, chatSession, currentWaifu, language, updateChatSession, gameMode]);

  const handleSendChatMessage = async (userMessage: string) => {
      if (isQuotaExceeded || !chatSession || gameMode === 'fallback') return;
      
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
      
      const currentTrickCardIds = cardsOnTable.map(c => getCardId(c, language)).sort();
      if (JSON.stringify(currentTrickCardIds) === JSON.stringify(lastResolvedTrick.current)) {
          console.warn("Attempted to resolve the same trick twice. Aborting.");
          setIsResolvingTrick(false);
          return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!briscolaSuit || !currentWaifu) {
        setIsResolvingTrick(false);
        return;
      }

      const winner = getTrickWinner(cardsOnTable, trickStarter, briscolaSuit);
      const points = POINTS[cardsOnTable[0].value] + POINTS[cardsOnTable[1].value];
      
      if (winner === 'ai') {
        const humanPlayedCard = trickStarter === 'human' ? cardsOnTable[0] : cardsOnTable[1];
        const aiPlayedCard = trickStarter === 'ai' ? cardsOnTable[0] : cardsOnTable[1];
        
        if (gameMode === 'fallback') {
          const fallbackMsg = getFallbackWaifuMessage(currentWaifu, aiEmotionalState, language, usedFallbackMessages);
          setUsedFallbackMessages(prev => [...prev, fallbackMsg]);
          setChatHistory(prev => [...prev, { sender: 'ai', text: fallbackMsg }]);
          if (!isChatModalOpen) {
            setUnreadMessageCount(prev => prev + 1);
          }
          playSound('chat-notify');
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
            if (!isChatModalOpen) {
              setUnreadMessageCount(prev => prev + 1);
            }
            playSound('chat-notify');
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
      }

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

      // Start visual updates: clear table, then animate drawing
      setCardsOnTable([]);
      
      if (drawnCards.length > 0) {
        playSound('card-place'); // Re-use sound for drawing
        const drawAnimations = [];
        drawAnimations.push({ destination: winner });
        if (drawnCards.length > 1) {
            drawAnimations.push({ destination: winner === 'human' ? 'ai' : 'human' });
        }
        setDrawingCards(drawAnimations);
        
        await new Promise(resolve => setTimeout(resolve, 600)); // Wait for animation
        setDrawingCards(null);
      }
      
      // Now update game state after animations
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

    resolveTrick();
  }, [
    T, aiEmotionalState, aiName, briscolaCard, briscolaSuit, cardsOnTable,
    currentWaifu, deck, gameMode, language, isResolvingTrick, trickStarter,
    posthog, usedFallbackMessages, isChatModalOpen
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
      setGameResult(winner);
      setPhase('gameOver');
      posthog.capture('game_over', {
          winner,
          human_score: humanScore,
          ai_score: aiScore,
          score_difference: Math.abs(humanScore - aiScore),
          waifu_name: currentWaifu?.name,
          total_tokens_used: tokenCount,
      });
    }
  }, [phase, humanHand.length, aiHand.length, deck.length, cardsOnTable.length, humanScore, aiScore, isResolvingTrick, posthog, currentWaifu, tokenCount]);
  
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
  }, [posthog, currentWaifu, language]);

  const handleOpenChat = () => {
    setIsChatModalOpen(true);
    setUnreadMessageCount(0);
  };

  const isAiTyping = isAiChatting || isAiGeneratingMessage;

  if (phase === 'menu') {
    return (
      <>
        <Menu
          language={language}
          backgroundUrl={menuBackgroundUrl}
          onLanguageChange={setLanguage}
          onWaifuSelected={startGame}
          onShowRules={() => setIsRulesModalOpen(true)}
          onShowPrivacy={() => setIsPrivacyModalOpen(true)}
          onShowTerms={() => setIsTermsModalOpen(true)}
        />
        <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} language={language} />
        <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} language={language} />
        <TermsAndConditionsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} language={language} />
      </>
    );
  }

  return (
    <div className={`app-container ${isChatModalOpen ? 'chat-open-mobile' : ''}`}>
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
      />
      {currentWaifu &&
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

      <button className="chat-fab" onClick={handleOpenChat} aria-label={T.chatWith(aiName)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
          {isAiTyping ? (
            <span className="chat-fab-badge typing"></span>
          ) : unreadMessageCount > 0 && (
            <span className="chat-fab-badge">{unreadMessageCount > 9 ? '9+' : unreadMessageCount}</span>
          )}
      </button>

      {phase === 'gameOver' && gameResult && (
        <GameOverModal
          humanScore={humanScore}
          aiScore={aiScore}
          aiName={aiName}
          winner={gameResult}
          onPlayAgain={() => startGame(currentWaifu)}
          language={language}
        />
      )}
      {isQuotaExceeded && gameMode === 'online' && (
        <QuotaExceededModal
          language={language}
          onContinue={handleContinueFromQuotaModal}
        />
      )}
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} language={language} />
      {isWaifuModalOpen && currentWaifu && (
          <WaifuDetailsModal
            isOpen={isWaifuModalOpen}
            onClose={() => setIsWaifuModalOpen(false)}
            waifu={currentWaifu}
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
      {isSupportModalOpen && (
        <SupportModal
            isOpen={isSupportModalOpen}
            onClose={() => setIsSupportModalOpen(false)}
            onSubscriptionInterest={handleSubscriptionInterest}
            language={language}
        />
      )}
      <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} language={language} />
      <TermsAndConditionsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} language={language} />
    </div>
  );
}