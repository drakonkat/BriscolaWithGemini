/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI, Type, Chat} from '@google/genai';
import {useEffect, useState, useMemo, useCallback, useRef} from 'react';
import ReactDOM from 'react-dom/client';

// --- GAME CONFIGURATION ---

const SUITS_IT = ['Bastoni', 'Coppe', 'Spade', 'denara'];
const VALUES_IT = ['Asso', '3', 'Re', 'Cavallo', 'Fante', '7', '6', '5', '4', '2'];
const SUITS_EN = ['Batons', 'Cups', 'Swords', 'Coins'];
const VALUES_EN = ['Ace', '3', 'King', 'Knight', 'Jack', '7', '6', '5', '4', '2'];

const POINTS: { [key: string]: number } = {
  'Asso': 11, '3': 10, 'Re': 4, 'Cavallo': 3, 'Fante': 2,
  '7': 0, '6': 0, '5': 0, '4': 0, '2': 0,
};
const RANK: { [key: string]: number } = {
  'Asso': 10, '3': 9, 'Re': 8, 'Cavallo': 7, 'Fante': 6,
  '7': 5, '6': 4, '5': 3, '4': 2, '2': 1,
};
const WAIFU_NAMES = ['Yuki', 'Aiko', 'Sakura', 'Hana', 'Mio', 'Rin', 'Emi', 'Asuna', 'Rei', 'Kasumi'];

// --- TRANSLATIONS ---

