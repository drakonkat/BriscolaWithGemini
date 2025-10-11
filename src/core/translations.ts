
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
    resumeGame: "Riprendi Partita",
    language: "Lingua",
    gameModeLabel: "Modalità di Gioco",
    difficultyLabel: "Difficoltà",
    difficultyEasy: "Facile",
    difficultyMedium: "Normale",
    difficultyHard: "Difficile",
    difficultyNightmare: "Incubo",
    difficultyEasyDesc: "L'IA è un'ottima compagna per imparare. Giocherà in modo semplice e non sarà troppo aggressiva.",
    difficultyMediumDesc: "Una sfida bilanciata. L'IA gioca in modo strategico ma può commettere errori.",
    difficultyHardDesc: "Preparati. L'IA gioca in modo ottimale e punirà ogni tuo errore.",
    difficultyNightmareDesc: "Spietata e ingiusta. L'IA conosce le tue carte. Riuscirai a vincere lo stesso?",
    rewardCoinMultiplier: "Moltiplicatore Monete",
    rewardWin: "Vittoria",
    rewardLoss: "Sconfitta",
    rewardSpecial: "Speciale",
    cardDeckStyleLabel: "Stile Mazzo",
    cardDeckStyleClassic: "Classico",
    cardDeckStylePoker: "Poker",
    diceAnimationLabel: "Animazione Dadi",
    toggleChatLabel: "Abilita Chat Waifu",
    toggleWaitForWaifuLabel: "Attendi Risposta Waifu",
    fastModeEnabled: "Modalità veloce attivata: il gioco non attenderà più la risposta della Waifu.",
    gameModeClassic: "Briscola Classica",
    gameModeRoguelike: "Modalità Roguelike",
    comingSoon: " (Prossimamente)",
    comingSoonTooltip: "Questa modalità sarà presto disponibile!",
    rulesTitle: "Regole del Punteggio",
    settingsTitle: "Impostazioni",
    projectDescriptionTitle: "Descrizione del Progetto",
    refreshBackground: "Cambia Sfondo",
    winCondition: "Il mazzo ha un totale di 120 punti. Il primo giocatore a totalizzare più di 60 punti vince la partita.",
    otherCards: "Altre carte",
    scorePoints: (points: number) => `${points} punti`,
    waifuCoinRulesTitle: "Guadagnare Waifu Coins (Difficoltà Attuale)",
    waifuCoinRuleLoss: (coins: number) => `Sconfitta o Pareggio: +${coins} Waifu Coins`,
    waifuCoinRuleWin61: (coins: number) => `Vittoria (61-80 punti): +${coins} Waifu Coins`,
    waifuCoinRuleWin81: (coins: number) => `Vittoria (81-101 punti): +${coins} Waifu Coins`,
    waifuCoinRuleWin101: (coins: number) => `Vittoria (102+ punti): +${coins} Waifu Coins`,
    waifuCoinRuleWinNightmare: (coins: number) => `Vittoria (Incubo): +${coins} Waifu Coins`,
    waifuCoinDifficultyMultiplier: "Moltiplicatore Difficoltà",
    waifuCoinDifficultyMultiplierInfo: "Il guadagno di monete cambia in base alla difficoltà selezionata nel menu:",
    waifuCoinDifficultyMultiplierEasy: "Facile: 50% delle monete base.",
    waifuCoinDifficultyMultiplierMedium: "Normale: 100% delle monete base.",
    waifuCoinDifficultyMultiplierHard: "Hard: 150% delle monete base.",
    waifuCoinDifficultyMultiplierNightmare: "Incubo: Ricompensa speciale di 500 WC per la vittoria.",
    gachaRulesTitle: "Regole del Gacha",
    gachaCostSingle: "Costo Tiro Singolo: 100 Waifu Coins.",
    gachaCostMulti: "Costo Tiro Multiplo (x10): 900 Waifu Coins (1 tiro gratis!).",
    gachaFreeFirstRoll: "Il primo tiro in assoluto è gratuito!",
    gachaRule50Percent: "Ogni tiro ha una probabilità del 50% di sbloccare uno sfondo.",
    gachaRuleRarityTitle: "Se il tiro ha successo, le probabilità di rarità sono:",
    gachaRuleRarityR: "Rarità R: 80%",
    gachaRuleRaritySR: "Rarità SR: 15%",
    gachaRuleRaritySSR: "Rarità SSR: 5%",
    gachaRefundDescription: "Se il tiro del 50% fallisce, riceverai un rimborso casuale di Waifu Coins.",
    gachaPitySystem: "Se non ci sono più sfondi di una certa rarità, il sistema proverà a sbloccare una rarità inferiore.",
    chooseOpponent: "Scegli la tua avversaria",
    randomOpponent: "Avversaria Casuale",
    randomOpponentDesc: "Verrà scelta un'avversaria casuale. Preparati a una sorpresa!",
    waifuAvatarAlt: (name: string) => `Avatar di ${name}`,
    close: "Chiudi",
    waifuDetails: (name: string) => `Dettagli su ${name}`,
    buyWaifuCoffee: "Supporta la tua Waifu",
    supportEmail: "Contatta Supporto",
    toggleMusic: "Attiva/Disattiva Musica",
    soundtrackLabel: "Colonna Sonora",
    soundtrackEpic: "Musica Epica",
    soundtrackChill: "Musica chill",
    soundEditorTitle: "Editor Audio",
    play: "Ascolta",
    stop: "Ferma",
    tempo: "Velocità",
    oscillatorType: "Tipo Oscillatore",
    filterFrequency: "Frequenza Filtro",
    lfoFrequency: "Velocità Modulazione",
    lfoDepth: "Profondità Modulazione",
    reverbAmount: "Quantità Riverbero",
    masterVolume: "Volume Master",
    resetToDefaults: "Ripristina",
    oscSine: "Sinusoidale",
    oscSawtooth: "Dente di Sega",
    oscSquare: "Quadrata",
    oscTriangle: "Triangolare",
    drums: "Batteria",
    kick: "Cassa",
    snare: "Rullante",
    closedHat: "Hi-Hat Chiuso",
    openHat: "Hi-Hat Aperto",
    guitarChords: "Accordi Chitarra",
    decadePresets: "Preset Decennio",
    loadPresetPlaceholder: "Carica un Preset Decennio...",
    decade_40s: "Anni '40 Swing",
    decade_50s: "Anni '50 Rock",
    decade_60s: "Anni '60 Soul",
    decade_70s: "Anni '70 Disco",
    decade_80s: "Anni '80 Synth",
    decade_90s: "Anni '90 Pop",
    decade_2000s: "Anni 2000 Dance",
    decade_2010s: "Anni 2010 EDM",
    decade_2020s: "Anni 2020 Lo-fi",
    decade_blue90s: "Eiffel 65 - Blue",
    savePreset: "Salva Preset",
    presetName: "Nome Preset",
    save: "Salva",
    deletePreset: "Elimina Preset",
    defaultPresets: "Preset Predefiniti",
    customPresets: "I Tuoi Preset",
    // Tutorial
    tutorial: {
      next: "Avanti",
      skip: "Salta Tutorial",
      finish: "Fine",
      welcome: "Benvenuto in Waifu Briscola! Ti mostrerò rapidamente come funziona tutto.",
      gameMode: "Qui puoi scegliere tra una partita classica o la modalità Roguelike per una sfida più grande.",
      difficulty: "Seleziona la difficoltà dell'IA. Le difficoltà più alte offrono ricompense maggiori!",
      waifu: "Scegli la tua avversaria qui. Ognuna ha una personalità unica che scoprirai giocando e chattando.",
      gallery: "Usa i Waifu Coins che guadagni per sbloccare nuovi bellissimi sfondi di gioco qui!",
      start: "Quando sei pronto, premi qui per iniziare una partita di prova!",
      // In-game tutorial steps
      playerHand: "Questa è la tua mano. Le carte hanno un valore (come l'Asso) e un seme.",
      promptPlayCard: "È il tuo turno. Giochiamo l'Asso di Bastoni, una carta di alto valore. Clicca su di essa.",
      aiResponds: "Perfetto! Ora l'IA gioca la sua carta. Poiché hai iniziato con Bastoni, se l'IA non gioca una carta di Bastoni più alta o una Briscola, la presa sarà tua.",
      trickWon: "Hai vinto il turno! Nel seme di Bastoni, il tuo Asso batte il 2 dell'IA.",
      scoreUpdate: "I punti delle carte vinte (11 per il tuo Asso) vengono aggiunti al tuo punteggio. Te ne servono più di 60 per vincere!",
      drawingCards: "Dopo ogni turno, entrambi i giocatori pescano una nuova carta. Chi ha vinto pesca per primo.",
      briscola: "Questa è la Briscola. Le carte di questo seme (Coppe) battono qualsiasi altro seme che non sia Briscola.",
      end: "Hai imparato le basi! Il tutorial ora terminerà. Goditi il gioco!",
    },
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
    briscolaSwapMessage: "Scegli una carta dalla tua mano per scambiarla con la Briscola.",
    history: {
      title: "Storico Turni",
      lastTrick: "Ultimo Turno",
      trick: "Turno",
      you: "Tu",
      opponent: "Avversaria",
      clash: "Scontro",
      pointsYou: "Tuo Pti",
      pointsOpponent: "Pti Avv.",
      bonus: "Bonus",
      abilityUsed: (name: string, ability: string) => `Hai usato l'abilità "${ability}" di ${name}.`,
      bonusReasons: {
        water: (points: number) => `Acqua: -${points}`,
        fire: `Fuoco: +3`,
        air: (points: number) => `Aria: +${points}`,
        earth: (points: number) => `Terra: +${points}`,
        tribute: (points: number) => `Tributo: +${points}`,
        headhunter: (points: number) => `Cacciatore di Teste: +${points}`,
        mastery: (points: number) => `Maestria: +${points}`,
      },
    },
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
      initialPowerTitle: "Potere Iniziale",
      allPowersTitle: "Poteri Attivi",
      elementalCycleTitle: "Ciclo Elementale",
      roguelikeRulesTitle: "Modalità Roguelike",
      roguelikeRulesDescription: "In questa modalità, affronti una serie di 4 avversarie sempre più difficili in una singola 'run'. Ogni vittoria ti permette di scegliere un potenziamento permanente per quella run. Se perdi, la run termina, ma riceverai una parte delle monete accumulate come premio di consolazione. Completa la run per ottenere la ricompensa totale!",
      roguelikePowersTitle: "Poteri Sbloccabili",
      rewardsTitle: "Ricompense Run",
      rewardWinRun: "Vittoria Run",
      rewardLossLevel: (level: number) => `Sconfitta (Liv. ${level})`,
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
      newFollowerTitle: "Nuova Compagna!",
      newFollowerMessage: (name: string) => `${name} si è unita a te! Puoi usare la sua abilità una volta per partita.`,
      // FIX: Added missing translations for power selection screen
      chooseYourPower: "Scegli il tuo Potere Iniziale",
      initialPowerMessage: "Questo potere ti aiuterà per tutta la durata della tua run. Scegli saggiamente!",
      chooseYourPath: "Scegli il tuo Percorso",
      levelUpMessage: (level: number) => `Hai completato il livello ${level - 1}! Scegli un nuovo potere o potenzia uno esistente.`,
      powers: {
        upgrade: "Potenzia",
        bonus_point_per_trick: {
          name: "Tributo",
          desc: (level: number) => `Ottieni +${level} punto/i bonus ogni volta che vinci un turno.`
        },
        king_bonus: {
          name: "Cacciatore di Teste",
          desc: (level: number) => `Quando giochi un Fante, Cavallo o Re e vinci il turno, ottieni +${level * 2} punti bonus.`
        },
        ace_of_briscola_start: {
          name: "Asso nella Manica",
          desc: (level: number) => {
            if (level === 1) return "Inizi ogni partita con una Briscola casuale tra Re, Tre e Asso.";
            if (level === 2) return "Inizi ogni partita con una Briscola casuale tra Tre e Asso.";
            return "Inizi ogni partita con l'Asso e il Tre di Briscola.";
          }
        },
        briscola_mastery: {
          name: "Maestria della Briscola",
          desc: (level: number) => `Le tue carte Briscola valgono +${level * 2} punti quando vinci un turno.`
        },
        value_swap: {
          name: "Scambio Inaspettato",
          desc: (cooldown: number) => `Abilità Attiva: Ogni ${cooldown} turni, puoi scambiare la Briscola con una carta in mano.`
        },
        last_trick_insight: {
          name: "Preveggenza Finale",
          desc: (level: number) => {
            if (level === 1) return "Vedi le carte del tuo avversario durante gli ultimi tre turni.";
            if (level === 2) return "Ogni 3 turni, puoi attivare un'abilità per vedere la mano dell'avversario per questo turno.";
            return "L'avversario gioca sempre con le carte scoperte.";
          }
        },
        third_eye: {
          name: "Il Terzo Occhio",
          desc: "Sblocca lo storico completo dei turni per analizzare la partita.",
          historyLockedDesc: "Sblocca 'Il Terzo Occhio' per vedere lo storico completo."
        },
      }
    },
    elementalPowersTitle: "Poteri Elementali",
    toggleLegend: "Mostra/Nascondi Descrizioni",
    fire: "Fuoco",
    water: "Acqua",
    air: "Aria",
    earth: "Terra",
    suitIs: (suit: string, element: string) => `${suit} è ${element}`,
    fireDescription: "Vinci il turno con una carta Fuoco per +3 punti bonus.",
    waterDescription: "Se perdi il turno, l'effetto dimezza i punti della carta vincente.",
    airDescription: "Le tue carte Aria valgono +1 punto per ogni altra carta Aria già nel tuo mazzo punti.",
    earthDescription: "Se perdi il turno, recupera i punti della tua carta Terra.",
    elementalClash: {
        title: "Scontro Elementale!",
        weaknessTitle: "Debolezza Elementale!",
        yourRoll: "Tuo Lancio",
        opponentRoll: "Lancio Avversaria",
        winner: "Vincitore!",
        tie: "Pareggio!",
        beats: "batte",
    },
    // Elemental Choice
    elementalChoiceTitle: "Come vuoi giocare questa carta?",
    activatePower: "Attiva Potere",
    playNormally: "Gioca Normalmente",
    // Elemental Abilities
    abilities: {
        title: "Abilità",
        revealHand: "Rivela Mano",
        onCooldown: (turns: number) => `In ricarica (${turns})`,
    },
    ability: "Abilità",
    incinerate: "Incenerire",
    tide: "Marea",
    cyclone: "Ciclone",
    fortify: "Fortificare",
    abilityReady: "Abilità Pronta!",
    abilityUsed: (playerName: string, abilityName: string) => `${playerName} ha usato ${abilityName}!`,
    incinerateDescription: "Incenerire: Rendi 0 i punti di una carta avversaria.",
    tideDescription: "Tide: Vedi la mano del tuo avversario per 5 secondi.",
    cycloneDescription: "Ciclone: Scambia una tua carta con una dal mazzo.",
    fortifyDescription: "Fortificare: Rende la prossima carta che giochi una Briscola temporanea.",
    cancelAbility: "Annulla",
    undoIncinerate: "Annulla Incenerire",
    confirmOrUndoMessage: "Gioca una carta per confermare o annulla l'effetto.",
    // Follower Abilities
    followerAbility: "Abilità Compagna",
    sakura_blessing: "Benedizione di Sakura",
    sakura_blessing_desc: "Vinci il prossimo scontro elementale.",
    rei_analysis: "Analisi di Rei",
    rei_analysis_desc: "Ruba 5 punti all'avversaria.",
    kasumi_gambit: "Azzardo di Kasumi",
    kasumi_gambit_desc: "Scambia la Briscola con una carta dalla tua mano.",
    followerAbilityArmed: (waifuName: string, abilityName: string) => `Abilità di ${waifuName} (${abilityName}) pronta!`,
    cancelFollowerAbility: "Annulla Abilità Compagna",
    kasumiSwapTitle: "Azzardo di Kasumi",
    kasumiSwapMessage: "Scegli una carta dalla tua mano per scambiarla con la Briscola.",
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
Sii maliziosa, un po' stuzzicante e leggermente allusiva, specialmente se i punti sono alti. Usa gli asterischi per enfatizzare le parole, ad esempio *così*. Sii creativa e unica.
La risposta deve essere in italiano.
`,
    waifuGenericTeasePrompt: (waifuName: string, personality: string, aiScore: number, humanScore: number) => `
