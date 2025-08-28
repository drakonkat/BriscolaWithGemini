/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI, Type} from '@google/genai';
import {useEffect, useState, useMemo, useCallback} from 'react';
import ReactDOM from 'react-dom/client';

// --- GAME CONFIGURATION ---

const SUITS = ['Bastoni', 'Coppe', 'Spade', 'Denari'];
const VALUES = ['Asso', '3', 'Re', 'Cavallo', 'Fante', '7', '6', '5', '4', '2'];
const POINTS: { [key: string]: number } = {
  'Asso': 11, '3': 10, 'Re': 4, 'Cavallo': 3, 'Fante': 2,
  '7': 0, '6': 0, '5': 0, '4': 0, '2': 0,
};
const RANK: { [key: string]: number } = {
  'Asso': 10, '3': 9, 'Re': 8, 'Cavallo': 7, 'Fante': 6,
  '7': 5, '6': 4, '5': 3, '4': 2, '2': 1,
};

// --- TYPES ---

type Suit = 'Bastoni' | 'Coppe' | 'Spade' | 'Denari';
type Value = 'Asso' | '3' | 'Re' | 'Cavallo' | 'Fante' | '7' | '6' | '5' | '4' | '2';
type Card = { suit: Suit; value: Value };
type Player = 'human' | 'ai';
type GamePhase = 'menu' | 'playing' | 'gameOver';

