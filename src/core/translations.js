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
    difficultyApocalypse: "Apocalisse",
    difficultyEasyDesc: "L'IA è un'ottima compagna per imparare. Giocherà in modo semplice e non sarà troppo aggressiva.",
    difficultyMediumDesc: "Una sfida bilanciata. L'IA gioca in modo strategico ma può commettere errori.",
    difficultyHardDesc: "Preparati. L'IA gioca in modo ottimale e punirà ogni tuo errore.",
    difficultyNightmareDesc: "L'IA è un maestro di briscola e bara, pescando le carte migliori direttamente dal mazzo.",
    difficultyApocalypseDesc: "Spietata e ingiusta. L'IA conosce le tue carte e può pescare dal mazzo. Riuscirai a vincere lo stesso?",
    rewardCoinMultiplier: "Moltiplicatore Monete",
    rewardEssenceMultiplier: "Moltiplicatore Essenze",
    rewardWin: "Vittoria",
    rewardLoss: "Sconfitta",
    rewardSpecial: "Speciale",
    cardDeckStyleLabel: "Stile Mazzo",
    cardDeckStyleClassic: "Classico",
    cardDeckStylePoker: "Poker",
    diceAnimationLabel: "Animazione Dadi",
    toggleNsfwLabel: "Contenuti NSFW",
    toggleChatLabel: "Abilita Chat Waifu",
    toggleWaitForWaifuLabel: "Attendi Risposta Waifu",
    fastModeEnabled: "Modalità veloce attivata: il gioco non attenderà più la risposta della Waifu.",
    gameModeClassic: "Briscola Classica",
    gameModeRoguelike: "Modalità Roguelike",
    gameModeDungeon: "Dungeon",
    comingSoon: " (Prossimamente)",
    chooseOpponent: "Scegli la tua avversaria",
    randomOpponent: "Avversaria Casuale",
    randomOpponentDesc: "Affronta una waifu scelta a caso tra tutte quelle disponibili.",
    waifuDetails: (name) => `Dettagli di ${name}`,
    rulesTitle: "Regolamento",
    refreshBackground: "Nuovo Sfondo",
    waifuCoinRulesTitle: "Regole Waifu Coin",
    waifuCoinRuleLoss: (amount) => `Sconfitta: +${amount} WC`,
    waifuCoinRuleWin61: (amount) => `Vittoria (61-80 punti): +${amount} WC`,
    waifuCoinRuleWin81: (amount) => `Vittoria (81-100 punti): +${amount} WC`,
    waifuCoinRuleWin101: (amount) => `Vittoria (101+ punti): +${amount} WC`,
    waifuCoinRuleWinNightmare: (amount) => `Vittoria (Incubo): +${amount} WC`,
    waifuCoinRuleWinApocalypse: (amount) => `Vittoria (Apocalisse): +${amount} WC`,
    waifuCoinDifficultyMultiplier: "Moltiplicatore Difficoltà",
    waifuCoinDifficultyMultiplierInfo: "La quantità di Waifu Coin che ricevi dipende dalla difficoltà:",
    waifuCoinDifficultyMultiplierEasy: "Facile: 50%",
    waifuCoinDifficultyMultiplierMedium: "Normale: 100%",
    waifuCoinDifficultyMultiplierHard: "Difficile: 150%",
    waifuCoinDifficultyMultiplierNightmare: "Incubo: Ricompensa Speciale",
    waifuCoinDifficultyMultiplierApocalypse: "Apocalisse: Ricompensa Speciale",
    gachaRulesTitle: "Regole Gacha",
    gachaFreeFirstRoll: "La tua prima estrazione è gratuita!",
    gachaCostSingle: "Costo estrazione singola: 100 WC.",
    gachaCostMulti: "Costo estrazione x10: 900 WC (1 estrazione gratis!).",
    gachaDuplicateShardRule: "Trovare un doppione ti darà un Frammento della sua rarità.",
    gachaRuleRarityTitle: "Probabilità di Rarità:",
    gachaRuleRarityR: "R (Raro): ~75%",
    gachaRuleRaritySR: "SR (Super Raro): ~20%",
    gachaRuleRaritySSR: "SSR (Super Super Raro): ~5%",
    gachaPitySystem: "Sistema Pity: Non implementato (ancora!).",
    projectDescriptionTitle: "Descrizione del Progetto",
    supportEmail: "Contatta Supporto",
    settingsTitle: "Impostazioni",

    // In-Game
    // FIX: Added missing translation key for the game's win condition.
    winCondition: "Vince il primo giocatore che raggiunge 61 punti. Il totale dei punti nel mazzo è 120.",
    yourTurn: "È il tuo turno.",
    yourTurnMessage: "È il tuo turno, scegli una carta.",
    aiStarts: (name) => `${name} inizia il turno.`,
    aiPlayedYourTurn: (name) => `${name} ha giocato. Ora tocca a te.`,
    youWonTrick: (points) => `Hai vinto la mano! +${points} punti.`,
    aiWonTrick: (name, points) => `${name} ha vinto la mano. +${points} punti.`,
    scoreYou: "Tu",
    scorePoints: (points) => `${points} punti`,
    otherCards: "Altre carte",
    briscolaLabel: "Briscola",
    remainingCardsLabel: "Carte rimanenti nel mazzo",
    cardBack: "Dorso della carta",
    gameBoardBackground: "Sfondo del tavolo da gioco",
    waifuAvatarAlt: (name) => `Avatar di ${name}`,
    chatWith: (name) => `Chatta con ${name}`,
    closeChat: "Chiudi chat",
    chatPlaceholder: "Scrivi un messaggio...",
    chatPlaceholderOffline: "La chat non è disponibile in modalità offline.",
    chatPlaceholderChatted: "Hai già scritto in questo turno.",
    chatPlaceholderNotYourTurn: "Attendi il tuo turno per scrivere.",
    sendMessage: "Invia",
    sendMessageInProgress: "Invio...",
    close: "Chiudi",
    backToMenu: "Torna al Menu",
    playAgain: "Gioca Ancora",
    finalScore: "Punteggio Finale:",
    gameOverTitle: "Partita Terminata",
    youWin: "Hai Vinto!",
    aiWins: (name) => `${name} ha vinto!`,
    tie: "Pareggio!",
    coinsEarned: (amount) => `Hai guadagnato ${amount} Waifu Coin!`,
    cursedCardError: "Non puoi giocare la carta maledetta finché non è l'ultima del suo seme.",

    // Waifu Prompts
    waifuTrickWinPrompt: (name, personality, humanCard, aiCard, points) =>
        `Sei ${name}. ${personality}. Hai appena vinto una mano di briscola. Tu hai giocato ${aiCard} e l'avversario ha giocato ${humanCard}, vincendo ${points} punti. Scrivi una frase di esultanza o un commento arguto. Rispondi in italiano.`,
    waifuGenericTeasePrompt: (name, personality, aiScore, humanScore) =>
        `Sei ${name}. ${personality}. Stai giocando a briscola, il tuo punteggio è ${aiScore} e quello dell'avversario è ${humanScore}. Scrivi una frase per stuzzicarlo o commentare la partita. Rispondi in italiano.`,
    chatFallback: "...",

    // Card Translations
    suits: SUITS_IT,
    values: VALUES_IT,
    cardIdConnector: " di ",

    // Modals
    confirmLeave: {
        title: "Tornare al menu?",
        message: "La partita in corso verrà persa. Sei sicuro di voler continuare?",
        confirm: "Sì, esci",
        cancel: "Annulla",
    },
    quotaExceeded: {
        title: "Limite API Superato",
        message: "Sembra che abbiamo raggiunto il limite di messaggi gratuiti per oggi! La partita continuerà in modalità offline (senza chat).",
        continueGame: "Continua a giocare",
        quotaInfo: "Le API di Gemini hanno un limite giornaliero gratuito. Per aiutarci a coprire i costi e mantenere attiva la chat, considera una donazione!",
    },
    buyWaifuCoffee: "Offri un caffè alle Waifu",
    supportModal: {
      title: "Sostieni il Progetto",
      message: "Waifu Briscola è un progetto amatoriale gratuito. I costi per le API di Gemini e per gli artisti che disegnano le Waifu sono sostenuti tramite donazioni. Se ti stai divertendo, considera di offrirci un caffè!",
      subscriptionPoll: {
          title: "Sondaggio: Abbonamento Mensile?",
          description: "Stiamo valutando di introdurre un piccolo abbonamento mensile (es. 1-2€) per coprire i costi e garantire chat illimitate. Saresti interessato?",
          yes: "Sì, lo pagherei!",
          no: "No, preferisco le donazioni",
          thanks: "Grazie per il tuo feedback!",
      }
    },
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
            },
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

    gallery: {
        promoButton: "Galleria Sfondi & Gacha",
        title: "Galleria Sfondi",
        gachaButtonFree: "Estrai (Gratis!)",
        gachaButton: (cost) => `Estrai (${cost} WC)`,
        gachaButtonX10: (cost) => `Estrai x10 (${cost} WC)`,
        gachaNotEnoughCoins: "Non hai abbastanza Waifu Coin!",
        gachaAllUnlocked: "Hai sbloccato tutti gli sfondi!",
        gachaDuplicate: (rarity) => `Duplicato! Hai ricevuto 1 Frammento ${rarity}.`,
        backgroundAlt: "Sfondo sbloccato",
        fullscreenView: "Clicca per vedere a schermo intero.",
        locked: "Bloccato",
        download: "Scarica",
        imageSavedToDownloads: "Immagine salvata nei Download!",
        imageSaveFailed: "Salvataggio dell'immagine fallito.",
        permissionDenied: "Permesso di salvataggio negato.",
        rarityUnlocked: (rarity) => `Hai sbloccato un ${rarity}!`,
        gachaMultiResultTitle: "Risultati Estrazione x10",
        gachaMultiUnlocked: (count) => `Hai sbloccato ${count} nuovi sfondi.`,
        gachaMultiShards: (shards) => `Hai ricevuto ${shards} Frammenti.`,
        craftingTitle: "Crea Chiavi",
        craftingRuleR: "Chiave R: 10 Frammenti R",
        craftingRuleSR: "Chiave SR: 10 Frammenti SR + 25 Frammenti R + 5 Essenze Trascendentali",
        craftingRuleSSR: "Chiave SSR: 5 Frammenti SSR + 15 Frammenti SR + 10 Essenze Trascendentali",
        shardLabelR: (shards) => `${shards} Frammenti R`,
        shardLabelSR: (shards) => `${shards} Frammenti SR`,
        shardLabelSSR: (shards) => `${shards} Frammenti SSR`,
        craftButton: (cost) => `Crea (${cost})`,
        gachaNotEnoughShards: "Non hai abbastanza Frammenti!",
        gachaNoLockedToCraft: (rarity) => `Hai già tutti gli sfondi di rarità ${rarity}!`,
        craftKeySuccess: (rarity) => `Hai creato una Chiave ${rarity}!`,
        gachaCraftSuccess: (rarity) => `Creazione riuscita! Hai sbloccato un nuovo sfondo ${rarity}.`,
        convertTitle: "Converti Frammenti",
        conversionSuccess: (amount, rarity) => `Hai ricevuto ${amount} Frammento ${rarity}!`,
        convertButton: "Converti",
        keyLabelR: (keys) => `x${keys} Chiavi R`,
        keyLabelSR: (keys) => `x${keys} Chiavi SR`,
        keyLabelSSR: (keys) => `x${keys} Chiavi SSR`,
        keyNameR: "Chiave Rara",
        keyNameSR: "Chiave Super Rara",
        keyNameSSR: "Chiave Super Super Rara",
        essencesLabel: "Essenze",
        convertEssencesTitle: "Converti Essenze",
        conversionRuleElemental: "",
        essencesLabelTranscendental: (amount) => `${amount} Trascendentali`,
    },

    craftingMinigame: {
      title: "Altare della Creazione",
      instructions: "Ferma l'indicatore nella zona verde per avere successo!",
      success: "Creazione Riuscita!",
      failure: "Creazione Fallita!",
      criticalSuccess: "Successo Critico! Materiali parzialmente rimborsati!",
      shardsLost: (count) => `Hai perso ${count} frammenti!`,
      stop: "Ferma",
    },

    dungeonRun: {
        runCompleteTitle: "Dungeon Completato!",
        runCompleteMessage: (total) => `Congratulazioni! Hai sconfitto tutte le ${total} avversarie e completato la run!`,
        runFailedTitle: "Dungeon Fallito",
        runFailedMessage: (wins, total) => `Sei stato sconfitto. Hai vinto ${wins} su ${total} partite, ma la tua run termina qui. Conservi le ricompense ottenute.`,
        matchWinTitle: (name) => `Hai sconfitto ${name}!`,
        matchWinMessage: (current, total) => `Hai superato l'incontro ${current} di ${total}. Preparati per il prossimo!`,
        continueRun: "Prossimo Incontro",
        rewardsTitle: "Ricompense Finali",
        intermediateRewardTitle: "Ricompense Incontro",
        rewardBackground: "Sfondo Esclusivo Sbloccato!",
        modifier: "Modificatore Partita",
        modifiers: {
            NONE: "Nessun modificatore",
            BRISCOLA_CHAOS: "Caos Briscola: La briscola cambia ogni 3 turni.",
            CURSED_HAND: "Mano Maledetta: Una carta casuale nella tua mano è maledetta. Non puoi giocarla finché non è l'ultima del suo seme. Una volta giocata, la maledizione passa a un'altra carta.",
            ELEMENTAL_FURY: "Furia Elementale: I poteri elementali si attivano sempre.",
            VALUE_INVERSION: "Valore Invertito: Le carte di basso valore (2, 4, 5) valgono di più dei carichi."
        }
    },

    missions: {
        title: "Missioni",
        daily: "Giornaliere",
        weekly: "Settimanali",
        achievements: "Obiettivi",
        claim: "Riscuoti",
        claimed: "Riscattato",
        noMissions: "Nessuna missione disponibile al momento.",
        rewardsLabel: "Ricompense:",
        rewards: {
            waifuCoins: "Waifu Coin",
            r_shards: "Frammenti R",
            sr_shards: "Frammenti SR",
            ssr_shards: "Frammenti SSR",
            fire_essences: "Essenze di Fuoco",
            water_essences: "Essenze d'Acqua",
            air_essences: "Essenze d'Aria",
            earth_essences: "Essenze di Terra",
            transcendental_essences: "Essenze Trascendentali"
        },
        descriptions: {
            daily_win_classic: "Vinci {target} partita in modalità Classica.",
            daily_play_cards_coppe: "Gioca {target} carte di Coppe.",
            daily_use_elemental_power: "Attiva {target} poteri elementali in modalità Roguelike.",
            weekly_win_any: "Vinci {target} partite in qualsiasi modalità.",
            weekly_win_hard: "Vinci {target} partita a difficoltà Difficile o superiore.",
            weekly_craft_key: "Crea {target} chiave qualsiasi.",
            weekly_gacha_10: "Estrai dal Gacha {target} volte.",
            achievement_win_10: "Vinci {target} partite.",
            achievement_win_50: "Vinci {target} partite.",
            achievement_win_100: "Vinci {target} partite.",
            achievement_win_nightmare: "Vinci {target} partita a difficoltà Incubo.",
            achievement_win_apocalypse: "Vinci {target} partita a difficoltà Apocalisse.",
            achievement_defeat_all_waifus: "Sconfiggi tutte le Waifu almeno una volta.",
            achievement_collect_all_ssr: "Colleziona tutti gli sfondi di rarità SSR.",
            achievement_recruit_follower: "Recluta il tuo primo alleato in modalità Roguelike."
        }
    },

    challengeMatch: {
      title: "Partite Sfida",
      info: "Usa le chiavi create per sfidare una waifu a difficoltà Incubo. In palio, un nuovo sfondo della rarità della chiave! In caso di sconfitta, la chiave non viene consumata.",
      keyLabelR: "Chiavi R",
      keyLabelSR: "Chiavi SR",
      keyLabelSSR: "Chiavi SSR",
      startChallenge: "Inizia Sfida",
      noKeys: "Nessuna chiave",
      challengeWinTitle: "Vittoria Sfida!",
      challengeWinMessage: "Hai vinto! Ora riceverai il tuo premio.",
      challengeLossTitle: "Sfida Fallita",
      challengeLossMessage: (name) => `${name} ti ha sconfitto, ma non hai perso la chiave. Riprova quando vuoi!`,
      playAgainChallenge: "Riprova Sfida",
      difficultyLocked: "Difficoltà bloccata a Incubo per le Partite Sfida.",
      noKeysModalTitle: "Nessuna Chiave!",
      noKeysModalMessage: "Non hai chiavi per accedere al Dungeon. Crea delle chiavi nella Galleria usando i Frammenti per giocare in questa modalità.",
      keySelectionTitle: "Scegli una Chiave",
      keySelectionMessage: "Seleziona la chiave che vuoi usare per questa partita nel Dungeon. La rarità della chiave determina la rarità dello sfondo in palio.",
    },

    soundEditorTitle: "Editor Musicale",
    toggleMusic: "Musica On/Off",
    tempo: "Tempo (BPM)",
    oscillatorType: "Forma d'Onda",
    oscSine: "Sinusoidale",
    oscSawtooth: "Dente di sega",
    oscSquare: "Quadrata",
    oscTriangle: "Triangolare",
    filterFrequency: "Frequenza Filtro",
    lfoFrequency: "Frequenza LFO",
    lfoDepth: "Intensità LFO",
    reverbAmount: "Riverbero",
    masterVolume: "Volume Generale",
    guitarChords: "Accordi",
    drums: "Batteria",
    kick: "Cassa",
    snare: "Rullante",
    closedHat: "Hi-Hat Chiuso",
    openHat: "Hi-Hat Aperto",
    play: "Play",
    stop: "Stop",
    resetToDefaults: "Reset",
    decadePresets: "Preset Decennio",
    loadPresetPlaceholder: "Carica o crea un preset...",
    savePreset: "Salva Preset",
    presetName: "Nome del preset...",
    save: "Salva",
    defaultPresets: "Preset Predefiniti",
    customPresets: "Preset Personalizzati",
    deletePreset: "Elimina",
    decade_40s: "Anni '40 Swing",
    decade_50s: "Anni '50 Rock",
    decade_60s: "Anni '60 Soul",
    decade_70s: "Anni '70 Disco",
    decade_80s: "Anni '80 Synth",
    decade_90s: "Anni '90 Pop",
    decade_blue90s: "Anni '90 Eiffel",
    decade_2000s: "Anni 2000 Dance",
    decade_2010s: "Anni 2010 EDM",
    decade_2020s: "Anni 2020 Lo-fi",

    // Roguelike Mode
    elementalPowersTitle: "Poteri Elementali",
    elementalChoiceTitle: "Attivare il potere elementale?",
    playNormally: "Gioca Normalmente",
    activatePower: "Attiva Potere",
    cancelAbility: "Annulla",
    fire: "Fuoco",
    water: "Acqua",
    air: "Aria",
    earth: "Terra",
    fireDescription: "Se vinci la mano con questa carta, guadagni 3 punti bonus.",
    waterDescription: "Se perdi la mano con questa carta, i punti della carta vincente dell'avversario sono dimezzati.",
    airDescription: "Quando questa carta viene aggiunta al tuo mazzo dei punti, guadagni 1 punto bonus per ogni altra carta Aria già presente.",
    earthDescription: "Se perdi la mano, recuperi i punti di questa carta (ma non quelli dell'avversario).",

    sakura_blessing: "Benedizione di Sakura",
    sakura_blessing_desc: "Garantisce la vittoria nel prossimo scontro elementale, indipendentemente dal dado o dalle debolezze.",
    rei_analysis: "Analisi di Rei",
    rei_analysis_desc: "Se il tuo punteggio è inferiore a quello di Rei di almeno 5 punti, puoi rubarle 5 punti e aggiungerli al tuo punteggio.",
    kasumi_gambit: "Azzardo di Kasumi",
    kasumi_gambit_desc: "Scambia una carta dalla tua mano con la briscola scoperta sul tavolo.",

    kasumiSwapTitle: "Azzardo di Kasumi",
    kasumiSwapMessage: "Scegli una carta dalla tua mano da scambiare con la briscola.",
    briscolaSwapMessage: "Scegli una carta dalla tua mano da scambiare con la briscola.",
    followerAbilityArmed: (waifu, ability) => `${waifu} usa ${ability}!`,
    abilityReady: "Pronta",
    abilities: {
        onCooldown: (turns) => `In ricarica (${turns})`,
    },

    elementalClash: {
        title: "Scontro Elementale!",
        weaknessTitle: "Debolezza Elementale!",
        beats: "batte",
        winner: "Vincitore",
        tie: "Pareggio!",
    },

    history: {
      title: "Storico Turni",
      trick: "Mano",
      you: "Tu",
      opponent: "Avversaria",
      clash: "Scontro",
      pointsYou: "Punti Tu",
      pointsOpponent: "Punti Avv.",
      bonus: "Bonus",
      lastTrick: "Ultima Mano",
      abilityUsed: (waifu, ability) => `${waifu} ha usato ${ability}`,
      bonusReasons: {
          water: (points) => `Acqua (-${points})`,
          fire: "Fuoco (+3)",
          air: (points) => `Aria (+${points})`,
          earth: (points) => `Terra (+${points})`,
          tribute: (points) => `Tributo (+${points})`,
          headhunter: (points) => `Cacciatore di Teste (+${points})`,
          mastery: (points) => `Maestria (+${points})`,
      }
    },

    roguelike: {
        essencesObtained: "Hai ottenuto",
        allPowersTitle: "Poteri Attivi",
        elementalCycleTitle: "Ciclo delle Debolezze",
        followerAbilitiesTitle: "Abilità Alleati",
        newFollowerTitle: "Nuova Alleata!",
        newFollowerMessage: (name) => `${name} si è unita a te! La sua abilità sarà disponibile nelle prossime partite.`,
        continueRun: "Continua l'avventura",
        runCompleted: "Avventura Completata!",
        runCompletedMessage: (winnings) => `Hai sconfitto tutte le avversarie! Hai guadagnato ${winnings} WC.`,
        runFailed: "Avventura Fallita",
        runFailedMessage: (winnings) => `Sei stato sconfitto. Hai comunque guadagnato ${winnings} WC per i tuoi sforzi.`,
        chooseYourPower: "Scegli il tuo Potere Iniziale",
        initialPowerMessage: "Questo potere ti accompagnerà per tutta l'avventura e potrà essere potenziato.",
        chooseYourPath: "Scegli il tuo Percorso",
        levelUpMessage: (level) => `Hai completato il livello ${level - 1}. Scegli un nuovo potere o potenzia quello iniziale.`,
        rewardsTitle: "Ricompense Modalità Roguelike",
        rewardWinRun: "Vittoria Run",
        rewardLossLevel: (level) => `Sconfitta (Liv. ${level})`,
        roguelikeRulesTitle: "Regole Modalità Roguelike",
        roguelikeRulesDescription: "Affronta 4 avversarie di fila. Ogni vittoria ti permette di scegliere un nuovo potere o potenziare quello iniziale. Perdi una volta e l'avventura finisce. Le ricompense vengono assegnate in base al livello raggiunto.",
        essenceMultiplierRule: "Le Essenze Elementali ottenute in partita sono moltiplicate in base alla difficoltà:",
        roguelikePowersTitle: "Elenco Poteri Roguelike",
        powers: {
            upgrade: "POTENZIA",
            bonus_point_per_trick: {
                name: "Tributo Divino",
                desc: (level) => `Guadagni ${level} punto/i bonus per ogni mano che vinci.`
            },
            king_bonus: {
                name: "Cacciatore di Teste",
                desc: (level) => `Guadagni ${level * 2} punti bonus quando vinci una mano giocando un Fante, Cavallo o Re.`
            },
            ace_of_briscola_start: {
                name: "Asso nella Manica",
                desc: (level) => level === 1 ? "Inizi ogni partita con una carta di briscola di valore (Asso, 3 o Re) in mano." : (level === 2 ? "Inizi ogni partita con un Asso o un 3 di briscola in mano." : "Inizi ogni partita con l'Asso e il 3 di briscola in mano.")
            },
            briscola_mastery: {
                name: "Maestria della Briscola",
                desc: (level) => `Guadagni ${level * 2} punti bonus quando vinci una mano giocando una carta di briscola.`
            },
            value_swap: {
                name: "Scambio di Valore",
                desc: (cooldown) => `Una volta ogni ${cooldown} turni, puoi scambiare una carta dalla tua mano con la briscola sul tavolo.`
            },
            last_trick_insight: {
                name: "Sesto Senso",
                desc: (level) => level === 1 ? "Le carte in mano all'avversaria vengono rivelate nell'ultima mano." : (level === 2 ? "Una volta ogni 3 turni, puoi rivelare la mano dell'avversaria per il turno corrente." : "Le carte in mano all'avversaria sono sempre visibili.")
            },
            third_eye: {
                name: "Terzo Occhio",
                desc: "Puoi vedere l'intero storico delle mani giocate, non solo l'ultima.",
                historyLockedDesc: "Sblocca il potere 'Terzo Occhio' per vedere lo storico completo."
            }
        }
    },

    dungeonRules: {
      title: "Regole Modalità Dungeon",
      description: "La Modalità Dungeon è una serie di partite sfida contro avversarie sempre più difficili. Per accedere, devi prima creare una Chiave nella Galleria.",
      keyCrafting: "Crea Chiavi R, SR o SSR usando i Frammenti ottenuti dai doppioni del Gacha. La rarità della chiave determina la lunghezza della run e la rarità del premio finale.",
      runStructure: "Ogni run consiste in una serie di partite a difficoltà Incubo. Perdere una singola partita termina la run, ma non consumerà la tua chiave.",
      modifiers: "Ogni partita avrà un Modificatore casuale che cambia le regole, come 'Caos Briscola' o 'Mano Maledetta'. Adattare la tua strategia è fondamentale.",
      rewards: "Vincere un'intera run ti garantirà uno sfondo esclusivo della rarità della chiave usata, oltre a monete e altri materiali. Anche in caso di sconfitta, otterrai ricompense per ogni partita vinta."
    },

    tutorial: {
        skip: "Salta Tutorial",
        next: "Avanti",
        finish: "Fine",
        welcome: "Benvenuto in Waifu Briscola! Ti guiderò attraverso le basi del gioco.",
        gameMode: "Qui puoi scegliere tra la Briscola Classica o la nuova Modalità Roguelike. Per ora, continuiamo con la classica.",
        difficulty: "Scegli la difficoltà. Per iniziare, 'Facile' è perfetta!",
        waifu: "Seleziona la tua avversaria. Ognuna ha una personalità unica!",
        gallery: "Questo è il portale per la Galleria e il Gacha. Diamo un'occhiata.",
        gachaRoll: "Qui puoi usare le tue Waifu Coin per ottenere nuovi sfondi. La prima estrazione è gratuita!",
        gachaTabs: "Puoi anche navigare tra le schede per creare Chiavi Dungeon o convertire Frammenti ed Essenze.",
        closeGallery: "Per ora è tutto. Chiudi la galleria per continuare.",
        start: "Perfetto! Quando sei pronto, clicca qui per iniziare la partita.",
        playerHand: "Questa è la tua mano. Le carte con un bagliore possono essere giocate.",
        promptPlayCard: "Clicca su una carta per giocarla. Prova a giocare l'Asso di Bastoni.",
        aiResponds: "La tua avversaria ha risposto. Ora vediamo chi ha vinto la mano.",
        trickWon: "Hai vinto! I punti delle due carte vengono aggiunti al tuo punteggio totale.",
        scoreUpdate: "Il tuo punteggio è stato aggiornato qui. L'obiettivo è raggiungere almeno 61 punti.",
        drawingCards: "Dopo ogni mano, entrambi i giocatori pescano una nuova carta dal mazzo.",
        briscola: "Questa è la briscola. Le carte di questo seme vincono su tutte le altre, a meno che l'avversario non giochi una briscola di valore superiore.",
        end: "Hai imparato le basi! Ora tocca a te. Buona fortuna e divertiti!",
    },

  },
  en: {
    // Menu
    title: "Waifu Briscola",
    subtitle: "Challenge a Gemini AI opponent.",
    projectDescription1: "This is a small, unpretentious project born for fun. The goal is to gradually add new features, more card decks, and, above all, lots of new Waifus with unique personalities to discover!",
    projectDescription2: "The funds raised from donations will be used to hire designers and artists to improve the waifus and the game, thus redistributing wealth among humans and not letting AI steal their jobs.",
    startGame: "Start Game",
    resumeGame: "Resume Game",
    language: "Language",
    gameModeLabel: "Game Mode",
    difficultyLabel: "Difficulty",
    difficultyEasy: "Easy",
    difficultyMedium: "Normal",
    difficultyHard: "Hard",
    difficultyNightmare: "Nightmare",
    difficultyApocalypse: "Apocalypse",
    difficultyEasyDesc: "The AI is a great partner for learning. It will play simply and won't be too aggressive.",
    difficultyMediumDesc: "A balanced challenge. The AI plays strategically but can make mistakes.",
    difficultyHardDesc: "Be prepared. The AI plays optimally and will punish your every mistake.",
    difficultyNightmareDesc: "The AI is a briscola master and cheats, drawing the best cards directly from the deck.",
    difficultyApocalypseDesc: "Ruthless and unfair. The AI knows your cards and can draw from the deck. Can you still win?",
    rewardCoinMultiplier: "Coin Multiplier",
    rewardEssenceMultiplier: "Essence Multiplier",
    rewardWin: "Win",
    rewardLoss: "Loss",
    rewardSpecial: "Special",
    cardDeckStyleLabel: "Card Deck Style",
    cardDeckStyleClassic: "Classic",
    cardDeckStylePoker: "Poker",
    diceAnimationLabel: "Dice Animation",
    toggleNsfwLabel: "NSFW Content",
    toggleChatLabel: "Enable Waifu Chat",
    toggleWaitForWaifuLabel: "Wait for Waifu's Reply",
    fastModeEnabled: "Fast mode enabled: the game will no longer wait for the Waifu's response.",
    gameModeClassic: "Classic Briscola",
    gameModeRoguelike: "Roguelike Mode",
    gameModeDungeon: "Dungeon",
    comingSoon: " (Coming Soon)",
    chooseOpponent: "Choose Your Opponent",
    randomOpponent: "Random Opponent",
    randomOpponentDesc: "Face a random waifu chosen from all available ones.",
    waifuDetails: (name) => `${name}'s Details`,
    rulesTitle: "Rules",
    refreshBackground: "New Background",
    waifuCoinRulesTitle: "Waifu Coin Rules",
    waifuCoinRuleLoss: (amount) => `Loss: +${amount} WC`,
    waifuCoinRuleWin61: (amount) => `Win (61-80 points): +${amount} WC`,
    waifuCoinRuleWin81: (amount) => `Win (81-100 points): +${amount} WC`,
    waifuCoinRuleWin101: (amount) => `Win (101+ points): +${amount} WC`,
    waifuCoinRuleWinNightmare: (amount) => `Win (Nightmare): +${amount} WC`,
    waifuCoinRuleWinApocalypse: (amount) => `Win (Apocalypse): +${amount} WC`,
    waifuCoinDifficultyMultiplier: "Difficulty Multiplier",
    waifuCoinDifficultyMultiplierInfo: "The amount of Waifu Coins you receive depends on the difficulty:",
    waifuCoinDifficultyMultiplierEasy: "Easy: 50%",
    waifuCoinDifficultyMultiplierMedium: "Normal: 100%",
    waifuCoinDifficultyMultiplierHard: "Hard: 150%",
    waifuCoinDifficultyMultiplierNightmare: "Nightmare: Special Reward",
    waifuCoinDifficultyMultiplierApocalypse: "Apocalypse: Special Reward",
    gachaRulesTitle: "Gacha Rules",
    gachaFreeFirstRoll: "Your first roll is free!",
    gachaCostSingle: "Single roll cost: 100 WC.",
    gachaCostMulti: "x10 roll cost: 900 WC (1 free roll!).",
    gachaDuplicateShardRule: "Getting a duplicate will give you a Shard of its rarity.",
    gachaRuleRarityTitle: "Rarity Probabilities:",
    gachaRuleRarityR: "R (Rare): ~75%",
    gachaRuleRaritySR: "SR (Super Rare): ~20%",
    gachaRuleRaritySSR: "SSR (Super Super Rare): ~5%",
    gachaPitySystem: "Pity System: Not implemented (yet!).",
    projectDescriptionTitle: "Project Description",
    supportEmail: "Contact Support",
    settingsTitle: "Settings",

    // In-Game
    // FIX: Added missing translation key for the game's win condition.
    winCondition: "The first player to reach 61 points wins. The total points in the deck is 120.",
    yourTurn: "It's your turn.",
    yourTurnMessage: "It's your turn, choose a card.",
    aiStarts: (name) => `${name} starts the trick.`,
    aiPlayedYourTurn: (name) => `${name} has played. Now it's your turn.`,
    youWonTrick: (points) => `You won the trick! +${points} points.`,
    aiWonTrick: (name, points) => `${name} won the trick. +${points} points.`,
    scoreYou: "You",
    scorePoints: (points) => `${points} points`,
    otherCards: "Other cards",
    briscolaLabel: "Trump",
    remainingCardsLabel: "Cards left in deck",
    cardBack: "Card back",
    gameBoardBackground: "Game board background",
    waifuAvatarAlt: (name) => `${name}'s avatar`,
    chatWith: (name) => `Chat with ${name}`,
    closeChat: "Close chat",
    chatPlaceholder: "Type a message...",
    chatPlaceholderOffline: "Chat is unavailable in offline mode.",
    chatPlaceholderChatted: "You've already chatted this turn.",
    chatPlaceholderNotYourTurn: "Wait for your turn to chat.",
    sendMessage: "Send",
    sendMessageInProgress: "Sending...",
    close: "Close",
    backToMenu: "Back to Menu",
    playAgain: "Play Again",
    finalScore: "Final Score:",
    gameOverTitle: "Game Over",
    youWin: "You Win!",
    aiWins: (name) => `${name} wins!`,
    tie: "It's a Tie!",
    coinsEarned: (amount) => `You earned ${amount} Waifu Coin!`,
    cursedCardError: "You can't play the cursed card until it's the last of its suit.",

    // Waifu Prompts
    waifuTrickWinPrompt: (name, personality, humanCard, aiCard, points) =>
        `You are ${name}. ${personality}. You just won a trick in Briscola. You played ${aiCard} and your opponent played ${humanCard}, winning ${points} points. Write a short, witty comment or celebration. Speak in English.`,
    waifuGenericTeasePrompt: (name, personality, aiScore, humanScore) =>
        `You are ${name}. ${personality}. You are playing Briscola, your score is ${aiScore} and the opponent's score is ${humanScore}. Write a short phrase to tease them or comment on the game. Speak in English.`,
    chatFallback: "...",

    // Card Translations
    suits: SUITS_EN,
    values: VALUES_EN,
    cardIdConnector: " of ",

    // Modals
    confirmLeave: {
        title: "Return to menu?",
        message: "The current game will be lost. Are you sure you want to continue?",
        confirm: "Yes, exit",
        cancel: "Cancel",
    },
    quotaExceeded: {
        title: "API Limit Reached",
        message: "It seems we've hit the free message limit for today! The game will continue in offline mode (no chat).",
        continueGame: "Continue playing",
        quotaInfo: "The Gemini API has a daily free limit. To help us cover the costs and keep the chat active, please consider a donation!",
    },
    buyWaifuCoffee: "Buy the Waifus a Coffee",
    supportModal: {
      title: "Support the Project",
      message: "Waifu Briscola is a free amateur project. The costs for the Gemini API and for the artists who draw the Waifus are supported by donations. If you're having fun, consider buying us a coffee!",
      subscriptionPoll: {
          title: "Poll: Monthly Subscription?",
          description: "We are considering introducing a small monthly subscription (e.g., €1-2) to cover costs and ensure unlimited chat. Would you be interested?",
          yes: "Yes, I'd pay!",
          no: "No, I prefer donations",
          thanks: "Thanks for your feedback!",
      }
    },
    privacyPolicy: {
        linkText: "Privacy Policy",
        title: "Waifu Briscola Privacy Policy",
        lastUpdatedPrefix: "Last updated:",
        lastUpdatedDate: "May 25, 2024",
        contactPrefix: "Contact:",
        contactName: "Mauro Mazzocchetti",
        intro: "This Privacy Policy describes how your information is handled when you use the Waifu Briscola application ('Service').",
        collection: {
            title: "Information We Collect",
            intro: "To improve your experience, we use third-party services that may collect information:",
            posthog: {
                title: "Usage Data (PostHog):",
                text: "We collect anonymous or pseudonymous analytics data about how you interact with the game. This includes events like starting a game, cards played, and final results. This data helps us understand how the game is used and how we can improve it. We do not collect personally identifiable information (PII) through PostHog."
            },
            gemini: {
                title: "AI Interactions (Google Gemini):",
                text: "The chat messages you send and game state information (like cards in your hand and on the table) are sent to the Google Gemini API to generate the AI's responses and moves. These interactions are subject to <a href='https://policies.google.com/privacy' target='_blank' rel='noopener noreferrer'>Google's Privacy Policy</a>. We do not send any personal information to Google other than the content of your game interactions."
            },
        },
        usage: {
            title: "How We Use Your Information",
            intro: "We use the information we collect to:",
            points: [
                "Provide, operate, and maintain our Service.",
                "Improve, personalize, and expand our Service.",
                "Understand and analyze how you use our Service.",
                "Prevent abuse and ensure security."
            ]
        },
        sharing: {
            title: "Information Sharing",
            text: "We do not share your personal information with anyone, except for the third-party service providers (PostHog, Google) necessary for the application to function, as described above."
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
            text: "If you have any questions about this Privacy Policy, you can contact Mauro Mazzocchetti."
        }
    },
    termsAndConditions: {
        linkText: "Terms & Conditions",
        title: "Waifu Briscola Terms and Conditions",
        lastUpdatedPrefix: "Last updated:",
        lastUpdatedDate: "May 25, 2024",
        contactPrefix: "Contact:",
        contactName: "Mauro Mazzocchetti",
        intro: "Welcome to Waifu Briscola! These terms and conditions outline the rules and regulations for the use of the Waifu Briscola application ('Service').",
        acceptance: {
            title: "Acceptance of Terms",
            text: "By accessing and using this Service, you accept and agree to be bound by these Terms. If you disagree with any part of the terms, then you may not use the Service."
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
                "We are not responsible for any AI-generated content.",
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

    gallery: {
        promoButton: "Gallery & Gacha",
        title: "Background Gallery",
        gachaButtonFree: "Roll (Free!)",
        gachaButton: (cost) => `Roll (${cost} WC)`,
        gachaButtonX10: (cost) => `Roll x10 (${cost} WC)`,
        gachaNotEnoughCoins: "You don't have enough Waifu Coins!",
        gachaAllUnlocked: "You've unlocked all backgrounds!",
        gachaDuplicate: (rarity) => `Duplicate! You received 1 ${rarity} Shard.`,
        backgroundAlt: "Unlocked background",
        fullscreenView: "Click to view fullscreen.",
        locked: "Locked",
        download: "Download",
        imageSavedToDownloads: "Image saved to Downloads!",
        imageSaveFailed: "Failed to save image.",
        permissionDenied: "Storage permission denied.",
        rarityUnlocked: (rarity) => `You unlocked an ${rarity}!`,
        gachaMultiResultTitle: "x10 Roll Results",
        gachaMultiUnlocked: (count) => `You unlocked ${count} new backgrounds.`,
        gachaMultiShards: (shards) => `You received ${shards} Shards.`,
        craftingTitle: "Craft Keys",
        craftingRuleR: "R Key: 10 R Shards",
        craftingRuleSR: "SR Key: 10 SR Shards + 25 R Shards + 5 Transcendental Essences",
        craftingRuleSSR: "SSR Key: 5 SSR Shards + 15 SR Shards + 10 Transcendental Essences",
        shardLabelR: (shards) => `${shards} R Shards`,
        shardLabelSR: (shards) => `${shards} SR Shards`,
        shardLabelSSR: (shards) => `${shards} SSR Shards`,
        craftButton: (cost) => `Craft (${cost})`,
        gachaNotEnoughShards: "You don't have enough Shards!",
        gachaNoLockedToCraft: (rarity) => `You already have all ${rarity} backgrounds!`,
        craftKeySuccess: (rarity) => `You crafted a ${rarity} Key!`,
        gachaCraftSuccess: (rarity) => `Crafting successful! You unlocked a new ${rarity} background.`,
        convertTitle: "Convert Shards",
        conversionSuccess: (amount, rarity) => `You received ${amount} ${rarity} Shard!`,
        convertButton: "Convert",
        keyLabelR: (keys) => `x${keys} R Keys`,
        keyLabelSR: (keys) => `x${keys} SR Keys`,
        keyLabelSSR: (keys) => `x${keys} SSR Keys`,
        keyNameR: "Rare Key",
        keyNameSR: "Super Rare Key",
        keyNameSSR: "Super Super Rare Key",
        essencesLabel: "Essences",
        convertEssencesTitle: "Convert Essences",
        conversionRuleElemental: "",
        essencesLabelTranscendental: (amount) => `${amount} Transcendental`,
    },

    craftingMinigame: {
      title: "Altar of Creation",
      instructions: "Stop the marker in the green zone to succeed!",
      success: "Crafting Successful!",
      failure: "Crafting Failed!",
      criticalSuccess: "Critical Success! Some materials were refunded!",
      shardsLost: (count) => `You lost ${count} shards!`,
      stop: "Stop",
    },

    dungeonRun: {
        runCompleteTitle: "Dungeon Complete!",
        runCompleteMessage: (total) => `Congratulations! You defeated all ${total} opponents and completed the run!`,
        runFailedTitle: "Dungeon Failed",
        runFailedMessage: (wins, total) => `You were defeated. You won ${wins} out of ${total} matches, but your run ends here. You keep any rewards you've earned.`,
        matchWinTitle: (name) => `You defeated ${name}!`,
        matchWinMessage: (current, total) => `You've cleared encounter ${current} of ${total}. Prepare for the next!`,
        continueRun: "Next Encounter",
        rewardsTitle: "Final Rewards",
        intermediateRewardTitle: "Encounter Rewards",
        rewardBackground: "Exclusive Background Unlocked!",
        modifier: "Match Modifier",
        modifiers: {
            NONE: "No modifier",
            BRISCOLA_CHAOS: "Briscola Chaos: The trump suit changes every 3 tricks.",
            CURSED_HAND: "Cursed Hand: A random card in your hand is cursed. You cannot play it until it is the last of its suit. Once played, the curse moves to another card.",
            ELEMENTAL_FURY: "Elemental Fury: Elemental powers always activate.",
            VALUE_INVERSION: "Value Inversion: Low-value cards (2, 4, 5) are worth more than high-value ones."
        }
    },

    missions: {
        title: "Missions",
        daily: "Daily",
        weekly: "Weekly",
        achievements: "Achievements",
        claim: "Claim",
        claimed: "Claimed",
        noMissions: "No missions available at the moment.",
        rewardsLabel: "Rewards:",
        rewards: {
            waifuCoins: "Waifu Coins",
            r_shards: "R Shards",
            sr_shards: "SR Shards",
            ssr_shards: "SSR Shards",
            fire_essences: "Fire Essences",
            water_essences: "Water Essences",
            air_essences: "Air Essences",
            earth_essences: "Earth Essences",
            transcendental_essences: "Transcendental Essences"
        },
        descriptions: {
            daily_win_classic: "Win {target} game in Classic mode.",
            daily_play_cards_coppe: "Play {target} Cards of Cups.",
            daily_use_elemental_power: "Activate {target} elemental powers in Roguelike mode.",
            weekly_win_any: "Win {target} games in any mode.",
            weekly_win_hard: "Win {target} game on Hard difficulty or higher.",
            weekly_craft_key: "Craft {target} key of any rarity.",
            weekly_gacha_10: "Roll the Gacha {target} times.",
            achievement_win_10: "Win {target} games.",
            achievement_win_50: "Win {target} games.",
            achievement_win_100: "Win {target} games.",
            achievement_win_nightmare: "Win {target} game on Nightmare difficulty.",
            achievement_win_apocalypse: "Win {target} game on Apocalypse difficulty.",
            achievement_defeat_all_waifus: "Defeat every Waifu at least once.",
            achievement_collect_all_ssr: "Collect all SSR rarity backgrounds.",
            achievement_recruit_follower: "Recruit your first follower in Roguelike mode."
        }
    },

    challengeMatch: {
      title: "Challenge Matches",
      info: "Use your crafted keys to challenge a waifu at Nightmare difficulty. Win a new background of the key's rarity! Keys are not consumed on loss.",
      keyLabelR: "R Keys",
      keyLabelSR: "SR Keys",
      keyLabelSSR: "SSR Keys",
      startChallenge: "Start Challenge",
      noKeys: "No keys",
      challengeWinTitle: "Challenge Won!",
      challengeWinMessage: "You won! Here is your reward.",
      challengeLossTitle: "Challenge Failed",
      challengeLossMessage: (name) => `${name} has defeated you, but you didn't lose your key. Try again whenever you're ready!`,
      playAgainChallenge: "Retry Challenge",
      difficultyLocked: "Difficulty is locked to Nightmare for Challenge Matches.",
      noKeysModalTitle: "No Keys!",
      noKeysModalMessage: "You don't have any keys to enter the Dungeon. Craft keys in the Gallery using Shards to play this mode.",
      keySelectionTitle: "Choose a Key",
      keySelectionMessage: "Select the key you want to use for this Dungeon match. The key's rarity determines the rarity of the background prize.",
    },

    soundEditorTitle: "Music Editor",
    toggleMusic: "Toggle Music",
    tempo: "Tempo (BPM)",
    oscillatorType: "Waveform",
    oscSine: "Sine",
    oscSawtooth: "Sawtooth",
    oscSquare: "Square",
    oscTriangle: "Triangle",
    filterFrequency: "Filter Frequency",
    lfoFrequency: "LFO Frequency",
    lfoDepth: "LFO Depth",
    reverbAmount: "Reverb",
    masterVolume: "Master Volume",
    guitarChords: "Chords",
    drums: "Drums",
    kick: "Kick",
    snare: "Snare",
    closedHat: "Closed Hat",
    openHat: "Open Hat",
    play: "Play",
    stop: "Stop",
    resetToDefaults: "Reset",
    decadePresets: "Decade Presets",
    loadPresetPlaceholder: "Load or create a preset...",
    savePreset: "Save Preset",
    presetName: "Preset name...",
    save: "Save",
    defaultPresets: "Default Presets",
    customPresets: "Custom Presets",
    deletePreset: "Delete",
    decade_40s: "'40s Swing",
    decade_50s: "'50s Rock",
    decade_60s: "'60s Soul",
    decade_70s: "'70s Disco",
    decade_80s: "'80s Synth",
    decade_90s: "'90s Pop",
    decade_blue90s: "'90s Eiffel",
    decade_2000s: "'00s Dance",
    decade_2010s: "'10s EDM",
    decade_2020s: "'20s Lo-fi",

    // Roguelike Mode
    elementalPowersTitle: "Elemental Powers",
    elementalChoiceTitle: "Activate elemental power?",
    playNormally: "Play Normally",
    activatePower: "Activate Power",
    cancelAbility: "Cancel",
    fire: "Fire",
    water: "Water",
    air: "Air",
    earth: "Earth",
    fireDescription: "If you win the trick with this card, you gain 3 bonus points.",
    waterDescription: "If you lose the trick with this card, the opponent's winning card's points are halved.",
    airDescription: "When this card is added to your score pile, you gain 1 bonus point for each other Air card already there.",
    earthDescription: "If you lose the trick, you recover this card's points (but not the opponent's).",

    sakura_blessing: "Sakura's Blessing",
    sakura_blessing_desc: "Guarantees victory in the next elemental clash, regardless of dice or weaknesses.",
    rei_analysis: "Rei's Analysis",
    rei_analysis_desc: "If your score is at least 5 points lower than Rei's, you can steal 5 points from her and add them to your score.",
    kasumi_gambit: "Kasumi's Gambit",
    kasumi_gambit_desc: "Swap a card from your hand with the face-up trump card on the table.",

    kasumiSwapTitle: "Kasumi's Gambit",
    kasumiSwapMessage: "Choose a card from your hand to swap with the trump card.",
    briscolaSwapMessage: "Choose a card from your hand to swap with the trump card.",
    followerAbilityArmed: (waifu, ability) => `${waifu} uses ${ability}!`,
    abilityReady: "Ready",
    abilities: {
        onCooldown: (turns) => `On Cooldown (${turns})`,
    },

    elementalClash: {
        title: "Elemental Clash!",
        weaknessTitle: "Elemental Weakness!",
        beats: "beats",
        winner: "Winner",
        tie: "Tie!",
    },

    history: {
      title: "Trick History",
      trick: "Trick",
      you: "You",
      opponent: "Opponent",
      clash: "Clash",
      pointsYou: "Your Pts",
      pointsOpponent: "Opp. Pts",
      bonus: "Bonus",
      lastTrick: "Last Trick",
      abilityUsed: (waifu, ability) => `${waifu} used ${ability}`,
      bonusReasons: {
          water: (points) => `Water (-${points})`,
          fire: "Fire (+3)",
          air: (points) => `Air (+${points})`,
          earth: (points) => `Earth (+${points})`,
          tribute: (points) => `Tribute (+${points})`,
          headhunter: (points) => `Headhunter (+${points})`,
          mastery: (points) => `Mastery (+${points})`,
      }
    },

    roguelike: {
        essencesObtained: "You obtained",
        allPowersTitle: "Active Powers",
        elementalCycleTitle: "Weakness Cycle",
        followerAbilitiesTitle: "Follower Abilities",
        newFollowerTitle: "New Follower!",
        newFollowerMessage: (name) => `${name} has joined you! Her ability will be available in the next matches.`,
        continueRun: "Continue Run",
        runCompleted: "Run Completed!",
        runCompletedMessage: (winnings) => `You have defeated all opponents! You earned ${winnings} WC.`,
        runFailed: "Run Failed",
        runFailedMessage: (winnings) => `You were defeated. You still earned ${winnings} WC for your efforts.`,
        chooseYourPower: "Choose Your Initial Power",
        initialPowerMessage: "This power will stay with you for the whole run and can be upgraded.",
        chooseYourPath: "Choose Your Path",
        levelUpMessage: (level) => `You completed level ${level - 1}. Choose a new power or upgrade your initial one.`,
        rewardsTitle: "Roguelike Mode Rewards",
        rewardWinRun: "Run Victory",
        rewardLossLevel: (level) => `Loss (Lv. ${level})`,
        roguelikeRulesTitle: "Roguelike Mode Rules",
        roguelikeRulesDescription: "Face 4 opponents in a row. Each victory allows you to choose a new power or upgrade your initial one. Lose once, and the run is over. Rewards are given based on the level reached.",
        essenceMultiplierRule: "Elemental Essences obtained in a match are multiplied based on difficulty:",
        roguelikePowersTitle: "All Roguelike Powers",
        powers: {
            upgrade: "UPGRADE",
            bonus_point_per_trick: {
                name: "Divine Tribute",
                desc: (level) => `Gain ${level} bonus point(s) for each trick you win.`
            },
            king_bonus: {
                name: "Headhunter",
                desc: (level) => `Gain ${level * 2} bonus points when you win a trick by playing a Jack, Knight, or King.`
            },
            ace_of_briscola_start: {
                name: "Ace in the Hole",
                desc: (level) => level === 1 ? "Start each match with a high-value trump card (Ace, 3, or King) in your hand." : (level === 2 ? "Start each match with a trump Ace or 3 in your hand." : "Start each match with the trump Ace and 3 in your hand.")
            },
            briscola_mastery: {
                name: "Trump Mastery",
                desc: (level) => `Gain ${level * 2} bonus points when you win a trick by playing a trump card.`
            },
            value_swap: {
                name: "Value Swap",
                desc: (cooldown) => `Once every ${cooldown} turns, you can swap a card from your hand with the trump card on the table.`
            },
            last_trick_insight: {
                name: "Sixth Sense",
                desc: (level) => level === 1 ? "The opponent's hand is revealed during the last trick of the match." : (level === 2 ? "Once every 3 turns, you can reveal the opponent's hand for the current turn." : "The opponent's hand is always visible.")
            },
            third_eye: {
                name: "Third Eye",
                desc: "You can see the entire history of played tricks, not just the last one.",
                historyLockedDesc: "Unlock the 'Third Eye' power to see the full history."
            }
        }
    },

    dungeonRules: {
      title: "Dungeon Mode Rules",
      description: "Dungeon Mode is a series of challenge matches against increasingly difficult opponents. To enter, you must first craft a Key in the Gallery.",
      keyCrafting: "Craft R, SR, or SSR Keys using Shards obtained from Gacha duplicates. The key's rarity determines the run's length and the final prize's rarity.",
      runStructure: "Each run consists of a series of matches at Nightmare difficulty. Losing a single match ends the run, but your key will not be consumed.",
      modifiers: "Each match will have a random Modifier that changes the rules, like 'Briscola Chaos' or 'Cursed Hand'. Adapting your strategy is key.",
      rewards: "Winning an entire run will grant you an exclusive background of the key's rarity, plus coins and other materials. Even if you lose, you will get rewards for each match you've won."
    },

    tutorial: {
        skip: "Skip Tutorial",
        next: "Next",
        finish: "Finish",
        welcome: "Welcome to Waifu Briscola! I'll guide you through the basics of the game.",
        gameMode: "Here you can choose between Classic Briscola or the new Roguelike Mode. For now, let's stick with classic.",
        difficulty: "Choose the difficulty. 'Easy' is perfect to start!",
        waifu: "Select your opponent. Each one has a unique personality!",
        gallery: "This is the portal to the Gallery and Gacha. Let's take a look inside.",
        gachaRoll: "Here you can use your Waifu Coins to roll for new backgrounds. Your first roll is free!",
        gachaTabs: "You can also switch between tabs to craft Dungeon Keys or convert Shards and Essences.",
        closeGallery: "That's all for now. Close the gallery to continue.",
        start: "Perfect! When you're ready, click here to start the game.",
        playerHand: "This is your hand. Cards with a glow can be played.",
        promptPlayCard: "Click on a card to play it. Try playing the Ace of Batons.",
        aiResponds: "Your opponent has responded. Now let's see who won the trick.",
        trickWon: "You won! The points from both cards are added to your total score.",
        scoreUpdate: "Your score has been updated here. The goal is to reach at least 61 points.",
        drawingCards: "After each trick, both players draw a new card from the deck.",
        briscola: "This is the trump card. Cards of this suit beat all others, unless the opponent plays a higher-value trump card.",
        end: "You've learned the basics! Now it's up to you. Good luck and have fun!",
    },

  }
};