const translations = {
  it: {
    // Menu
    title: "Waifu Briscola",
    subtitle: "Sfida un'avversaria controllata da Gemini AI.",
    startGame: "Inizia Partita",
    language: "Lingua",
    rulesTitle: "Regole del Punteggio",
    winCondition: "Il mazzo ha un totale di 120 punti. Il primo giocatore a totalizzare più di 60 punti vince la partita.",
    otherCards: "Altre carte",
    scorePoints: (points: number) => `${points} punti`,
    // Game
    welcomeMessage: "Benvenuto! Inizia una nuova partita.",
    yourTurn: "Tocca a te iniziare.",
    aiStarts: (name: string) => `Inizia ${name}.`,
    aiThinking: (name: string) => `${name} sta pensando...`,
    aiPlayedYourTurn: (name: string) => `${name} ha giocato. Tocca a te.`,
    youWonTrick: (points: number) => `Hai vinto il turno (+${points} punti).`,
    aiWonTrick: (name: string, points: number) => `${name} ha vinto il turno (+${points} punti).`,
    yourTurnMessage: "Tocca a te.",
    aiTurnMessage: (name: string) => `Tocca a ${name}.`,
    scoreYou: "Tu",
    // Game Over
    gameOverTitle: "Partita Terminata",
    finalScore: "Punteggio Finale:",
    youWin: "Hai Vinto!",
    aiWins: (name: string) => `Ha Vinto ${name}!`,
    tie: "Pareggio!",
    playAgain: "Gioca Ancora",
    // Chat
    chatWith: (name: string) => `Chat con ${name}`,
    closeChat: "Chiudi chat",
    chatPlaceholder: "Scrivi un messaggio...",
    chatPlaceholderChatted: "Hai già chattato in questo turno.",
    chatPlaceholderNotYourTurn: "Attendi il tuo turno per chattare.",
    sendMessage: "Invia messaggio",
    sendMessageInProgress: "Invio in corso",
    chatFallback: "Scusa, senpai, mi sento un po' confusa...",
    // Card Names (for prompts and IDs)
    suits: SUITS_IT,
    values: VALUES_IT,
    cardIdConnector: " di ",
    // AI Prompts
    systemInstruction: (name: string) => `Sei ${name}, una 'waifu' giocosa e un po' sfacciata che gioca a Briscola contro l'utente (senpai). La tua personalità è carina, un po' civettuola e a volte prendi in giro l'utente. Mantieni le tue risposte brevi, concise (massimo 1-2 frasi), e nel personaggio. Parla in italiano. Non parlare delle regole del gioco a meno che non ti venga chiesto. Inizia la conversazione presentandoti e sfidando l'utente.`,
    initialChatMessage: "Inizia la conversazione",
    aiMovePrompt: (humanCardId: string | null, briscolaSuit: string, aiHandIds: string[]) => `
Sei un giocatore esperto di Briscola italiana. Il tuo obiettivo è vincere. Devi scegliere una carta da giocare dalla tua mano. Gioca in modo strategico.
Se sei il primo giocatore del turno (humanCardId è null), guida con una carta che ti dia la migliore possibilità di vincere punti o che costringa il tuo avversario a sprecare una carta di alto valore.
Se sei il secondo giocatore, decidi se puoi vincere il turno.
- L'umano ha giocato: ${humanCardId ?? 'N/A'}.
- Il seme di Briscola è: ${briscolaSuit}.
- La tua mano è: [${aiHandIds.join(', ')}].

Analizza la carta dell'umano e la tua mano.
- Se puoi vincere il turno, gioca la carta di minor valore che ti assicura comunque la vittoria.
- Se l'umano ha giocato una carta di alto valore (Asso o 3) e non puoi vincere, scarta una carta di basso valore senza punti (un "liscio").
- Se non puoi vincere il turno, gioca la tua carta con il punteggio più basso.
- Se stai guidando il turno, considera di giocare una briscola bassa per vedere cosa fa l'avversario, o una carta di basso valore in un altro seme.

In base a questa situazione, quale carta dalla tua mano è la migliore da giocare ora?
`,
    aiMoveSchemaDescription: (aiHandIds: string[]) => `La carta da giocare dalla tua mano. Deve essere una di: ${aiHandIds.join(', ')}`,
    // Waifu Trick Messages
    waifuMessages: {
      zero: [
        "Hehe, mi hai dato un 'liscio', senpai? Che timidone...",
        "Tutto qui? Speravo in qualcosa di più eccitante, baka!",
        "Oh, un regalo? Peccato non valga nulla... ma il pensiero è carino.",
      ],
      low: [
        "Mmm, solo questo? Non essere tirchio, senpai... So che puoi dare di più~",
        "Un piccolo assaggio... mi stai solo stuzzicando, vero?",
        "Carino... ma la prossima volta voglio un carico più grande.",
      ],
      medium: [
        "Aah, così si fa! Un bel bottino... mi fai arrossire!",
        "Mmm, non male senpai... Sento un brivido lungo la schiena.",
        "Preso! Sapevo che mi avresti dato una bella soddisfazione.",
      ],
      high: [
        "KYAAA! Così tanti tutti insieme?! Il mio cuore batte forte... Sei incredibile, senpai!",
        "Wow! Che presa! Mi hai lasciata senza fiato...",
        "Fantastico! Con tutti questi punti, mi sento davvero... piena.",
      ]
    }
  },
  en: {
    // Menu
    title: "Waifu Briscola",
    subtitle: "Challenge an opponent controlled by Gemini AI.",
    startGame: "Start Game",
    language: "Language",
    rulesTitle: "Scoring Rules",
    winCondition: "The deck has a total of 120 points. The first player to score more than 60 points wins the game.",
    otherCards: "Other cards",
    scorePoints: (points: number) => `${points} points`,
    // Game
    welcomeMessage: "Welcome! Start a new game.",
    yourTurn: "It's your turn to start.",
    aiStarts: (name: string) => `${name} starts.`,
    aiThinking: (name: string) => `${name} is thinking...`,
    aiPlayedYourTurn: (name: string) => `${name} played. It's your turn.`,
    youWonTrick: (points: number) => `You won the trick (+${points} points).`,
    aiWonTrick: (name: string, points: number) => `${name} won the trick (+${points} points).`,
    yourTurnMessage: "Your turn.",
    aiTurnMessage: (name: string) => `${name}'s turn.`,
    scoreYou: "You",
    // Game Over
    gameOverTitle: "Game Over",
    finalScore: "Final Score:",
    youWin: "You Win!",
    aiWins: (name: string) => `${name} Wins!`,
    tie: "It's a Tie!",
    playAgain: "Play Again",
    // Chat
    chatWith: (name: string) => `Chat with ${name}`,
    closeChat: "Close chat",
    chatPlaceholder: "Write a message...",
    chatPlaceholderChatted: "You've already chatted this turn.",
    chatPlaceholderNotYourTurn: "Wait for your turn to chat.",
    sendMessage: "Send message",
    sendMessageInProgress: "Sending...",
    chatFallback: "Sorry, senpai, I'm a bit confused right now...",
    // Card Names (for prompts and IDs)
    suits: SUITS_EN,
    values: VALUES_EN,
    cardIdConnector: " of ",
    // AI Prompts
    systemInstruction: (name: string) => `You are ${name}, a playful and slightly cheeky 'waifu' playing the card game Briscola against the user (senpai). Your personality is cute, a bit flirty, and you sometimes tease the user. Keep your responses short, concise (1-2 sentences max), and in character. Speak in English. Do not talk about the game rules unless asked. Start the conversation by introducing yourself and challenging the user.`,
    initialChatMessage: "Start the conversation",
    aiMovePrompt: (humanCardId: string | null, briscolaSuit: string, aiHandIds: string[]) => `
You are an expert Italian Briscola card game player. Your goal is to win. You must choose one card to play from your hand. Play strategically.
If you are the first player in the trick (humanCardId is null), lead with a card that gives you the best chance to win points or forces your opponent to waste a high-value card.
If you are the second player, decide if you can win the trick.
- The human played: ${humanCardId ?? 'N/A'}.
- The Briscola suit is: ${briscolaSuit}.
- Your hand is: [${aiHandIds.join(', ')}].

Analyze the human's card and your hand.
- If you can win the trick, play the lowest-value card that still wins.
- If the human played a high-value card (Ace or 3) and you can't win, throw away a low-value card with no points (a "liscio").
- If you can't win the trick, play your lowest point-value card.
- If you are leading, consider playing a low briscola to see what the opponent does, or a low-value card in another suit.

Based on this state, which card from your hand is the best to play now?
`,
    aiMoveSchemaDescription: (aiHandIds: string[]) => `The card to play from your hand. It must be one of: ${aiHandIds.join(', ')}`,
    // Waifu Trick Messages
    waifuMessages: {
      zero: [
        "Hehe, you gave me a 'liscio', senpai? Such a shy boy...",
        "Is that all? I was hoping for something more exciting, baka!",
        "Oh, a gift? Too bad it's worthless... but the thought is nice.",
      ],
      low: [
        "Mmm, just this? Don't be stingy, senpai... I know you can give more~",
        "A little taste... you're just teasing me, aren't you?",
        "Cute... but next time I want a bigger load.",
      ],
      medium: [
        "Aah, that's how it's done! A nice haul... you're making me blush!",
        "Mmm, not bad senpai... I feel a shiver down my spine.",
        "Got it! I knew you'd give me some good satisfaction.",
      ],
      high: [
        "KYAAA! So many all at once?! My heart is pounding... You're incredible, senpai!",
        "Wow! What a catch! You left me breathless...",
        "Fantastic! With all these points, I feel really... full.",
      ]
    }
  }
};

