/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { SUITS_IT, VALUES_IT, SUITS_EN, VALUES_EN } from './constants';

export const translations = {
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
    chatWith: (name:string) => `Chat con ${name}`,
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