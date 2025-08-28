/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Chat} from '@google/genai';
import {useEffect, useState, useMemo, useCallback} from 'react';

import { playSound } from '../core/soundManager';
import { POINTS } from '../core/constants';
import { translations } from '../core/translations';
import { createDeck, shuffleDeck, getTrickWinner } from '../core/gameLogic';
import { getCardId } from '../core/utils';
import { ai, getAIMove, getAIWaifuTrickMessage } from '../core/gemini';
import { WAIFUS } from '../core/waifus';
import type { GamePhase, Language, Card, Player, ChatMessage, Waifu, GameEmotionalState } from '../core/types';

import { Menu } from './Menu';
import { GameBoard } from './GameBoard';
import { GameOverModal } from './GameOverModal';
import { ChatPanel } from './ChatPanel';

const SCORE_THRESHOLD = 15; // Point difference to trigger personality change

export function App() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [language, setLanguage] = useState<Language>('it');
  const [deck, setDeck] = useState<Card[]>([]);
  const [humanHand, setHumanHand] = useState<Card[]>([]);
  const [aiHand, setAiHand] = useState<Card[]>([]);
  const [briscolaCard, setBriscolaCard] = useState<Card | null>(null);
  const [cardsOnTable, setCardsOnTable] = useState<Card[]>([]);
  const [turn, setTurn] = useState<Player>('human');
  const [humanScore, setHumanScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [trickStarter, setTrickStarter] = useState<Player>('human');
  const [isProcessing, setIsProcessing] = useState(false); // Master lock for AI moves and trick resolution
  const [message, setMessage] = useState('');
  const [currentWaifu, setCurrentWaifu] = useState<Waifu | null>(null);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isAiChatting, setIsAiChatting] = useState(false);
  const [hasChattedThisTurn, setHasChattedThisTurn] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [aiEmotionalState, setAiEmotionalState] = useState<GameEmotionalState>('neutral');

  const T = useMemo(() => translations[language], [language]);
  const aiName = useMemo(() => currentWaifu?.name ?? '', [currentWaifu]);

  useEffect(() => {
      setMessage(T.welcomeMessage);
  }, [T]);

  const briscolaSuit = useMemo(() => briscolaCard?.suit, [briscolaCard]);
  
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

  const startGame = useCallback(() => {
    playSound('game-start');
    const newWaifu = WAIFUS[Math.floor(Math.random() * WAIFUS.length)];
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
    
    setPhase('playing');
    setHumanScore(0);
    setAiScore(0);
    setCardsOnTable([]);
    const starter: Player = Math.random() < 0.5 ? 'human' : 'ai';
    setTurn(starter);
    setTrickStarter(starter);
    setHasChattedThisTurn(false);
    setMessage(starter === 'human' ? T.yourTurn : T.aiStarts(newWaifu.name));
  }, [language, T, updateChatSession]);
  
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
    if (currentWaifu && phase === 'playing' && chatSession) {
      updateChatSession(currentWaifu, chatHistory, aiEmotionalState, language);
    }
  }, [aiEmotionalState, chatHistory, chatSession, currentWaifu, language, updateChatSession]);

  const handleSendChatMessage = async (userMessage: string) => {
      if (!chatSession) return;
  
      const humanMessage: ChatMessage = { sender: 'human', text: userMessage };
      setChatHistory(prev => [...prev, humanMessage]);
      setIsAiChatting(true);
      setHasChattedThisTurn(true);
  
      try {
        const response = await chatSession.sendMessage({ message: userMessage });
        const aiMessage: ChatMessage = { sender: 'ai', text: response.text };
        setChatHistory(prev => [...prev, aiMessage]);
        playSound('chat-notify');
      } catch (error) {
        console.error("Error sending chat message:", error);
        const fallbackMessage: ChatMessage = { sender: 'ai', text: T.chatFallback };
        setChatHistory(prev => [...prev, fallbackMessage]);
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
        setIsProcessing(true);
        setMessage(T.aiThinking(aiName));
        
        if (!briscolaSuit) {
            setIsProcessing(false);
            return;
        }
        
        const aiCardToPlay = await getAIMove(aiHand, briscolaSuit, cardsOnTable, language);
        
        playSound('card-place');
        setAiHand(prev => prev.filter(c => getCardId(c, language) !== getCardId(aiCardToPlay, language)));
        setCardsOnTable(prev => [...prev, aiCardToPlay]);

        if (trickStarter === 'ai') {
          setTurn('human');
          setHasChattedThisTurn(false);
          setMessage(T.aiPlayedYourTurn(aiName));
          setIsProcessing(false);
        }
      };
      performAiMove();
    }
  }, [turn, isProcessing, phase, cardsOnTable, aiHand, briscolaSuit, trickStarter, aiName, language, T]);

  useEffect(() => {
    const resolveTrick = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        if(!briscolaSuit || !currentWaifu) {
            setIsProcessing(false);
            return;
        }
        const winner = getTrickWinner(cardsOnTable, trickStarter, briscolaSuit);
        const points = POINTS[cardsOnTable[0].value] + POINTS[cardsOnTable[1].value];
        
        let trickMessage = '';
        let finalHumanScore = humanScore;
        let finalAiScore = aiScore;

        if (winner === 'human') {
          finalHumanScore += points;
          setHumanScore(finalHumanScore);
          setHasChattedThisTurn(false);
          trickMessage = T.youWonTrick(points);
          playSound('trick-win');
        } else {
          finalAiScore += points;
          setAiScore(finalAiScore);

          const humanPlayedCard = trickStarter === 'human' ? cardsOnTable[0] : cardsOnTable[1];
          const aiPlayedCard = trickStarter === 'ai' ? cardsOnTable[0] : cardsOnTable[1];

          const waifuMsg = await getAIWaifuTrickMessage(
            currentWaifu,
            aiEmotionalState,
            humanPlayedCard,
            aiPlayedCard,
            points,
            language
          );
          setChatHistory(prev => [...prev, {sender: 'ai', text: waifuMsg}]);
          trickMessage = T.aiWonTrick(aiName, points);
          playSound('trick-lose');
        }
        
        let newDeck = [...deck];
        let newHumanHand = [...humanHand];
        let newAiHand = [...aiHand];

        const drawCard = (): Card | undefined => {
          if (newDeck.length > 0) {
            return newDeck.shift();
          }
          if (briscolaCard) {
            const lastCard = briscolaCard;
            setBriscolaCard(null);
            return lastCard;
          }
          return undefined;
        };

        if (winner === 'human') {
            const humanCard = drawCard();
            if(humanCard) newHumanHand.push(humanCard);
            const aiCard = drawCard();
            if(aiCard) newAiHand.push(aiCard);
        } else {
            const aiCard = drawCard();
            if(aiCard) newAiHand.push(aiCard);
            const humanCard = drawCard();
            if(humanCard) newHumanHand.push(humanCard);
        }

        setDeck(newDeck);
        setHumanHand(newHumanHand);
        setAiHand(newAiHand);
        
        setCardsOnTable([]);
        setTurn(winner);
        setTrickStarter(winner);
        setMessage(`${trickMessage} ${winner === 'human' ? T.yourTurnMessage : T.aiTurnMessage(aiName)}`)

        if (newHumanHand.length === 0 && newAiHand.length === 0) {
            if (finalHumanScore > 60) {
              playSound('game-win');
            } else if (finalAiScore > 60) {
              playSound('game-lose');
            } else {
              playSound('trick-win'); // Neutral-positive sound for a tie
            }
            setPhase('gameOver');
        }
        setIsProcessing(false);
    };

    if (cardsOnTable.length === 2 && phase === 'playing') {
      resolveTrick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsOnTable, phase]);


  if (phase === 'menu' || !currentWaifu) {
    return (
      <Menu
        language={language}
        onLanguageChange={setLanguage}
        onStartGame={startGame}
      />
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
            turn={turn}
            onPlayCard={handlePlayCard}
            language={language}
        />
        
        {phase === 'gameOver' && (
            <GameOverModal
                humanScore={humanScore}
                aiScore={aiScore}
                aiName={aiName}
                onPlayAgain={startGame}
                language={language}
            />
        )}

        <ChatPanel 
            history={chatHistory} 
            aiName={aiName} 
            onSendMessage={handleSendChatMessage}
            isChatting={isAiChatting}
            isPlayerTurn={turn === 'human'}
            hasChattedThisTurn={hasChattedThisTurn}
            onModalClose={() => setIsChatModalOpen(false)}
            lang={language}
        />
        <button className="chat-fab" onClick={() => setIsChatModalOpen(true)} aria-label="Apri chat">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
        </button>
    </div>
  );
}