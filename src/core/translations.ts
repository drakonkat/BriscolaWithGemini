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
    projectDescription1: "Questo è un piccolo progetto senza pretese, nato per divertimento. L'obiettivo è aggiungere gradualmente nuove funzionalità, più mazzi di carte e, soprattutto, tantissime nuove Waifu con personalità uniche tutte da scoprire!",
    projectDescription2: "I fondi raccolti dalle donazioni serviranno ad assumere disegnatori e artisti per migliorare sempre più le waifu e il gioco, così da ridistribuire la ricchezza tra gli umani e non far rubare il loro lavoro all'IA.",
    startGame: "Inizia Partita",
    language: "Lingua",
    gameModeLabel: "Modalità di Gioco",
    toggleChatLabel: "Abilita Chat Waifu",
    gameModeClassic: "Briscola Classica",
    gameModeRoguelike: "Modalità Roguelike",
    comingSoon: " (Prossimamente)",
    comingSoonTooltip: "Questa modalità sarà presto disponibile!",
    rulesTitle: "Regole del Punteggio",
    refreshBackground: "Cambia Sfondo",
    winCondition: "Il mazzo ha un totale di 120 punti. Il primo giocatore a totalizzare più di 60 punti vince la partita.",
    otherCards: "Altre carte",
    scorePoints: (points: number) => `${points} punti`,
    waifuCoinRulesTitle: "Guadagnare Waifu Coins",
    waifuCoinRuleLoss: "Sconfitta o Pareggio: +20 Waifu Coins",
    waifuCoinRuleWin61: "Vittoria (61-80 punti): +45 Waifu Coins",
    waifuCoinRuleWin81: "Vittoria (81-101 punti): +70 Waifu Coins",
    waifuCoinRuleWin101: "Vittoria (102+ punti): +100 Waifu Coins",
    gachaRulesTitle: "Regole del Gacha",
    gachaRule50Percent: "Ogni tiro ha una probabilità del 50% di sbloccare uno sfondo.",
    gachaRuleRarityTitle: "Se il tiro ha successo, le probabilità di rarità sono:",
    gachaRuleRarityR: "Rarità R: 80%",
    gachaRuleRaritySR: "Rarità SR: 15%",
    gachaRuleRaritySSR: "Rarità SSR: 5%",
    chooseOpponent: "Scegli la tua avversaria",
    randomOpponent: "Avversaria Casuale",
    waifuAvatarAlt: (name: string) => `Avatar di ${name}`,
    close: "Chiudi",
    buyWaifuCoffee: "Supporta la tua Waifu",
    supportEmail: "Contatta Supporto",
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
    gameBoardBackground: "Sfondo del tavolo da gioco",
    offlineModeActive: "Limite API raggiunto. Si continua con l'IA locale.",
    backToMenu: "Torna al Menu",
    cardBack: "Retro della carta",
    tokensUsed: "Token Usati",
    briscolaLabel: "Briscola",
    remainingCardsLabel: "Carte Rimanenti",
    // Game Over
    gameOverTitle: "Partita Terminata",
    finalScore: "Punteggio Finale:",
    youWin: "Hai Vinto!",
    aiWins: (name: string) => `Ha Vinto ${name}!`,
    tie: "Pareggio!",
    playAgain: "Gioca Ancora",
    coinsEarned: (coins: number) => `+${coins} Waifu Coins`,
    // Chat
    chatWith: (name:string) => `Chat con ${name}`,
    closeChat: "Chiudi chat",
    chatPlaceholder: "Scrivi un messaggio...",
    chatPlaceholderChatted: "Hai già chattato in questo turno.",
    chatPlaceholderNotYourTurn: "Attendi il tuo turno per chattare.",
    chatPlaceholderOffline: "La chat è disabilitata in modalità offline.",
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
    waifuTrickWinPrompt: (waifuName: string, personality: string, humanCardId: string, aiCardId: string, points: number) => `
Sei ${waifuName}. La tua personalità attuale è: "${personality}".
Hai appena vinto un turno a Briscola contro senpai.
- Senpai ha giocato: ${humanCardId}.
- Tu hai giocato: ${aiCardId}, e hai vinto il turno.
- Hai vinto ${points} punti.

Basandoti sulla tua personalità e sui punti che hai vinto, genera una risposta breve e caratteristica per senpai (1-2 frasi).
Sii maliziosa, un po' stuzzicante e leggermente allusiva, specialmente se i punti sono alti. Sii creativa e unica.
La risposta deve essere in italiano.
`,
    // Quota Exceeded
    quotaExceeded: {
        title: "Quota API Esaurita",
        message: "Purtroppo abbiamo raggiunto il limite di richieste giornaliere all'IA. Puoi continuare a giocare contro un'IA più semplice.",
        continueGame: "Continua a Giocare",
        quotaInfo: "Le quote si resettano ogni giorno. Grazie per la tua pazienza!",
    },
    // Confirm Leave
    confirmLeave: {
        title: "Uscire dalla Partita?",
        message: "Sei sicuro di voler tornare al menu principale? Tutti i progressi della partita andranno persi.",
        confirm: "Sì, esci",
        cancel: "Annulla"
    },
    // Support Modal
    supportModal: {
        title: "Supporta il Progetto",
        message: "Waifu Briscola è un progetto gratuito. Le tue donazioni aiutano a coprire i costi dell'IA per tutti. In alternativa, facci sapere se saresti interessato a un abbonamento personale per un accesso illimitato!",
        subscriptionButton: "Pagherei per un abbonamento",
        subscriptionInterestThanks: "Grazie per il tuo feedback!",
    },
    // Gallery
    gallery: {
        title: "Galleria Sfondi",
        backgroundAlt: "Sfondo",
        gachaButton: "Gacha! (100 WC)",
        gachaButtonFree: "Primo Gacha Gratis!",
        promoButton: "Galleria & Gacha",
        gachaNotEnoughCoins: "Non hai abbastanza Waifu Coins! (Costo: 100)",
        gachaSuccess: (rarity: string) => `Congratulazioni! Hai sbloccato un nuovo sfondo (${rarity})!`,
        gachaFailure: "Nessuna fortuna questa volta. Riprova!",
        gachaAllUnlocked: "Hai sbloccato tutti gli sfondi!",
        locked: "Bloccato",
        download: "Scarica",
        fullscreenView: "Visualizza a schermo intero",
    },
    // Legal Modals
    privacyPolicy: {
        linkText: "Privacy Policy",
        title: "Privacy Policy di Waifu Briscola",
        lastUpdatedPrefix: "Ultimo aggiornamento:",
        lastUpdatedDate: "25 Maggio 2024",
        contactPrefix: "Referente:",
        contactName: "Mauro Mazzocchetti",
        intro: "Questa Privacy Policy descrive come le tue informazioni vengono gestite quando utilizzi l'applicazione Waifu Briscola ('Servizio').",
        collection: {
            title: "Informazioni che raccogliamo",
            intro: "Per migliorare la tua esperienza, utilizziamo servizi di terze parti che possono raccogliere informazioni:",
            posthog: {
                title: "Dati di utilizzo (PostHog):",
                text: "Raccogliamo dati di analisi anonimi o pseudonimi su come interagisci con il gioco. Questo include eventi come l'inizio di una partita, le carte giocate e i risultati finali. Questi dati ci aiutano a capire come viene utilizzato il gioco e come possiamo migliorarlo. Non raccogliamo informazioni di identificazione personale (PII) attraverso PostHog."
            },
            gemini: {
                title: "Interazioni con l'IA (Google Gemini):",
                text: "I messaggi di chat che invii e le informazioni sullo stato del gioco (come le carte nella tua mano e sul tavolo) vengono inviati all'API di Google Gemini per generare le risposte e le mosse dell'IA. Queste interazioni sono soggette alla <a href='https://policies.google.com/privacy' target='_blank' rel='noopener noreferrer'>Privacy Policy di Google</a>. Non inviamo alcuna informazione personale a Google oltre al contenuto delle tue interazioni di gioco."
            }
        },
        usage: {
            title: "Come utilizziamo le tue informazioni",
            intro: "Utilizziamo le informazioni raccolte per:",
            points: [
                "Fornire, operare e mantenere il nostro Servizio.",
                "Migliorare, personalizzare ed espandere il nostro Servizio.",
                "Comprendere e analizzare come utilizzi il nostro Servizio.",
                "Prevenire abusi e garantire la sicurezza."
            ]
        },
        sharing: {
            title: "Condivisione delle informazioni",
            text: "Non condividiamo le tue informazioni personali con nessuno, ad eccezione dei fornitori di servizi di terze parti (PostHog, Google) necessari per il funzionamento dell'applicazione, come descritto sopra."
        },
        security: {
            title: "Sicurezza dei dati",
            text: "La sicurezza delle tue informazioni è importante per noi, ma ricorda che nessun metodo di trasmissione su Internet o metodo di archiviazione elettronica è sicuro al 100%."
        },
        changes: {
            title: "Modifiche a questa Privacy Policy",
            text: "Potremmo aggiornare la nostra Privacy Policy di volta in volta. Ti informeremo di eventuali modifiche pubblicando la nuova Privacy Policy su questa pagina."
        },
        contact: {
            title: "Contattaci",
            text: "Se hai domande su questa Privacy Policy, puoi contattare il referente Mauro Mazzocchetti."
        }
    },
    termsAndConditions: {
        linkText: "Termini e Condizioni",
        title: "Termini e Condizioni di Waifu Briscola",
        lastUpdatedPrefix: "Ultimo aggiornamento:",
        lastUpdatedDate: "25 Maggio 2024",
        contactPrefix: "Referente:",
        contactName: "Mauro Mazzocchetti",
        intro: "Benvenuto in Waifu Briscola! Questi termini e condizioni delineano le regole per l'utilizzo dell'applicazione Waifu Briscola ('Servizio').",
        acceptance: {
            title: "Accettazione dei Termini",
            text: "Accedendo e utilizzando questo Servizio, accetti di essere vincolato da questi Termini. Se non sei d'accordo con qualsiasi parte dei termini, non puoi utilizzare il Servizio."
        },
        usage: {
            title: "Utilizzo del Servizio",
            text: "Accetti di non utilizzare il Servizio per scopi illegali o non autorizzati. Sei responsabile della tua condotta e di qualsiasi contenuto che fornisci durante l'utilizzo del Servizio, inclusi i messaggi di chat."
        },
        aiContent: {
            title: "Contenuti Generati dall'IA",
            intro: "Il Servizio utilizza modelli di intelligenza artificiale (Google Gemini) per generare risposte, commenti e mosse di gioco. Riconosci che:",
            points: [
                "I contenuti generati dall'IA sono prodotti da un modello e potrebbero non essere sempre accurati, appropriati o coerenti.",
                "Non siamo responsabili per i contenuti generati dall'IA.",
                "Le interazioni con l'IA sono pensate solo per scopi di intrattenimento."
            ]
        },
        liability: {
            title: "Limitazione di Responsabilità",
            text: "In nessun caso Mauro Mazzocchetti, né i suoi partner, saranno responsabili per eventuali danni indiretti, incidentali, speciali, consequenziali o punitivi, inclusi, senza limitazione, la perdita di profitti, dati, avviamento o altre perdite immateriali, derivanti da (i) il tuo accesso o utilizzo o incapacità di accedere o utilizzare il Servizio; (ii) qualsiasi contenuto ottenuto dal Servizio."
        },
        changes: {
            title: "Modifiche ai Termini",
            text: "Ci riserviamo il diritto, a nostra esclusiva discrezione, di modificare o sostituire questi Termini in qualsiasi momento. Continuando ad accedere o utilizzare il nostro Servizio dopo che tali revisioni diventano efficaci, accetti di essere vincolato dai termini rivisti."
        },
        governingLaw: {
            title: "Legge Applicabile",
            text: "Questi Termini saranno regolati e interpretati in conformità con le leggi italiane, senza riguardo alle sue disposizioni sul conflitto di leggi."
        }
    },
  },
  en: {
    // Menu
    title: "Waifu Briscola",
    subtitle: "Challenge an opponent controlled by Gemini AI.",
    projectDescription1: "This is a small, unpretentious project, born for fun. The goal is to gradually add new features, more card decks, and, most importantly, lots of new Waifus with unique personalities to discover!",
    projectDescription2: "The funds raised from donations will be used to hire designers and artists to continuously improve the waifus and the game, thereby redistributing wealth among humans and preventing AI from stealing their jobs.",
    startGame: "Start Game",
    language: "Language",
    gameModeLabel: "Game Mode",
    toggleChatLabel: "Enable Waifu Chat",
    gameModeClassic: "Classic Briscola",
    gameModeRoguelike: "Roguelike Mode",
    comingSoon: " (Coming Soon)",
    comingSoonTooltip: "This mode will be available soon!",
    rulesTitle: "Scoring Rules",
    refreshBackground: "Change Background",
    winCondition: "The deck has a total of 120 points. The first player to score more than 60 points wins the game.",
    otherCards: "Other cards",
    scorePoints: (points: number) => `${points} points`,
    waifuCoinRulesTitle: "Earning Waifu Coins",
    waifuCoinRuleLoss: "Loss or Tie: +20 Waifu Coins",
    waifuCoinRuleWin61: "Win (61-80 points): +45 Waifu Coins",
    waifuCoinRuleWin81: "Win (81-101 points): +70 Waifu Coins",
    waifuCoinRuleWin101: "Win (102+ points): +100 Waifu Coins",
    gachaRulesTitle: "Gacha Rules",
    gachaRule50Percent: "Each roll has a 50% chance to unlock a background.",
    gachaRuleRarityTitle: "If the roll is successful, the rarity probabilities are:",
    gachaRuleRarityR: "R Rarity: 80%",
    gachaRuleRaritySR: "SR Rarity: 15%",
    gachaRuleRaritySSR: "SSR Rarity: 5%",
    chooseOpponent: "Choose your opponent",
    randomOpponent: "Random Opponent",
    waifuAvatarAlt: (name: string) => `Avatar of ${name}`,
    close: "Close",
    buyWaifuCoffee: "Support your Waifu",
    supportEmail: "Contact Support",
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
    gameBoardBackground: "Game board background",
    offlineModeActive: "API limit reached. Continuing with local AI.",
    backToMenu: "Back to Menu",
    cardBack: "Card back",
    tokensUsed: "Tokens Used",
    briscolaLabel: "Trump",
    remainingCardsLabel: "Cards Remaining",
    // Game Over
    gameOverTitle: "Game Over",
    finalScore: "Final Score:",
    youWin: "You Win!",
    aiWins: (name: string) => `${name} Wins!`,
    tie: "It's a Tie!",
    playAgain: "Play Again",
    coinsEarned: (coins: number) => `+${coins} Waifu Coins`,
    // Chat
    chatWith: (name: string) => `Chat with ${name}`,
    closeChat: "Close chat",
    chatPlaceholder: "Write a message...",
    chatPlaceholderChatted: "You've already chatted this turn.",
    chatPlaceholderNotYourTurn: "Wait for your turn to chat.",
    chatPlaceholderOffline: "Chat is disabled in offline mode.",
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
    waifuTrickWinPrompt: (waifuName: string, personality: string, humanCardId: string, aiCardId: string, points: number) => `
You are ${waifuName}. Your current personality is: "${personality}".
You just won a trick in a game of Briscola against senpai.
- Senpai played: ${humanCardId}.
- You played: ${aiCardId}, and won the trick.
- You won ${points} points.

Based on your personality and the points you won, generate a short, in-character response to senpai (1-2 sentences).
Make it flirty, a bit teasing, and slightly suggestive, especially if the points are high. Be creative and unique.
The response must be in English.
`,
    // Quota Exceeded
    quotaExceeded: {
        title: "API Quota Exceeded",
        message: "Unfortunately, we've hit our daily AI request limit. You can continue playing against a simpler AI.",
        continueGame: "Continue Playing",
        quotaInfo: "Quotas reset daily. Thanks for your patience!",
    },
    // Confirm Leave
    confirmLeave: {
        title: "Leave Game?",
        message: "Are you sure you want to return to the main menu? All game progress will be lost.",
        confirm: "Yes, Leave",
        cancel: "Cancel"
    },
    // Support Modal
    supportModal: {
        title: "Support the Project",
        message: "Waifu Briscola is a free project. Your donations help cover the AI costs for everyone. Alternatively, let us know if you'd be interested in a personal subscription for unlimited access!",
        subscriptionButton: "I'd Pay for a Subscription",
        subscriptionInterestThanks: "Thanks for your feedback!",
    },
    // Gallery
    gallery: {
        title: "Background Gallery",
        backgroundAlt: "Background",
        gachaButton: "Gacha! (100 WC)",
        gachaButtonFree: "First Gacha Free!",
        promoButton: "Gallery & Gacha",
        gachaNotEnoughCoins: "Not enough Waifu Coins! (Cost: 100)",
        gachaSuccess: (rarity: string) => `Congratulations! You unlocked a new background (${rarity})!`,
        gachaFailure: "No luck this time. Try again!",
        gachaAllUnlocked: "You've unlocked all backgrounds!",
        locked: "Locked",
        download: "Download",
        fullscreenView: "View fullscreen",
    },
    // Legal Modals
    privacyPolicy: {
        linkText: "Privacy Policy",
        title: "Waifu Briscola Privacy Policy",
        lastUpdatedPrefix: "Last updated:",
        lastUpdatedDate: "May 25, 2024",
        contactPrefix: "Contact Person:",
        contactName: "Mauro Mazzocchetti",
        intro: "This Privacy Policy describes how your information is handled when you use the Waifu Briscola application ('Service').",
        collection: {
            title: "Information We Collect",
            intro: "To improve your experience, we use third-party services that may collect information:",
            posthog: {
                title: "Usage Data (PostHog):",
                text: "We collect anonymous or pseudonymous analytics data about how you interact with the game. This includes events like starting a game, cards played, and final results. This data helps us understand how the game is used and how we can improve it. We do not collect Personally Identifiable Information (PII) through PostHog."
            },
            gemini: {
                title: "AI Interactions (Google Gemini):",
                text: "The chat messages you send and game state information (like cards in your hand and on the table) are sent to the Google Gemini API to generate AI responses and moves. These interactions are subject to the <a href='https://policies.google.com/privacy' target='_blank' rel='noopener noreferrer'>Google Privacy Policy</a>. We do not send any personal information to Google beyond the content of your game interactions."
            }
        },
        usage: {
            title: "How We Use Your Information",
            intro: "We use the collected information to:",
            points: [
                "Provide, operate, and maintain our Service.",
                "Improve, personalize, and expand our Service.",
                "Understand and analyze how you use our Service.",
                "Prevent abuse and ensure security."
            ]
        },
        sharing: {
            title: "Information Sharing",
            text: "We do not share your personal information with anyone except for the third-party service providers (PostHog, Google) necessary for the application to function, as described above."
        },
        security: {
            title: "Data Security",
            text: "The security of your information is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure."
        },
        changes: {
            title: "Changes to This Privacy Policy",
            text: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page."
        },
        contact: {
            title: "Contact Us",
            text: "If you have any questions about this Privacy Policy, you can contact the person in charge, Mauro Mazzocchetti."
        }
    },
    termsAndConditions: {
        linkText: "Terms & Conditions",
        title: "Waifu Briscola Terms and Conditions",
        lastUpdatedPrefix: "Last updated:",
        lastUpdatedDate: "May 25, 2024",
        contactPrefix: "Contact Person:",
        contactName: "Mauro Mazzocchetti",
        intro: "Welcome to Waifu Briscola! These terms and conditions outline the rules for using the Waifu Briscola application ('Service').",
        acceptance: {
            title: "Acceptance of Terms",
            text: "By accessing and using this Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not use the Service."
        },
        usage: {
            title: "Use of the Service",
            text: "You agree not to use the Service for any illegal or unauthorized purpose. You are responsible for your conduct and any content you provide while using the Service, including chat messages."
        },
        aiContent: {
            title: "AI-Generated Content",
            intro: "The Service uses artificial intelligence models (Google Gemini) to generate responses, commentary, and game moves. You acknowledge that:",
            points: [
                "AI-generated content is produced by a model and may not always be accurate, appropriate, or consistent.",
                "We are not responsible for the content generated by the AI.",
                "Interactions with the AI are for entertainment purposes only."
            ]
        },
        liability: {
            title: "Limitation of Liability",
            text: "In no event shall Mauro Mazzocchetti, nor his partners, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any content obtained from the Service."
        },
        changes: {
            title: "Changes to Terms",
            text: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms."
        },
        governingLaw: {
            title: "Governing Law",
            text: "These Terms shall be governed and construed in accordance with the laws of Italy, without regard to its conflict of law provisions."
        }
    },
  }
};