// --- TYPES ---

type Suit = 'Bastoni' | 'Coppe' | 'Spade' | 'denara';
type Value = 'Asso' | '3' | 'Re' | 'Cavallo' | 'Fante' | '7' | '6' | '5' | '4' | '2';
type Card = { suit: Suit; value: Value };
type Player = 'human' | 'ai';
type GamePhase = 'menu' | 'playing' | 'gameOver';
type ChatMessage = { sender: 'human' | 'ai'; text: string; };
type Language = 'it' | 'en';

// --- UTILITY FUNCTIONS ---

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS_IT as Suit[]) {
    for (const value of VALUES_IT as Value[]) {
      deck.push({ suit, value });
    }
  }
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getCardId = (card: Card, lang: Language): string => {
  const valueIndex = VALUES_IT.indexOf(card.value);
  const suitIndex = SUITS_IT.indexOf(card.suit);
  const translatedValue = translations[lang].values[valueIndex];
  const translatedSuit = translations[lang].suits[suitIndex];
  return `${translatedValue}${translations[lang].cardIdConnector}${translatedSuit}`;
}

const valueToFileNumber: { [key in Value]: number } = {
  'Asso': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  'Fante': 8, 'Cavallo': 9, 'Re': 10,
};

const getCardImagePath = (card: Card): string => {
  const suit = card.suit.toLowerCase();
  const number = valueToFileNumber[card.value];
  return `https://s3.tebi.io/waifubriscola/classic/${suit}${number}.png`;
};

