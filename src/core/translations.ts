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
    difficultyLabel: "Difficoltà",
    difficultyEasy: "Facile",
    difficultyMedium: "Normale",
    difficultyHard: "Difficile",
    toggleChatLabel: "Abilita Chat Waifu",
    toggleWaitForWaifuLabel: "Attendi Risposta Waifu",
    fastModeEnabled: "Modalità veloce attivata: il gioco non attenderà più la risposta della Waifu.",
    gameModeClassic: "Briscola Classica",
    gameModeRoguelike: "Modalità Roguelike",
    comingSoon: " (Prossimamente)",
    comingSoonTooltip: "Questa modalità sarà presto disponibile!",
    rulesTitle: "Regole del Punteggio",
    refreshBackground: "Cambia Sfondo",
    winCondition: "Il mazzo ha un totale di 120 punti. Il primo giocatore a totalizzare più di 60 punti vince la partita.",
    otherCards: "Altre carte",
    scorePoints: (points: number) => `${points} punti`,
    waifuCoinRulesTitle: "Guadagnare Waifu Coins (Difficoltà Attuale)",
    waifuCoinRuleLoss: (coins: number) => `Sconfitta o Pareggio: +${coins} Waifu Coins`,
    waifuCoinRuleWin61: (coins: number) => `Vittoria (61-80 punti): +${coins} Waifu Coins`,
    waifuCoinRuleWin81: (coins: number) => `Vittoria (81-101 punti): +${coins} Waifu Coins`,
    waifuCoinRuleWin101: (coins: number) => `Vittoria (102+ punti): +${coins} Waifu Coins`,
    waifuCoinDifficultyMultiplier: "Moltiplicatore Difficoltà",
    waifuCoinDifficultyMultiplierInfo: "Il guadagno di monete cambia in base alla difficoltà selezionata nel menu:",
    waifuCoinDifficultyMultiplierEasy: "Facile: 50% delle monete base.",
    waifuCoinDifficultyMultiplierMedium: "Normale: 100% delle monete base.",
    waifuCoinDifficultyMultiplierHard: "Hard: 150% delle monete base.",
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
    waifuDetails: (name: string) => `Dettagli su ${name}`,
    buyWaifuCoffee: "Supporta la tua Waifu",
    supportEmail: "Contatta Supporto",
    toggleMusic: "Attiva/Disattiva Musica",
    soundtrackLabel: "Colonna Sonora",
    soundtrackEpic: "Musica Epica",
    soundtrackChill: "Musica chill",
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
    // Roguelike Mode
    roguelike: {
      mapTitle: "Mappa Roguelike",
      level: (level: number) => `Livello ${level}`,
      reward: (coins: number) => `Ricompensa: ${coins} WC`,
      startRun: "Inizia la Run",
      continueRun: "Continua",
      runFailed: "Run Fallita",
      runFailedMessage: (coins: number) => `Sei stato sconfitto. Hai guadagnato ${coins} WC di consolazione.`,
      runCompleted: "Run Completata!",
      runCompletedMessage: (coins: number) => `Congratulazioni! Hai superato tutti i livelli e guadagnato un totale di ${coins} WC!`,
      backToMap: "Torna alla Mappa",
      crossroadsTitle: "Bivio",
      crossroadsMessage: "Hai superato il livello! Scegli il tuo prossimo passo.",
      // Events
      marketTitle: "Il Mercato",
      marketDescription: "Un mercante misterioso ti offre i suoi averi. Scegli un oggetto da usare nel prossimo livello.",
      witchHutTitle: "La Capanna dello Stregone",
      witchHutDescription: "Una strega ti offre di manipolare i tuoi poteri. Puoi potenziare la tua abilità attuale o scambiarla.",
      healingFountainTitle: "Fonte della Guarigione",
      healingFountainDescription: "Bevi da una fonte incantata. Inizierai il prossimo livello con un vantaggio.",
      challengeAltarTitle: "Altare della Sfida",
      challengeAltarDescription: "Un antico altare ti mette alla prova. Accetta la sfida per una ricompensa extra.",
      // Event Choices
      powerUpAbility: (ability: string) => `Potenzia ${ability}`,
      powerUpAbilityDesc: "Ottieni una carica extra per la tua abilità attuale.",
      swapAbility: "Scambia Abilità",
      swapAbilityDesc: "Sostituisci la tua abilità attuale con una nuova.",
      startWith10Points: "Bevi dalla Fonte",
      startWith10PointsDesc: "Inizia il prossimo livello con 10 punti extra.",
      acceptChallenge: "Accetta la Sfida",
      challengeScoreAbove80: (reward: number) => `Vinci il prossimo livello con più di 80 punti per guadagnare ${reward} WC extra.`,
      skipEvent: "Prosegui",
      // Market Items
      fortuneAmulet: "Amuleto della Fortuna",
      fortuneAmuletDesc: "La tua prima carta pescata nel prossimo livello sarà una Briscola.",
      insightPotion: "Pozione dell'Intuizione",
      insightPotionDesc: "Vedi la mano della tua avversaria per i primi 3 turni del prossimo livello.",
      coinPouch: "Sacchetto di Monete",
      coinPouchDesc: "Ottieni subito 50 Waifu Coins extra.",
    },
    elementalPowersTitle: "Poteri Elementali",
    toggleLegend: "Mostra/Nascondi Descrizioni",
    fire: "Fuoco",
    water: "Acqua",
    air: "Aria",
    earth: "Terra",
    suitIs: (suit: string, element: string) => `${suit} è ${element}`,
    fireDescription: "Vinci il turno con una carta Fuoco per +3 punti bonus.",
    waterDescription: "Dimezza i punti della carta avversaria in questo turno.",
    airDescription: "Gioca una carta Aria per annullare i punti di questo turno.",
    earthDescription: "Se perdi il turno, recupera i punti della tua carta Terra.",
    // Elemental Choice
    elementalChoiceTitle: "Come vuoi giocare questa carta?",
    activatePower: "Attiva Potere",
    playNormally: "Gioca Normalmente",
    // Elemental Abilities
    abilitiesTitle: "Abilità",
    ability: "Abilità",
    incinerate: "Incenerire",
    tide: "Marea",
    cyclone: "Ciclone",
    fortify: "Fortificare",
    abilityReady: "Abilità Pronta!",
    abilityUsed: (playerName: string, abilityName: string) => `${playerName} ha usato ${abilityName}!`,
    incinerateDescription: "Incenerire: Rendi 0 i punti di una carta avversaria.",
    tideDescription: "Marea: Vedi la mano del tuo avversario per 5 secondi.",
    cycloneDescription: "Ciclone: Scambia una tua carta con una dal mazzo.",
    fortifyDescription: "Fortificare: Aumenta la forza di una tua carta per un turno.",
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
    waifuGenericTeasePrompt: (waifuName: string, personality: string, aiScore: number, humanScore: number) => `
Sei ${waifuName}. La tua personalità è: "${personality}".
Stai giocando a Briscola contro senpai. Il punteggio è Tu: ${aiScore}, Senpai: ${humanScore}.
Fai un commento generico, stuzzicante e con un doppio senso sensuale, in linea con la tua personalità, sulla partita in corso. Non fare riferimento alle ultime carte giocate.
Sii creativa, unica e in personaggio. La risposta deve essere breve (1-2 frasi) e in italiano.
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
        subscriptionPoll: {
            title: "Saresti interessato a un abbonamento?",
            description: "La tua risposta è anonima e ci aiuta a capire l'interesse per un futuro abbonamento con accesso illimitato, per sostenere il progetto. Per favore, rispondi onestamente!",
            yes: "Sì",
            no: "No",
            thanks: "Grazie mille per il tuo prezioso feedback!"
        }
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
            intro: "Il Servizio utilizza modelli di intelleigenza artificiale (Google Gemini) per generare risposte, commenti e mosse di gioco. Riconosci che:",
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
    difficultyLabel: "Difficulty",
    difficultyEasy: "Easy",
    difficultyMedium: "Normal",
    difficultyHard: "Hard",
    toggleChatLabel: "Enable Waifu Chat",
    toggleWaitForWaifuLabel: "Wait for Waifu Reply",
    fastModeEnabled: "Fast mode enabled: The game will no longer wait for the Waifu's reply.",
    gameModeClassic: "Classic Briscola",
    gameModeRoguelike: "Roguelike Mode",
    comingSoon: " (Coming Soon)",
    comingSoonTooltip: "This mode will be available soon!",
    rulesTitle: "Scoring Rules",
    refreshBackground: "Change Background",
    winCondition: "The deck has a total of 120 points. The first player to score more than 60 points wins the game.",
    otherCards: "Other cards",
    scorePoints: (points: number) => `${points} points`,
    waifuCoinRulesTitle: "Earning Waifu Coins (Current Difficulty)",
    waifuCoinRuleLoss: (coins: number) => `Loss or Tie: +${coins} Waifu Coins`,
    waifuCoinRuleWin61: (coins: number) => `Win (61-80 points): +${coins} Waifu Coins`,
    waifuCoinRuleWin81: (coins: number) => `Win (81-101 points): +${coins} Waifu Coins`,
    waifuCoinRuleWin101: (coins: number) => `Win (102+ points): +${coins} Waifu Coins`,
    waifuCoinDifficultyMultiplier: "Difficulty Multiplier",
    waifuCoinDifficultyMultiplierInfo: "Coin earnings change based on the difficulty selected in the menu:",
    waifuCoinDifficultyMultiplierEasy: "Easy: 50% of base coins.",
    waifuCoinDifficultyMultiplierMedium: "Normal: 100% of base coins.",
    waifuCoinDifficultyMultiplierHard: "Hard: 150% of base coins.",
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
    waifuDetails: (name: string) => `Details about ${name}`,
    buyWaifuCoffee: "Support your Waifu",
    supportEmail: "Contact Support",
    toggleMusic: "Toggle Music",
    soundtrackLabel: "Soundtrack",
    soundtrackEpic: "Epic Music",
    soundtrackChill: "Chill Music",
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
     // Roguelike Mode
    roguelike: {
      mapTitle: "Roguelike Map",
      level: (level: number) => `Level ${level}`,
      reward: (coins: number) => `Reward: ${coins} WC`,
      startRun: "Start Run",
      continueRun: "Continue",
      runFailed: "Run Failed",
      runFailedMessage: (coins: number) => `You have been defeated. You earned ${coins} WC as a consolation prize.`,
      runCompleted: "Run Completed!",
      runCompletedMessage: (coins: number) => `Congratulations! You cleared all levels and earned a total of ${coins} WC!`,
      backToMap: "Back to Map",
      crossroadsTitle: "Crossroads",
      crossroadsMessage: "You cleared the level! Choose your next step.",
      // Events
      marketTitle: "The Market",
      marketDescription: "A mysterious merchant offers you his wares. Choose one item to use in the next level.",
      witchHutTitle: "The Witch's Hut",
      witchHutDescription: "A witch offers to manipulate your powers. You can upgrade your current ability or swap it.",
      healingFountainTitle: "Healing Fountain",
      healingFountainDescription: "Drink from an enchanted spring. You will start the next level with an advantage.",
      challengeAltarTitle: "Altar of Challenge",
      challengeAltarDescription: "An ancient altar tests you. Accept the challenge for an extra reward.",
      // Event Choices
      powerUpAbility: (ability: string) => `Power Up ${ability}`,
      powerUpAbilityDesc: "Get an extra charge for your current ability.",
      swapAbility: "Swap Ability",
      swapAbilityDesc: "Replace your current ability with a new one.",
      startWith10Points: "Drink from the Fountain",
      startWith10PointsDesc: "Start the next level with an extra 10 points.",
      acceptChallenge: "Accept Challenge",
      challengeScoreAbove80: (reward: number) => `Win the next level with more than 80 points to earn an extra ${reward} WC.`,
      skipEvent: "Continue",
      // Market Items
      fortuneAmulet: "Amulet of Fortune",
      fortuneAmuletDesc: "Your first drawn card in the next level will be a Trump card.",
      insightPotion: "Potion of Insight",
      insightPotionDesc: "See your opponent's hand for the first 3 tricks of the next level.",
      coinPouch: "Pouch of Coins",
      coinPouchDesc: "Immediately gain an extra 50 Waifu Coins.",
    },
    elementalPowersTitle: "Elemental Powers",
    toggleLegend: "Show/Hide Descriptions",
    fire: "Fire",
    water: "Water",
    air: "Air",
    earth: "Earth",
    suitIs: (suit: string, element: string) => `${suit} is ${element}`,
    fireDescription: "Win the trick with a Fire card for +3 bonus points.",
    waterDescription: "Halves the opponent's card points for this trick.",
    airDescription: "Play an Air card to nullify this trick's points.",
    earthDescription: "If you lose the trick, recover your Earth card's points.",
    // Elemental Choice
    elementalChoiceTitle: "How do you want to play this card?",
    activatePower: "Activate Power",
    playNormally: "Play Normally",
    // Elemental Abilities
    abilitiesTitle: "Abilities",
    ability: "Ability",
    incinerate: "Incinerate",
    tide: "Tide",
    cyclone: "Cyclone",
    fortify: "Fortify",
    abilityReady: "Ability Ready!",
    abilityUsed: (playerName: string, abilityName: string) => `${playerName} used ${abilityName}!`,
    incinerateDescription: "Incinerate: Reduce the point value of an opponent's card to 0.",
    tideDescription: "Tide: See your opponent's hand for 5 seconds.",
    cycloneDescription: "Cyclone: Swap a card from your hand with one from the deck.",
    fortifyDescription: "Fortify: Increase the strength of one of your cards for one trick.",
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
    waifuGenericTeasePrompt: (waifuName: string, personality: string, aiScore: number, humanScore: number) => `
You are ${waifuName}. Your personality is: "${personality}".
You are playing Briscola against senpai. The score is You: ${aiScore}, Senpai: ${humanScore}.
Make a generic, teasing comment about the ongoing game with a sensual double entendre that fits your personality. Do not refer to the last cards played.
Be creative, unique, and in character. The response must be short (1-2 sentences) and in English.
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
        subscriptionPoll: {
            title: "Would you be interested in a subscription?",
            description: "Your answer is anonymous and helps us gauge interest in a future subscription with unlimited access to support the project. Please answer honestly!",
            yes: "Yes",
            no: "No",
            thanks: "Thank you very much for your valuable feedback!"
        }
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