// --- UTILITY FUNCTIONS ---

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS as Suit[]) {
    for (const value of VALUES as Value[]) {
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

const getCardId = (card: Card): string => `${card.value} di ${card.suit}`;

const valueToFileNumber: { [key in Value]: number } = {
  'Asso': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  'Fante': 8, 'Cavallo': 9, 'Re': 10,
};

const getCardImagePath = (card: Card): string => {
  const suit = card.suit.toLowerCase();
  const number = valueToFileNumber[card.value];
  return `./assets/${suit}${number}.png`;
};


// --- GEMINI AI LOGIC ---

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const getAIMove = async (
  aiHand: Card[],
  briscolaSuit: Suit,
  cardsOnTable: Card[],
): Promise<Card> => {
    
  const aiHandIds = aiHand.map(getCardId);
  const humanCard = cardsOnTable.length > 0 ? cardsOnTable[0] : null;

  const prompt = `
You are an expert Italian Briscola card game player. Your goal is to win. You must choose one card to play from your hand. Play strategically.
If you are the first player in the trick (humanCard is null), lead with a card that gives you the best chance to win points or forces your opponent to waste a high-value card.
If you are the second player, decide if you can win the trick.
- The human played: ${humanCard ? getCardId(humanCard) : 'N/A'}.
- The Briscola suit is: ${briscolaSuit}.
- Your hand is: [${aiHandIds.join(', ')}].

Analyze the human's card and your hand.
- If you can win the trick, play the lowest-value card that still wins.
- If the human played a high-value card (Asso or 3) and you can't win, throw away a low-value card with no points (a "liscio").
- If you can't win the trick, play your lowest point-value card.
- If you are leading, consider playing a low briscola to see what the opponent does, or a low-value card in another suit.

Based on this state, which card from your hand is the best to play now?
`;

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
              description: `The card to play from your hand. It must be one of: ${aiHandIds.join(', ')}`,
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
    const chosenCard = aiHand.find(card => getCardId(card) === chosenCardId);

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

const CardView = ({ card, isFaceDown, onClick, isPlayable }: { card: Card, isFaceDown?: boolean, onClick?: () => void, isPlayable?: boolean }) => {
  if (isFaceDown) {
    // Render the card back. Assuming an image `assets/back.png` exists.
    return <div className="card card-back" aria-label="Carta coperta"></div>;
  }

  const cardId = getCardId(card);
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


// --- MAIN GAME COMPONENT ---

function BriscolaGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
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
  const [message, setMessage] = useState('Benvenuto! Inizia una nuova partita.');

  const briscolaSuit = useMemo(() => briscolaCard?.suit, [briscolaCard]);

  const startGame = () => {
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
    setMessage(starter === 'human' ? 'Tocca a te iniziare.' : 'Inizia l\'IA.');
  };

  const getTrickWinner = useCallback((playedCards: Card[], starter: Player, briscola: Suit): Player => {
    const card1 = playedCards[0]; // lead card
    const card2 = playedCards[1]; // follow card
    
    // FIX: Refactored logic to be more readable and to fix a TypeScript error
    // where the returned player type was inferred as 'string' instead of 'Player'.
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
    } else {
        return starter;
    }
  }, []);

  const handlePlayCard = (card: Card) => {
    if (turn !== 'human' || isAiThinking || cardsOnTable.length === 2) return;
    
    setHumanHand(prev => prev.filter(c => getCardId(c) !== getCardId(card)));
    setCardsOnTable(prev => [...prev, card]);
    
    if (trickStarter === 'human') {
      setTurn('ai');
      setMessage('L\'IA sta pensando...');
    }
  };
  
  useEffect(() => {
    if (turn === 'ai' && phase === 'playing' && cardsOnTable.length < 2) {
      setIsAiThinking(true);
      const timer = setTimeout(async () => {
        const aiCardToPlay = await getAIMove(aiHand, briscolaSuit!, cardsOnTable);
        
        setAiHand(prev => prev.filter(c => getCardId(c) !== getCardId(aiCardToPlay)));
        setCardsOnTable(prev => [...prev, aiCardToPlay]);

        if (trickStarter === 'ai') {
          setTurn('human');
          setMessage('L\'IA ha giocato. Tocca a te.');
        }
        setIsAiThinking(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [turn, aiHand, cardsOnTable, briscolaSuit, phase, trickStarter]);

  useEffect(() => {
    if (cardsOnTable.length === 2 && phase === 'playing') {
      const timer = setTimeout(() => {
        const winner = getTrickWinner(cardsOnTable, trickStarter, briscolaSuit!);
        const points = POINTS[cardsOnTable[0].value] + POINTS[cardsOnTable[1].value];
        
        if (winner === 'human') {
          setHumanScore(s => s + points);
        } else {
          setAiScore(s => s + points);
        }
        setMessage(`${winner === 'human' ? 'Hai vinto' : 'L\'IA ha vinto'} il turno (+${points} punti).`);
        
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
        setMessage(prev => `${prev} ${winner === 'human' ? 'Tocca a te.' : 'Tocca all\'IA.'}`)

        if (newHumanHand.length === 0 && newAiHand.length === 0) {
            setPhase('gameOver');
        }

      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [cardsOnTable, phase, getTrickWinner, trickStarter, briscolaSuit, deck, humanHand, aiHand, briscolaCard]);

  if (phase === 'menu') {
    return (
      <div className="menu">
        <h1>Briscola AI</h1>
        <p>Sfida un'avversaria controllata da Gemini AI.</p>
        <button onClick={startGame}>Inizia Partita</button>
        <div className="rules">
          <h2>Regole del Punteggio</h2>
          <ul>
            <li><strong>Asso:</strong> 11 punti</li>
            <li><strong>Tre:</strong> 10 punti</li>
            <li><strong>Re:</strong> 4 punti</li>
            <li><strong>Cavallo:</strong> 3 punti</li>
            <li><strong>Fante:</strong> 2 punti</li>
            <li><strong>Altre carte:</strong> 0 punti</li>
          </ul>
          <p className="win-condition">Il mazzo ha un totale di 120 punti. Il primo giocatore a totalizzare più di 60 punti vince la partita.</p>
        </div>
      </div>
    );
  }

  const finalMessage = humanScore > 60 ? 'Hai Vinto!' : (aiScore > 60 ? 'Ha Vinto l\'IA!' : (humanScore === 60 ? 'Pareggio!' : `Tu: ${humanScore} - IA: ${aiScore}`));

  return (
    <main className="game-board">
      {phase === 'gameOver' && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>Partita Terminata</h2>
            <p>Punteggio Finale:</p>
            <p>Tu: {humanScore} - IA: {aiScore}</p>
            <h3>{finalMessage}</h3>
            <button onClick={startGame}>Gioca Ancora</button>
          </div>
        </div>
      )}

      <div className="player-area ai-area">
        <div className="score">IA: {aiScore}</div>
        <div className="hand">
            {aiHand.map((_, index) => <CardView key={index} card={{suit:'Spade', value:'2'}} isFaceDown />)}
        </div>
      </div>

      <div className="table-area">
        <div className="deck-pile">
            {deck.length > 0 && <CardView card={{suit:'Spade', value:'2'}} isFaceDown />}
            {briscolaCard && <CardView card={briscolaCard} />}
            <span className="deck-count" aria-live="polite">{deck.length}</span>
        </div>
        <div className="played-cards">
            {cardsOnTable.map((card) => <CardView key={getCardId(card)} card={card} />)}
            {isAiThinking && <div className="spinner" aria-label="L'IA sta pensando"></div>}
        </div>
        <div className="message-log" aria-live="polite">{message}</div>
      </div>

      <div className="player-area human-area">
        <div className="score">Tu: {humanScore}</div>
        <div className="hand">
            {humanHand.map(card => (
                <CardView
                    key={getCardId(card)}
                    card={card}
                    isPlayable={turn === 'human' && !isAiThinking}
                    onClick={() => handlePlayCard(card)}
                />
            ))}
        </div>
      </div>
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<BriscolaGame />);