// --- WAIFU MESSAGES ---
const getWaifuMessage = (points: number, lang: Language): string => {
  const messages = translations[lang].waifuMessages;
  let category: 'zero' | 'low' | 'medium' | 'high';
  if (points === 0) category = 'zero';
  else if (points <= 5) category = 'low';
  else if (points <= 11) category = 'medium';
  else category = 'high';
  
  const selectedMessages = messages[category];
  return selectedMessages[Math.floor(Math.random() * selectedMessages.length)];
};

// --- GEMINI AI LOGIC ---

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const getAIMove = async (
  aiHand: Card[],
  briscolaSuit: Suit,
  cardsOnTable: Card[],
  lang: Language
): Promise<Card> => {
    
  const langStrings = translations[lang];
  const aiHandIds = aiHand.map(card => getCardId(card, lang));
  const humanCard = cardsOnTable.length > 0 ? cardsOnTable[0] : null;
  const humanCardId = humanCard ? getCardId(humanCard, lang) : null;
  const briscolaSuitId = langStrings.suits[SUITS_IT.indexOf(briscolaSuit)];
  
  const prompt = langStrings.aiMovePrompt(humanCardId, briscolaSuitId, aiHandIds);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cardToPlay: {
              type: Type.STRING,
              description: langStrings.aiMoveSchemaDescription(aiHandIds),
            },
            reasoning: {
              type: Type.STRING,
              description: "A brief explanation of your choice."
            }
          },
          required: ["cardToPlay"]
        },
      },
    });

    const result = JSON.parse(response.text);
    const chosenCardId = result.cardToPlay;
    const chosenCard = aiHand.find(card => getCardId(card, lang) === chosenCardId);

    if (chosenCard) {
      return chosenCard;
    } else {
      console.warn("AI chose a card not in its hand, playing first valid card.");
      return aiHand[0];
    }
  } catch (error) {
      console.error("Error getting AI move:", error);
      // Fallback in case of API error
      return aiHand[Math.floor(Math.random() * aiHand.length)];
  }
};

// --- UI COMPONENTS ---

const CardView = ({ card, isFaceDown, onClick, isPlayable, lang }: { card: Card, isFaceDown?: boolean, onClick?: () => void, isPlayable?: boolean, lang: Language }) => {
  if (isFaceDown) {
    // Render the card back.
    return <div className="card card-back" aria-label="Carta coperta"></div>;
  }

  const cardId = getCardId(card, lang);
  const imagePath = getCardImagePath(card);

  return (
    <div
      className={`card ${isPlayable ? 'playable' : ''}`}
      onClick={onClick}
      role="button"
      aria-label={cardId}
      tabIndex={isPlayable ? 0 : -1}
    >
      <img src={imagePath} alt={cardId} />
    </div>
  );
};

