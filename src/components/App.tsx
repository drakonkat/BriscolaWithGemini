/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: The 'Suit' type is not exported from '@google/genai'. It has been removed from this import.
// 'Chat' is only used as a type, so using 'import type' is more accurate.
import type {Chat} from '@google/genai';
import {useEffect, useState, useMemo, useCallback} from 'react';

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

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isAiChatting, setIsAiChatting] = useState(false);
  const [hasChattedThisTurn, setHasChattedThisTurn] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isWaifuModalOpen, setIsWaifuModalOpen] = useState(false);
  const [isConfirmLeaveModalOpen, setIsConfirmLeaveModalOpen] = useState(false);
  const [aiEmotionalState, setAiEmotionalState] = useState<GameEmotionalState>('neutral');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [menuBackgroundUrl, setMenuBackgroundUrl] = useState('');
  
  // Gestione modalità di gioco e quota API
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('online');
  const [usedFallbackMessages, setUsedFallbackMessages] = useState<string[]>([]);


  // Stato derivato per disabilitare l'input dell'utente
  const isProcessing = isAiThinkingMove || isResolvingTrick;

  const T = useMemo(() => translations[language], [language]);
  const aiName = useMemo(() => currentWaifu?.name ?? '', [currentWaifu]);

  useEffect(() => {
      setMessage(T.welcomeMessage);
      const bgIndex = Math.floor(Math.random() * 3) + 1;
      setMenuBackgroundUrl(`https://s3.tebi.io/waifubriscola/background/landscape${bgIndex}.png`);
  }, [T]);
  
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
    setMessage(starter === 'human' ? T.yourTurn : T.aiStarts(newWaifu.name));
  }, [language, T, updateChatSession]);
  
  const handleConfirmLeave = () => {
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
  
      const humanMessage: ChatMessage = { sender: 'human', text: userMessage };
      setChatHistory(prev => [...prev, humanMessage]);
      setIsAiChatting(true);
      setHasChattedThisTurn(true);
  
      try {
        const response = await chatSession.sendMessage({ message: userMessage });
        const aiMessage: ChatMessage = { sender: 'ai', text: response.text };
        setChatHistory(prev => [...prev, aiMessage]);
        playSound('chat-notify');
      } catch (error: any) {
        if (error.toString().includes('RESOURCE_EXHAUSTED')) {
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
    if (turn !== 'human' || isProcessing) return;
    
    playSound('card-place');
    setHumanHand(prev => prev.filter(c => getCardId(c, language) !== getCardId(card, language)));
    setCardsOnTable(prev => [...prev, card]);
    
    if (trickStarter === 'human') {
      setTurn('ai');
    }
  };
  
  useEffect(() => {
    if (turn === 'ai' && !isProcessing && phase === 'playing' && cardsOnTable.length < 2 && aiHand.length > 0) {
      const performAiMove = async () => {
        setIsAiThinkingMove(true);
        setMessage(T.aiThinking(aiName));
        
        try {
          if (!briscolaSuit) {
            return; // Safeguard
          }
          
          // Always use the local AI for card selection, with a delay to simulate thinking.
          const aiCardToPlay = await new Promise<Card>(resolve =>
            setTimeout(() => resolve(getLocalAIMove(aiHand, briscolaSuit, cardsOnTable)), 750)
          );

          playSound('card-place');
          setAiHand(prev => prev.filter(c => getCardId(c, language) !== getCardId(aiCardToPlay, language)));
          setCardsOnTable(prev => [...prev, aiCardToPlay]);

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
  }, [turn, isProcessing, phase, cardsOnTable, aiHand]);

  useEffect(() => {
    if (cardsOnTable.length !== 2 || phase !== 'playing' || isResolvingTrick) {
      return;
    }

    const resolveTrick = async () => {
      setIsResolvingTrick(true);
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
          playSound('chat-notify');
        } else {
          setIsAiGeneratingMessage(true);
          try {
            const waifuMsg = await getAIWaifuTrickMessage(currentWaifu, aiEmotionalState, humanPlayedCard, aiPlayedCard, points, language);
            setChatHistory(prev => [...prev, { sender: 'ai', text: waifuMsg }]);
            playSound('chat-notify');
          } catch (error) {
            if (error instanceof QuotaExceededError) {
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
      
      setCardsOnTable([]);
      setTurn(winner);
      setTrickStarter(winner);
      setMessage(`${trickMessage} ${winner === 'human' ? T.yourTurnMessage : T.aiTurnMessage(aiName)}`);
      setIsResolvingTrick(false);
    };

    resolveTrick();
  }, [
    T, aiEmotionalState, aiName, briscolaCard, briscolaSuit, cardsOnTable,
    currentWaifu, deck, gameMode, language, phase, isResolvingTrick,
    trickStarter, usedFallbackMessages
  ]);

  // Separate useEffect for checking game over condition
  useEffect(() => {
    if (phase !== 'playing' || humanHand.length > 0 || aiHand.length > 0) {
      return;
    }

    // This condition ensures we only check for game over after the last trick is resolved
    if (deck.length === 0 && !briscolaCard) {
      if (humanScore > 60) {
        playSound('game-win');
      } else if (aiScore > 60) {
        playSound('game-lose');
      } else {
        playSound('trick-win'); // Neutral-positive sound for a tie
      }
      setPhase('gameOver');
    }
  }, [humanHand, aiHand, deck, briscolaCard, phase, humanScore, aiScore]);


  if (phase === 'menu' || !currentWaifu) {
    return (
        <>
            <Menu
                language={language}
                backgroundUrl={menuBackgroundUrl}
                onLanguageChange={setLanguage}
                onWaifuSelected={startGame}
                onShowRules={() => setIsRulesModalOpen(true)}
            />
            <RulesModal
                isOpen={isRulesModalOpen}
                onClose={() => setIsRulesModalOpen(false)}
                language={language}
            />
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
            deck={deck}
            briscolaCard={briscolaCard}
            cardsOnTable={cardsOnTable}
            message={message}
            isProcessing={isProcessing}
            isAiThinkingMove={isAiThinkingMove}
            turn={turn}
            onPlayCard={handlePlayCard}
            onGoToMenu={() => setIsConfirmLeaveModalOpen(true)}
            language={language}
            backgroundUrl={backgroundUrl}
        />
        
        {phase === 'gameOver' && (
            <GameOverModal
                humanScore={humanScore}
                aiScore={aiScore}
                aiName={aiName}
                onPlayAgain={() => startGame(currentWaifu)}
                language={language}
            />
        )}
        
        {isQuotaExceeded && (
            <QuotaExceededModal
                language={language}
                onContinue={() => {
                    setGameMode('fallback');
                    setIsQuotaExceeded(false);
                    setMessage(T.offlineModeActive);
                }}
            />
        )}

        <WaifuDetailsModal
            isOpen={isWaifuModalOpen}
            onClose={() => setIsWaifuModalOpen(false)}
            waifu={currentWaifu}
            language={language}
        />

        <ConfirmationModal
            isOpen={isConfirmLeaveModalOpen}
            onClose={() => setIsConfirmLeaveModalOpen(false)}
            onConfirm={handleConfirmLeave}
            title={T.confirmLeave.title}
            message={T.confirmLeave.message}
            confirmText={T.confirmLeave.confirm}
            cancelText={T.confirmLeave.cancel}
        />

        <ChatPanel 
            history={chatHistory} 
            aiName={aiName}
            waifu={currentWaifu}
            onAvatarClick={() => setIsWaifuModalOpen(true)}
            onSendMessage={handleSendChatMessage}
            isChatting={isAiChatting}
            isAiGeneratingMessage={isAiGeneratingMessage}
            isPlayerTurn={turn === 'human'}
            hasChattedThisTurn={hasChattedThisTurn}
            onModalClose={() => setIsChatModalOpen(false)}
            lang={language}
            gameMode={gameMode}
        />
        <button className="chat-fab" onClick={() => setIsChatModalOpen(true)} aria-label="Apri chat">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
        </button>
    </div>
  );
}