Sei ${waifuName}. La tua personalità è: "${personality}".
Stai giocando a Briscola contro senpai. Il punteggio è Tu: ${aiScore}, Senpai: ${humanScore}.
Fai un commento generico, stuzzicante e con un doppio senso sensuale, in linea con la tua personalità, sulla partita in corso. Non fare riferimento alle ultime carte giocate.
Usa gli asterischi per enfatizzare le parole, ad esempio *così*. Sii creativa, unica e in personaggio. La risposta deve essere breve (1-2 frasi) e in italiano.
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
            description: "La tua risposta è anonima e ci aiuta a capire l'interesse per un futuro abbonamento con accesso illimitato.",
            yes: "Sì, mi interessa",
            no: "No, grazie",
            thanks: "Grazie per il tuo feedback!",
        },
    },
    // FIX: Added missing translations
    gallery: {
        promoButton: "Sblocca Sfondi",
        title: "Galleria",
        gachaButtonFree: "Tiro Gratis!",
        gachaButton: (cost: number) => `Tira per ${cost} WC`,
        gachaButtonX10: (cost: number) => `Tira 10x per ${cost} WC`,
        gachaNotEnoughCoins: "Non hai abbastanza Waifu Coins.",
        gachaAllUnlocked: "Hai sbloccato tutti gli sfondi!",
        gachaFailureWithRefund: (amount: number) => `Sfortunato! Ma hai ricevuto un rimborso di ${amount} WC.`,
        gachaMultiResultTitle: "Risultati del Tiro Multiplo",
        gachaMultiUnlocked: (count: number) => `Hai sbloccato ${count} nuovi sfondi!`,
        gachaMultiRefund: (amount: number) => `Hai ricevuto un rimborso di ${amount} WC.`,
        rarityUnlocked: (rarity: string) => `Hai trovato uno sfondo di rarità ${rarity}!`,
        backgroundAlt: "Sfondo di gioco",
        fullscreenView: "Clicca per vedere a schermo intero.",
        locked: "Bloccato",
        download: "Scarica",
        imageSavedToDownloads: "Immagine salvata nei Download!",
        imageSaveFailed: "Salvataggio dell'immagine fallito.",
        permissionDenied: "Permesso di salvataggio negato.",
    },
    privacyPolicy: {
        linkText: "Privacy Policy",
        title: "Informativa sulla Privacy",
        lastUpdatedPrefix: "Ultimo aggiornamento:",
        lastUpdatedDate: "24 Luglio 2024",
        contactPrefix: "Contatto:",
        contactName: "service@tnl.one",
        intro: "Questa informativa sulla privacy descrive le nostre politiche sulla raccolta, l'uso e la divulgazione delle tue informazioni in relazione all'utilizzo della nostra applicazione, Waifu Briscola.",
        collection: {
            title: "Informazioni che Raccogliamo",
            intro: "Raccogliamo le seguenti informazioni:",
            posthog: {
                title: "Dati di Analisi Anonimi (PostHog):",
                text: "Utilizziamo PostHog per raccogliere dati di utilizzo anonimi per capire come viene utilizzata l'applicazione e migliorarla. Questi dati non includono informazioni di identificazione personale."
            },
            gemini: {
                title: "Input per l'IA (Google Gemini):",
                text: "I messaggi di chat inviati e le azioni di gioco vengono inviati all'API di Google Gemini per generare risposte. Per maggiori informazioni, consulta la <a href='https://policies.google.com/privacy' target='_blank' rel='noopener noreferrer'>Privacy Policy di Google</a>."
            }
        },
        usage: {
            title: "Come Usiamo le Tue Informazioni",
            intro: "Usiamo le informazioni che raccogliamo per:",
            points: [
                "Fornire e mantenere la nostra applicazione.",
                "Migliorare e personalizzare la tua esperienza.",
                "Capire come utilizzi la nostra applicazione per migliorarla."
            ]
        },
        sharing: {
            title: "Condivisione delle Tue Informazioni",
            text: "Non condividiamo le tue informazioni personali con terze parti, ad eccezione di quanto necessario per fornire il servizio (ad es. API di Google Gemini)."
        },
        security: {
            title: "Sicurezza",
            text: "La sicurezza delle tue informazioni è importante per noi, ma ricorda che nessun metodo di trasmissione su Internet o di archiviazione elettronica è sicuro al 100%."
        },
        changes: {
            title: "Modifiche a Questa Informativa sulla Privacy",
            text: "Potremmo aggiornare la nostra Informativa sulla Privacy di tanto in tanto. Ti avviseremo di eventuali modifiche pubblicando la nuova Informativa sulla Privacy in questa pagina."
        },
        contact: {
            title: "Contattaci",
            text: "Se hai domande su questa Informativa sulla Privacy, puoi contattarci a: service@tnl.one"
        }
    },
    termsAndConditions: {
        linkText: "Termini e Condizioni",
        title: "Termini e Condizioni",
        lastUpdatedPrefix: "Ultimo aggiornamento:",
        lastUpdatedDate: "24 Luglio 2024",
        contactPrefix: "Contatto:",
        contactName: "service@tnl.one",
        intro: "Benvenuto in Waifu Briscola! Questi termini e condizioni delineano le regole e i regolamenti per l'uso della nostra applicazione.",
        acceptance: {
            title: "Accettazione dei Termini",
            text: "Accedendo e utilizzando questa applicazione, accetti di essere vincolato da questi termini. Se non sei d'accordo con una qualsiasi parte dei termini, non puoi utilizzare l'applicazione."
        },
        usage: {
            title: "Uso Consentito",
            text: "Ti viene concesso un diritto limitato, non esclusivo e non trasferibile di utilizzare l'applicazione per scopi personali e non commerciali."
        },
        aiContent: {
            title: "Contenuto Generato dall'IA",
            intro: "L'applicazione utilizza modelli di intelligenza artificiale (Google Gemini) per generare contenuti. Riconosci che:",
            points: [
                "Il contenuto generato dall'IA potrebbe non essere sempre accurato o appropriato.",
                "Non siamo responsabili per alcun contenuto generato dall'IA.",
                "L'uso del contenuto generato dall'IA è a tuo rischio."
            ]
        },
        liability: {
            title: "Limitazione di Responsabilità",
            text: "In nessun caso Waifu Briscola, né i suoi direttori, dipendenti, partner, agenti, fornitori o affiliati, saranno responsabili per eventuali danni indiretti, incidentali, speciali, consequenziali o punitivi."
        },
        changes: {
            title: "Modifiche ai Termini",
            text: "Ci riserviamo il diritto, a nostra esclusiva discrezione, di modificare o sostituire questi Termini in qualsiasi momento."
        },
        governingLaw: {
            title: "Legge Applicabile",
            text: "Questi Termini saranno regolati e interpretati in conformità con le leggi della giurisdizione in cui ha sede l'azienda, senza riguardo alle disposizioni sui conflitti di legge."
        }
    },
  },
  en: {
    // Menu
    title: "Waifu Briscola",
    subtitle: "Challenge an opponent controlled by Gemini AI.",
    projectDescription1: "This is a small, unpretentious project born for fun. The goal is to gradually add new features, more card decks, and, above all, lots of new Waifus with unique personalities to discover!",
    projectDescription2: "The funds raised from donations will be used to hire designers and artists to increasingly improve the waifus and the game, so as to redistribute wealth among humans and not let AI steal their jobs.",
    startGame: "Start Game",
    resumeGame: "Resume Game",
    language: "Language",
    gameModeLabel: "Game Mode",
    difficultyLabel: "Difficulty",
    difficultyEasy: "Easy",
    difficultyMedium: "Normal",
    difficultyHard: "Hard",
    difficultyNightmare: "Nightmare",
    difficultyEasyDesc: "The AI is a great partner for learning. It will play simply and won't be too aggressive.",
    difficultyMediumDesc: "A balanced challenge. The AI plays strategically but can make mistakes.",
    difficultyHardDesc: "Get ready. The AI will play optimally and punish your every mistake.",
    difficultyNightmareDesc: "Ruthless and unfair. The AI knows your cards. Can you still win?",
    rewardCoinMultiplier: "Coin Multiplier",
    rewardWin: "Win",
    rewardLoss: "Loss",
    rewardSpecial: "Special",
    cardDeckStyleLabel: "Deck Style",
    cardDeckStyleClassic: "Classic",
    cardDeckStylePoker: "Poker",
    diceAnimationLabel: "Dice Animation",
    toggleChatLabel: "Enable Waifu Chat",
    toggleWaitForWaifuLabel: "Wait for Waifu Response",
    fastModeEnabled: "Fast mode enabled: the game will no longer wait for the Waifu's response.",
    gameModeClassic: "Classic Briscola",
    gameModeRoguelike: "Roguelike Mode",
    comingSoon: " (Coming Soon)",
    comingSoonTooltip: "This mode will be available soon!",
    rulesTitle: "Scoring Rules",
    settingsTitle: "Settings",
    projectDescriptionTitle: "Project Description",
    refreshBackground: "Change Background",
    winCondition: "The deck has a total of 120 points. The first player to score more than 60 points wins the game.",
    otherCards: "Other cards",
    scorePoints: (points: number) => `${points} points`,
    waifuCoinRulesTitle: "Earning Waifu Coins (Current Difficulty)",
    waifuCoinRuleLoss: (coins: number) => `Loss or Tie: +${coins} Waifu Coins`,
    waifuCoinRuleWin61: (coins: number) => `Win (61-80 points): +${coins} Waifu Coins`,
    waifuCoinRuleWin81: (coins: number) => `Win (81-101 points): +${coins} Waifu Coins`,
    waifuCoinRuleWin101: (coins: number) => `Win (102+ points): +${coins} Waifu Coins`,
    waifuCoinRuleWinNightmare: (coins: number) => `Win (Nightmare): +${coins} Waifu Coins`,
    waifuCoinDifficultyMultiplier: "Difficulty Multiplier",
    waifuCoinDifficultyMultiplierInfo: "Coin earnings change based on the difficulty selected in the menu:",
    waifuCoinDifficultyMultiplierEasy: "Easy: 50% of base coins.",
    waifuCoinDifficultyMultiplierMedium: "Normal: 100% of base coins.",
    waifuCoinDifficultyMultiplierHard: "Hard: 150% of base coins.",
    waifuCoinDifficultyMultiplierNightmare: "Nightmare: Special reward of 500 WC for winning.",
    gachaRulesTitle: "Gacha Rules",
    gachaCostSingle: "Single Pull Cost: 100 Waifu Coins.",
    gachaCostMulti: "Multi-Pull Cost (x10): 900 Waifu Coins (1 free pull!).",
    gachaFreeFirstRoll: "Your very first pull is free!",
    gachaRule50Percent: "Each pull has a 50% chance to unlock a background.",
    gachaRuleRarityTitle: "If the pull is successful, the rarity chances are:",
    gachaRuleRarityR: "R Rarity: 80%",
    gachaRuleRaritySR: "SR Rarity: 15%",
    gachaRuleRaritySSR: "SSR Rarity: 5%",
    gachaRefundDescription: "If the 50% pull fails, you will receive a random Waifu Coin refund.",
    gachaPitySystem: "If there are no backgrounds of a certain rarity left, the system will try to unlock a lower rarity.",
    chooseOpponent: "Choose your opponent",
    randomOpponent: "Random Opponent",
    randomOpponentDesc: "A random opponent will be chosen for you. Get ready for a surprise!",
    waifuAvatarAlt: (name: string) => `Avatar of ${name}`,
    close: "Close",
    waifuDetails: (name: string) => `Details about ${name}`,
    buyWaifuCoffee: "Support your Waifu",
    supportEmail: "Contact Support",
    toggleMusic: "Toggle Music",
    soundtrackLabel: "Soundtrack",
    soundtrackEpic: "Epic Music",
    soundtrackChill: "Chill Music",
    soundEditorTitle: "Sound Editor",
    play: "Play",
    stop: "Stop",
    tempo: "Tempo",
    oscillatorType: "Oscillator Type",
    filterFrequency: "Filter Frequency",
    lfoFrequency: "LFO Speed",
    lfoDepth: "LFO Depth",
    reverbAmount: "Reverb Amount",
    masterVolume: "Master Volume",
    resetToDefaults: "Reset to Defaults",
    oscSine: "Sine",
    oscSawtooth: "Sawtooth",
    oscSquare: "Square",
    oscTriangle: "Triangle",
    drums: "Drums",
    kick: "Kick",
    snare: "Snare",
    closedHat: "Closed Hi-Hat",
    openHat: "Open Hi-Hat",
    guitarChords: "Guitar Chords",
    decadePresets: "Decade Presets",
    loadPresetPlaceholder: "Load a Decade Preset...",
    decade_40s: "40s Swing",
    decade_50s: "50s Rock",
    decade_60s: "60s Soul",
    decade_70s: "70s Disco",
    decade_80s: "80s Synth",
    decade_90s: "90s Pop",
    decade_2000s: "2000s Dance",
    decade_2010s: "2010s EDM",
    decade_2020s: "2020s Lo-fi",
    decade_blue90s: "Eiffel 65 - Blue",
    savePreset: "Save Preset",
    presetName: "Preset Name",
    save: "Save",
    deletePreset: "Delete Preset",
    defaultPresets: "Default Presets",
    customPresets: "Your Presets",
    // Tutorial
    tutorial: {
      next: "Next",
      skip: "Skip Tutorial",
      finish: "Finish",
      welcome: "Welcome to Waifu Briscola! I'll quickly show you how everything works.",
      gameMode: "Here you can choose between a classic game or Roguelike mode for a bigger challenge.",
      difficulty: "Select the AI's difficulty. Higher difficulties offer greater rewards!",
      waifu: "Choose your opponent here. Each has a unique personality you'll discover by playing and chatting.",
      gallery: "Use the Waifu Coins you earn to unlock new beautiful game backgrounds here!",
      start: "When you're ready, press here to start a practice game!",
      // In-game tutorial steps
      playerHand: "This is your hand. The cards have a value (like the Ace) and a suit.",
      promptPlayCard: "It's your turn. Let's play the Ace of Batons, a high-value card. Click on it.",
      aiResponds: "Perfect! Now the AI plays its card. Since you started with Batons, if the AI doesn't play a higher Batons card or a Briscola (trump), the trick will be yours.",
      trickWon: "You won the trick! In the Batons suit, your Ace beats the AI's 2.",
      scoreUpdate: "The points from the won cards (11 for your Ace) are added to your score. You need more than 60 to win!",
      drawingCards: "After each trick, both players draw a new card. The winner draws first.",
      briscola: "This is the Briscola (trump card). Cards of this suit (Cups) beat any other non-Briscola suit.",
      end: "You've learned the basics! The tutorial will now end. Enjoy the game!",
    },
    // Game
    welcomeMessage: "Welcome! Start a new game.",
    yourTurn: "It's your turn to start.",
    aiStarts: (name: string) => `${name} starts.`,
    aiThinking: (name: string) => `${name} is thinking...`,
    aiPlayedYourTurn: (name: string) => `${name} has played. Your turn.`,
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
    briscolaLabel: "Briscola",
    remainingCardsLabel: "Remaining Cards",
    briscolaSwapMessage: "Choose a card from your hand to swap with the Briscola.",
    history: {
      title: "Trick History",
      lastTrick: "Last Trick",
      trick: "Trick",
      you: "You",
      opponent: "Opponent",
      clash: "Clash",
      pointsYou: "Your Pts",
      pointsOpponent: "Opp Pts",
      bonus: "Bonus",
      abilityUsed: (name: string, ability: string) => `You used ${name}'s ability "${ability}".`,
      bonusReasons: {
        water: (points: number) => `Water: -${points}`,
        fire: `Fire: +3`,
        air: (points: number) => `Air: +${points}`,
        earth: (points: number) => `Earth: +${points}`,
        tribute: (points: number) => `Tribute: +${points}`,
        headhunter: (points: number) => `Headhunter: +${points}`,
        mastery: (points: number) => `Mastery: +${points}`,
      },
    },
    // Roguelike Mode
    roguelike: {
      mapTitle: "Roguelike Map",
      level: (level: number) => `Level ${level}`,
      reward: (coins: number) => `Reward: ${coins} WC`,
      startRun: "Start Run",
      continueRun: "Continue",
      runFailed: "Run Failed",
      runFailedMessage: (coins: number) => `You have been defeated. You earned ${coins} WC as a consolation.`,
      runCompleted: "Run Completed!",
      runCompletedMessage: (coins: number) => `Congratulations! You have cleared all levels and earned a total of ${coins} WC!`,
      backToMap: "Back to Map",
      crossroadsTitle: "Crossroads",
      crossroadsMessage: "You cleared the level! Choose your next step.",
      initialPowerTitle: "Initial Power",
      allPowersTitle: "Active Powers",
      elementalCycleTitle: "Elemental Cycle",
      roguelikeRulesTitle: "Roguelike Mode",
      roguelikeRulesDescription: "In this mode, you face a series of 4 increasingly difficult opponents in a single 'run'. Each victory allows you to choose a permanent power-up for that run. If you lose, the run ends, but you'll receive a portion of the accumulated coins as a consolation prize. Complete the run to get the full reward!",
      roguelikePowersTitle: "Unlockable Powers",
      rewardsTitle: "Run Rewards",
      rewardWinRun: "Run Win",
      rewardLossLevel: (level: number) => `Loss (Lvl ${level})`,
      // Events
      marketTitle: "The Market",
      marketDescription: "A mysterious merchant offers you his wares. Choose an item to use in the next level.",
      witchHutTitle: "The Witch's Hut",
      witchHutDescription: "A witch offers to manipulate your powers. You can upgrade your current ability or swap it.",
      healingFountainTitle: "Healing Fountain",
      healingFountainDescription: "Drink from an enchanted spring. You will start the next level with an advantage.",
      challengeAltarTitle: "Challenge Altar",
      challengeAltarDescription: "An ancient altar tests you. Accept the challenge for an extra reward.",
      // Event Choices
      powerUpAbility: (ability: string) => `Power Up ${ability}`,
      powerUpAbilityDesc: "Gain an extra charge for your current ability.",
      swapAbility: "Swap Ability",
      swapAbilityDesc: "Replace your current ability with a new one.",
      startWith10Points: "Drink from the Fountain",
      startWith10PointsDesc: "Start the next level with 10 extra points.",
      acceptChallenge: "Accept Challenge",
      challengeScoreAbove80: (reward: number) => `Win the next level with more than 80 points to earn an extra ${reward} WC.`,
      skipEvent: "Continue",
      // Market Items
      fortuneAmulet: "Amulet of Fortune",
      fortuneAmuletDesc: "Your first card drawn in the next level will be a Briscola.",
      insightPotion: "Potion of Insight",
      insightPotionDesc: "See your opponent's hand for the first 3 turns of the next level.",
      coinPouch: "Pouch of Coins",
      coinPouchDesc: "Immediately get 50 extra Waifu Coins.",
      newFollowerTitle: "New Follower!",
      newFollowerMessage: (name: string) => `${name} has joined you! You can use her ability once per match.`,
      // Power selection screen translations
      chooseYourPower: "Choose Your Initial Power",
      initialPowerMessage: "This power will help you throughout your run. Choose wisely!",
      chooseYourPath: "Choose Your Path",
      levelUpMessage: (level: number) => `You have completed level ${level - 1}! Choose a new power or upgrade an existing one.`,
      powers: {
        upgrade: "Upgrade",
        bonus_point_per_trick: {
          name: "Tribute",
          desc: (level: number) => `Gain +${level} bonus point(s) each time you win a trick.`
        },
        king_bonus: {
          name: "Headhunter",
          desc: (level: number) => `When you play a Jack, Knight, or King and win the trick, gain +${level * 2} bonus points.`
        },
        ace_of_briscola_start: {
          name: "Ace in the Hole",
          desc: (level: number) => {
            if (level === 1) return "Start each game with a random Briscola from King, Three, and Ace.";
            if (level === 2) return "Start each game with a random Briscola from Three and Ace.";
            return "Start each game with the Ace and Three of Briscola.";
          }
        },
        briscola_mastery: {
          name: "Briscola Mastery",
          desc: (level: number) => `Your Briscola cards are worth +${level * 2} points when you win a trick.`
        },
        value_swap: {
          name: "Unexpected Swap",
          desc: (cooldown: number) => `Active Ability: Every ${cooldown} turns, you can swap the Briscola with a card in your hand.`
        },
        last_trick_insight: {
          name: "Final Foresight",
          desc: (level: number) => {
            if (level === 1) return "See your opponent's cards during the last three tricks.";
            if (level === 2) return "Every 3 turns, you can activate an ability to see the opponent's hand for this turn.";
            return "The opponent always plays with their cards revealed.";
          }
        },
        third_eye: {
          name: "The Third Eye",
          desc: "Unlocks the full trick history to analyze the game.",
          historyLockedDesc: "Unlock 'The Third Eye' to view the full history."
        },
      }
    },
    elementalPowersTitle: "Elemental Powers",
    toggleLegend: "Show/Hide Descriptions",
    fire: "Fire",
    water: "Water",
    air: "Air",
    earth: "Earth",
    suitIs: (suit: string, element: string) => `${suit} is ${element}`,
    fireDescription: "Win the trick with a Fire card for +3 bonus points.",
    waterDescription: "If you lose the trick, the effect halves the points of the winning card.",
    airDescription: "Your Air cards are worth +1 point for each other Air card already in your score pile.",
    earthDescription: "If you lose the trick, recover the points of your Earth card.",
    elementalClash: {
        title: "Elemental Clash!",
        weaknessTitle: "Elemental Weakness!",
        yourRoll: "Your Roll",
        opponentRoll: "Opponent's Roll",
        winner: "Winner!",
        tie: "Tie!",
        beats: "beats",
    },
    // Elemental Choice
    elementalChoiceTitle: "How do you want to play this card?",
    activatePower: "Activate Power",
    playNormally: "Play Normally",
    // Elemental Abilities
    abilities: {
        title: "Abilities",
        revealHand: "Reveal Hand",
        onCooldown: (turns: number) => `On Cooldown (${turns})`,
    },
    ability: "Ability",
    incinerate: "Incinerate",
    tide: "Tide",
    cyclone: "Cyclone",
    fortify: "Fortify",
    abilityReady: "Ability Ready!",
    abilityUsed: (playerName: string, abilityName: string) => `${playerName} used ${abilityName}!`,
    incinerateDescription: "Incinerate: Make an opponent's card worth 0 points.",
    tideDescription: "Tide: See your opponent's hand for 5 seconds.",
    cycloneDescription: "Cyclone: Swap one of your cards with one from the deck.",
    fortifyDescription: "Fortify: Makes the next card you play a temporary Briscola.",
    cancelAbility: "Cancel",
    undoIncinerate: "Undo Incinerate",
    confirmOrUndoMessage: "Play a card to confirm or cancel the effect.",
    // Follower Abilities
    followerAbility: "Follower Ability",
    sakura_blessing: "Sakura's Blessing",
    sakura_blessing_desc: "Win the next elemental clash.",
    rei_analysis: "Rei's Analysis",
    rei_analysis_desc: "Steal 5 points from the opponent.",
    kasumi_gambit: "Kasumi's Gambit",
    kasumi_gambit_desc: "Swap the Briscola with a card from your hand.",
    followerAbilityArmed: (waifuName: string, abilityName: string) => `${waifuName}'s ability (${abilityName}) is ready!`,
    cancelFollowerAbility: "Cancel Follower Ability",
    kasumiSwapTitle: "Kasumi's Gambit",
    kasumiSwapMessage: "Choose a card from your hand to swap with the Briscola.",
    // Game Over
    gameOverTitle: "Game Over",
    finalScore: "Final Score:",
    youWin: "You Win!",
    aiWins: (name: string) => `${name} Wins!`,
    tie: "It's a Tie!",
    playAgain: "Play Again",
    coinsEarned: (coins: number) => `+${coins} Waifu Coins`,
    // Chat
    chatWith: (name:string) => `Chat with ${name}`,
    closeChat: "Close chat",
    chatPlaceholder: "Write a message...",
    chatPlaceholderChatted: "You have already chatted this turn.",
    chatPlaceholderNotYourTurn: "Wait for your turn to chat.",
    chatPlaceholderOffline: "Chat is disabled in offline mode.",
    sendMessage: "Send message",
    sendMessageInProgress: "Sending...",
    chatFallback: "Sorry, senpai, I'm feeling a bit confused...",
    // Card Names (for prompts and IDs)
    suits: SUITS_EN,
    values: VALUES_EN,
    cardIdConnector: " of ",
    // AI Prompts
    aiMovePrompt: (humanCardId: string | null, briscolaSuit: string, aiHandIds: string[]) => `
You are an expert Italian Briscola player. Your goal is to win. You must choose a card to play from your hand. Play strategically.
If you are the first player of the trick (humanCardId is null), lead with a card that gives you the best chance of winning points or forces your opponent to waste a high-value card.
If you are the second player, decide if you can win the trick.
- The human played: ${humanCardId ?? 'N/A'}.
- The Briscola suit is: ${briscolaSuit}.
- Your hand is: [${aiHandIds.join(', ')}].

Analyze the human's card and your hand.
- If you can win the trick, play the lowest value card that still ensures victory.
- If the human played a high-value card (Ace or 3) and you cannot win, discard a low-value card with no points (a "liscio").
- If you cannot win the trick, play your lowest-scoring card.
- If you are leading the trick, consider playing a low briscola to see what the opponent does, or a low-value card in another suit.

Based on this situation, which card from your hand is the best to play now?
`,
    aiMoveSchemaDescription: (aiHandIds: string[]) => `The card to play from your hand. Must be one of: ${aiHandIds.join(', ')}`,
    waifuTrickWinPrompt: (waifuName: string, personality: string, humanCardId: string, aiCardId: string, points: number) => `
You are ${waifuName}. Your current personality is: "${personality}".
You just won a trick in Briscola against senpai.
- Senpai played: ${humanCardId}.
- You played: ${aiCardId}, and won the trick.
- You won ${points} points.

Based on your personality and the points you won, generate a short, in-character response for senpai (1-2 sentences).
Be mischievous, a bit teasing, and slightly suggestive, especially if the points are high. Use asterisks to emphasize words, like *so*. Be creative and unique.
The response must be in English.
`,
    waifuGenericTeasePrompt: (waifuName: string, personality: string, aiScore: number, humanScore: number) => `
You are ${waifuName}. Your personality is: "${personality}".
You are playing Briscola against senpai. The score is You: ${aiScore}, Senpai: ${humanScore}.
Make a generic, teasing comment with a sensual double meaning, in line with your personality, about the ongoing game. Do not refer to the last cards played.
Use asterisks to emphasize words, like *so*. Be creative, unique, and in-character. The response must be short (1-2 sentences) and in English.
`,
    // Quota Exceeded
    quotaExceeded: {
        title: "API Quota Exceeded",
        message: "Unfortunately, we've reached the daily request limit for the AI. You can continue playing against a simpler AI.",
        continueGame: "Continue Playing",
        quotaInfo: "Quotas reset daily. Thank you for your patience!",
    },
    // Confirm Leave
    confirmLeave: {
        title: "Leave the Game?",
        message: "Are you sure you want to return to the main menu? All game progress will be lost.",
        confirm: "Yes, leave",
        cancel: "Cancel"
    },
    // Support Modal
    supportModal: {
        title: "Support the Project",
        message: "Waifu Briscola is a free project. Your donations help cover the AI costs for everyone. Alternatively, let us know if you'd be interested in a personal subscription for unlimited access!",
        subscriptionPoll: {
            title: "Would you be interested in a subscription?",
            description: "Your answer is anonymous and helps us gauge interest in a future subscription with unlimited access.",
            yes: "Yes, I'm interested",
            no: "No, thanks",
            thanks: "Thanks for your feedback!",
        },
    },
    gallery: {
        promoButton: "Unlock Backgrounds",
        title: "Gallery",
        gachaButtonFree: "Free Pull!",
        gachaButton: (cost: number) => `Pull for ${cost} WC`,
        gachaButtonX10: (cost: number) => `Pull 10x for ${cost} WC`,
        gachaNotEnoughCoins: "You don't have enough Waifu Coins.",
        gachaAllUnlocked: "You've unlocked all backgrounds!",
        gachaFailureWithRefund: (amount: number) => `Unlucky! But you received a refund of ${amount} WC.`,
        gachaMultiResultTitle: "Multi-Pull Results",
        gachaMultiUnlocked: (count: number) => `You unlocked ${count} new backgrounds!`,
        gachaMultiRefund: (amount: number) => `You received a refund of ${amount} WC.`,
        rarityUnlocked: (rarity: string) => `You found a ${rarity} rarity background!`,
        backgroundAlt: "Game background",
        fullscreenView: "Click to view fullscreen.",
        locked: "Locked",
        download: "Download",
        imageSavedToDownloads: "Image saved to Downloads!",
        imageSaveFailed: "Image save failed.",
        permissionDenied: "Save permission denied.",
    },
    privacyPolicy: {
        linkText: "Privacy Policy",
        title: "Privacy Policy",
        lastUpdatedPrefix: "Last updated:",
        lastUpdatedDate: "July 24, 2024",
        contactPrefix: "Contact:",
        contactName: "service@tnl.one",
        intro: "This privacy policy describes our policies on the collection, use, and disclosure of your information in connection with your use of our application, Waifu Briscola.",
        collection: {
            title: "Information We Collect",
            intro: "We collect the following information:",
            posthog: {
                title: "Anonymous Analytics Data (PostHog):",
                text: "We use PostHog to collect anonymous usage data to understand how the application is used and to improve it. This data does not include personally identifiable information."
            },
            gemini: {
                title: "AI Inputs (Google Gemini):",
                text: "Chat messages sent and game actions are sent to the Google Gemini API to generate responses. For more information, please see the <a href='https://policies.google.com/privacy' target='_blank' rel='noopener noreferrer'>Google Privacy Policy</a>."
            }
        },
        usage: {
            title: "How We Use Your Information",
            intro: "We use the information we collect to:",
            points: [
                "Provide and maintain our application.",
                "Improve and personalize your experience.",
                "Understand how you use our application to improve it."
            ]
        },
        sharing: {
            title: "Sharing Your Information",
            text: "We do not share your personal information with third parties, except as necessary to provide the service (e.g., Google Gemini API)."
        },
        security: {
            title: "Security",
            text: "The security of your information is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure."
        },
        changes: {
            title: "Changes to This Privacy Policy",
            text: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page."
        },
        contact: {
            title: "Contact Us",
            text: "If you have any questions about this Privacy Policy, you can contact us at: service@tnl.one"
        }
    },
    termsAndConditions: {
        linkText: "Terms and Conditions",
        title: "Terms and Conditions",
        lastUpdatedPrefix: "Last updated:",
        lastUpdatedDate: "July 24, 2024",
        contactPrefix: "Contact:",
        contactName: "service@tnl.one",
        intro: "Welcome to Waifu Briscola! These terms and conditions outline the rules and regulations for the use of our application.",
        acceptance: {
            title: "Acceptance of Terms",
            text: "By accessing and using this application, you accept and agree to be bound by these terms. If you disagree with any part of the terms, then you may not use the application."
        },
        usage: {
            title: "Permitted Use",
            text: "You are granted a limited, non-exclusive, and non-transferable right to use the application for personal, non-commercial purposes."
        },
        aiContent: {
            title: "AI-Generated Content",
            intro: "The application uses artificial intelligence models (Google Gemini) to generate content. You acknowledge that:",
            points: [
                "AI-generated content may not always be accurate or appropriate.",
                "We are not responsible for any content generated by the AI.",
                "Your use of AI-generated content is at your own risk."
            ]
        },
        liability: {
            title: "Limitation of Liability",
            text: "In no event shall Waifu Briscola, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages."
        },
        changes: {
            title: "Changes to Terms",
            text: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time."
        },
        governingLaw: {
            title: "Governing Law",
            text: "These Terms shall be governed and construed in accordance with the laws of the jurisdiction where the company is based, without regard to its conflict of law provisions."
        }
    },
  }
};