const ChatPanel = ({ history, aiName, onSendMessage, isChatting, isPlayerTurn, hasChattedThisTurn, onModalClose, lang }: { history: ChatMessage[], aiName: string, onSendMessage: (msg: string) => void, isChatting: boolean, isPlayerTurn: boolean, hasChattedThisTurn: boolean, onModalClose?: () => void, lang: Language }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_MESSAGE_LENGTH = 150;
  const T = translations[lang];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const isDisabled = !isPlayerTurn || isChatting || hasChattedThisTurn;
  
  const getPlaceholder = () => {
    if (hasChattedThisTurn) return T.chatPlaceholderChatted;
    if (!isPlayerTurn) return T.chatPlaceholderNotYourTurn;
    return T.chatPlaceholder;
  };

  return (
    <aside className="chat-panel">
      <header className="chat-header">
        <h2>{T.chatWith(aiName)}</h2>
        <button className="chat-modal-close" onClick={onModalClose} aria-label={T.closeChat}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        </button>
      </header>
      <div className="chat-messages">
        {history.map((msg, index) => (
          <div key={index} className={`message-container ${msg.sender === 'human' ? 'human' : 'ai'}`}>
            <div className="message">{msg.text}</div>
          </div>
        ))}
        {isChatting && history[history.length - 1]?.sender === 'human' && (
            <div className="message-container ai">
                <div className="message typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={isDisabled}
            maxLength={MAX_MESSAGE_LENGTH}
            aria-label={T.chatPlaceholder}
          />
          <div className={`char-counter ${message.length > MAX_MESSAGE_LENGTH - 20 ? 'limit-near' : ''}`}>
            {message.length} / {MAX_MESSAGE_LENGTH}
          </div>
        </div>
        <button type="submit" disabled={isDisabled} aria-label={isChatting ? T.sendMessageInProgress : T.sendMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </aside>
  );
};

// --- MAIN GAME COMPONENT ---

function BriscolaGame() {
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
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [message, setMessage] = useState('');
  const [aiName, setAiName] = useState('');
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isAiChatting, setIsAiChatting] = useState(false);
  const [hasChattedThisTurn, setHasChattedThisTurn] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const T = useMemo(() => translations[language], [language]);

  useEffect(() => {
      setMessage(T.welcomeMessage);
  }, [T]);

  const briscolaSuit = useMemo(() => briscolaCard?.suit, [briscolaCard]);

  const startGame = () => {
    const newName = WAIFU_NAMES[Math.floor(Math.random() * WAIFU_NAMES.length)];
    setAiName(newName);

    const systemInstruction = T.systemInstruction(newName);
    const newChat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
    });
    setChatSession(newChat);
    setChatHistory([]);
    
    // Get initial message
    newChat.sendMessage({ message: T.initialChatMessage }).then(response => {
        setChatHistory([{ sender: 'ai', text: response.text }]);
    });

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
    setMessage(starter === 'human' ? T.yourTurn : T.aiStarts(newName));
  };
  
  const handleSendChatMessage = async (userMessage: string) => {
      if (!chatSession) return;
  
      setChatHistory(prev => [...prev, { sender: 'human', text: userMessage }]);
      setIsAiChatting(true);
      setHasChattedThisTurn(true);
  
      try {
        const response = await chatSession.sendMessage({ message: userMessage });
        setChatHistory(prev => [...prev, { sender: 'ai', text: response.text }]);
      } catch (error) {
        console.error("Error sending chat message:", error);
        setChatHistory(prev => [...prev, { sender: 'ai', text: T.chatFallback }]);
      } finally {
        setIsAiChatting(false);
      }
    };

  const getTrickWinner = useCallback((playedCards: Card[], starter: Player, briscola: Suit): Player => {
    const card1 = playedCards[0]; // lead card
    const card2 = playedCards[1]; // follow card
    const follower: Player = starter === 'human' ? 'ai' : 'human';
    const card1IsBriscola = card1.suit === briscola;
    const card2IsBriscola = card2.suit === briscola;

    if (card1IsBriscola && !card2IsBriscola) return starter;
    if (!card1IsBriscola && card2IsBriscola) return follower;
    if (card1IsBriscola && card2IsBriscola) {
      return RANK[card1.value] > RANK[card2.value] ? starter : follower;
    }
    if (card1.suit === card2.suit) {
        return RANK[card1.value] > RANK[card2.value] ? starter : follower;
    }
    return starter;
  }, []);

  const handlePlayCard = (card: Card) => {
    if (turn !== 'human' || isAiThinking || cardsOnTable.length === 2) return;
    
    setHumanHand(prev => prev.filter(c => getCardId(c, language) !== getCardId(card, language)));
    setCardsOnTable(prev => [...prev, card]);
    
    if (trickStarter === 'human') {
      setTurn('ai');
      setMessage(T.aiThinking(aiName));
    }
  };
  
  useEffect(() => {
    if (turn === 'ai' && phase === 'playing' && cardsOnTable.length < 2) {
      setIsAiThinking(true);
      const timer = setTimeout(async () => {
        if (!briscolaSuit) return;
        const aiCardToPlay = await getAIMove(aiHand, briscolaSuit, cardsOnTable, language);
        
        setAiHand(prev => prev.filter(c => getCardId(c, language) !== getCardId(aiCardToPlay, language)));
        setCardsOnTable(prev => [...prev, aiCardToPlay]);

        if (trickStarter === 'ai') {
          setTurn('human');
          setHasChattedThisTurn(false);
          setMessage(T.aiPlayedYourTurn(aiName));
        }
        setIsAiThinking(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [turn, aiHand, cardsOnTable, briscolaSuit, phase, trickStarter, aiName, language, T]);

  useEffect(() => {
    if (cardsOnTable.length === 2 && phase === 'playing') {
      const timer = setTimeout(() => {
        if(!briscolaSuit) return;
        const winner = getTrickWinner(cardsOnTable, trickStarter, briscolaSuit);
        const points = POINTS[cardsOnTable[0].value] + POINTS[cardsOnTable[1].value];
        
        let trickMessage = '';
        if (winner === 'human') {
          setHumanScore(s => s + points);
          setHasChattedThisTurn(false);
          trickMessage = T.youWonTrick(points);
        } else {
          setAiScore(s => s + points);
          const waifuMsg = getWaifuMessage(points, language);
          setChatHistory(prev => [...prev, {sender: 'ai', text: waifuMsg}]);
          trickMessage = T.aiWonTrick(aiName, points);
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
            setPhase('gameOver');
        }

      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [cardsOnTable, phase, getTrickWinner, trickStarter, briscolaSuit, deck, humanHand, aiHand, briscolaCard, aiName, language, T]);

  if (phase === 'menu') {
    return (
      <div className="menu">
        <h1>{T.title}</h1>
        <p>{T.subtitle}</p>
        <div className="language-selector">
            <label htmlFor="language-select">{T.language}:</label>
            <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
                <option value="it">Italiano</option>
                <option value="en">English</option>
            </select>
        </div>
        <button onClick={startGame}>{T.startGame}</button>
        <div className="rules">
          <h2>{T.rulesTitle}</h2>
          <ul>
            <li><strong>{T.values[0]}:</strong> {T.scorePoints(11)}</li>
            <li><strong>{T.values[1]}:</strong> {T.scorePoints(10)}</li>
            <li><strong>{T.values[2]}:</strong> {T.scorePoints(4)}</li>
            <li><strong>{T.values[3]}:</strong> {T.scorePoints(3)}</li>
            <li><strong>{T.values[4]}:</strong> {T.scorePoints(2)}</li>
            <li><strong>{T.otherCards}:</strong> {T.scorePoints(0)}</li>
          </ul>
          <p className="win-condition">{T.winCondition}</p>
        </div>
      </div>
    );
  }

  const finalMessage = humanScore > 60 ? T.youWin : (aiScore > 60 ? T.aiWins(aiName) : (humanScore === 60 ? T.tie : `${T.scoreYou}: ${humanScore} - ${aiName}: ${aiScore}`));

  return (
    <div className={`app-container ${isChatModalOpen ? 'chat-open-mobile' : ''}`}>
        <main className="game-board">
        {phase === 'gameOver' && (
            <div className="game-over-overlay">
            <div className="game-over-modal">
                <h2>{T.gameOverTitle}</h2>
                <p>{T.finalScore}</p>
                <p>{T.scoreYou}: {humanScore} - {aiName}: {aiScore}</p>
                <h3>{finalMessage}</h3>
                <button onClick={startGame}>{T.playAgain}</button>
            </div>
            </div>
        )}

        <div className="player-area ai-area">
            <div className="score">{aiName}: {aiScore}</div>
            <div className="hand">
                {aiHand.map((_, index) => <CardView key={index} card={{suit:'Spade', value:'2'}} isFaceDown lang={language} />)}
            </div>
        </div>

        <div className="table-area">
            <div className="deck-pile">
                {deck.length > 0 && <CardView card={{suit:'Spade', value:'2'}} isFaceDown lang={language} />}
                {briscolaCard && <CardView card={briscolaCard} lang={language} />}
                <span className="deck-count" aria-live="polite">{deck.length}</span>
            </div>
            <div className="played-cards">
                {cardsOnTable.map((card) => <CardView key={getCardId(card, language)} card={card} lang={language} />)}
                {isAiThinking && <div className="spinner" aria-label="L'IA sta pensando"></div>}
            </div>
            <div className="message-log" aria-live="polite">{message}</div>
        </div>

        <div className="player-area human-area">
            <div className="score">{T.scoreYou}: {humanScore}</div>
            <div className="hand">
                {humanHand.map(card => (
                    <CardView
                        key={getCardId(card, language)}
                        card={card}
                        isPlayable={turn === 'human' && !isAiThinking}
                        onClick={() => handlePlayCard(card)}
                        lang={language}
                    />
                ))}
            </div>
        </div>
        </main>
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

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<BriscolaGame />);