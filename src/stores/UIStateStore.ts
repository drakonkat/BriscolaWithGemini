/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, runInAction, autorun } from 'mobx';
import type { RootStore } from '.';
import type { Player, Card, ModalType, SnackbarType } from '../core/types';
import { getImageUrl } from '../core/utils';
import { translations } from '../core/translations';

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error loading ${key} from localStorage`, error);
        return defaultValue;
    }
};

type TutorialStepId = 'welcome' | 'gameMode' | 'difficulty' | 'waifu' | 'gallery' | 'gachaRoll' | 'gachaTabs' | 'closeGallery' | 'start' | 'playerHand' | 'promptPlayCard' | 'aiResponds' | 'trickWon' | 'scoreUpdate' | 'drawingCards' | 'briscola' | 'end';

type TutorialStepDetails = {
    elementQuery?: string | null;
    textKey: keyof (typeof translations)['it']['tutorial'];
    position?: 'top' | 'bottom' | 'left' | 'right';
    waitForInput?: boolean;
    action?: (store: UIStateStore) => void;
};

const TUTORIAL_STEPS: Record<TutorialStepId, TutorialStepDetails> = {
    // Menu
    welcome: { elementQuery: '[data-tutorial-id="welcome"]', textKey: 'welcome', position: 'bottom' },
    gameMode: { elementQuery: '[data-tutorial-id="game-mode"]', textKey: 'gameMode', position: 'bottom' },
    difficulty: { elementQuery: '[data-tutorial-id="difficulty"]', textKey: 'difficulty', position: 'bottom' },
    waifu: { elementQuery: '[data-tutorial-id="waifu-selector"]', textKey: 'waifu', position: 'top' },
    gallery: { elementQuery: '[data-tutorial-id="gallery"]', textKey: 'gallery', position: 'top', action: (store) => store.openModal('gallery') },
    gachaRoll: { elementQuery: '[data-tutorial-id="gacha-controls"]', textKey: 'gachaRoll', position: 'bottom' },
    gachaTabs: { elementQuery: '[data-tutorial-id="gallery-tabs"]', textKey: 'gachaTabs', position: 'bottom' },
    closeGallery: { elementQuery: '[data-tutorial-id="gallery-close"]', textKey: 'closeGallery', position: 'top', action: (store) => store.closeModal('gallery') },
    start: { elementQuery: '[data-tutorial-id="start-game"]', textKey: 'start', position: 'top', action: (store) => store.rootStore.gameStateStore.startTutorialGame() },
    // In-Game
    playerHand: { elementQuery: '[data-tutorial-id="player-hand"]', textKey: 'playerHand', position: 'top' },
    promptPlayCard: { elementQuery: '[data-tutorial-id="player-hand"]', textKey: 'promptPlayCard', position: 'top', waitForInput: true },
    aiResponds: { elementQuery: '.played-cards', textKey: 'aiResponds', position: 'bottom' },
    trickWon: { elementQuery: '.played-cards', textKey: 'trickWon', position: 'bottom' },
    scoreUpdate: { elementQuery: '[data-tutorial-id="player-score"]', textKey: 'scoreUpdate', position: 'top' },
    drawingCards: { elementQuery: '[data-tutorial-id="briscola-deck"]', textKey: 'drawingCards', position: 'right' },
    briscola: { elementQuery: '[data-tutorial-id="briscola-deck"]', textKey: 'briscola', position: 'right' },
    end: { elementQuery: null, textKey: 'end', position: 'bottom' },
};

const TUTORIAL_MENU_SEQUENCE: TutorialStepId[] = [
    'welcome', 'gameMode', 'difficulty', 'waifu', 'gallery', 'gachaRoll', 'gachaTabs', 'closeGallery', 'start'
];

const TUTORIAL_INGAME_SEQUENCE: TutorialStepId[] = [
    'playerHand', 'promptPlayCard', 'aiResponds', 'trickWon', 'scoreUpdate', 'drawingCards', 'briscola', 'end'
];

export class UIStateStore {
    rootStore: RootStore;
    
    // Modal States
    isRulesModalOpen = false;
    isPrivacyModalOpen = false;
    isTermsModalOpen = false;
    isGalleryModalOpen = false;
    isWaifuModalOpen = false;
    isSupportModalOpen = false;
    isConfirmLeaveModalOpen = false;
    isChatModalOpen = false;
    isHistoryModalOpen = false;
    isSoundEditorModalOpen = false;
    isQuotaExceededModalOpen = false;
    isGachaSingleUnlockModalOpen = false;
    isGachaMultiUnlockModalOpen = false;
    isLegendModalOpen = false;
    isSettingsModalOpen = false;
    isCraftingMinigameOpen = false;
    isNoKeysModalOpen = false;
    isChallengeKeySelectionModalOpen = false;
    isDungeonProgressModalOpen = false;
    isDungeonEndModalOpen = false;
    isMissionsModalOpen = false;
    isDungeonMatchStartModalOpen = false;
    isDungeonModifierInfoModalOpen = false;
    hasVotedForSubscription = loadFromLocalStorage('has_voted_subscription', false);

    // Menu collapsible sections
    isDifficultyDetailsOpen: boolean = loadFromLocalStorage('ui_difficulty_details_open', window.innerWidth > 768);
    isWaifuDetailsOpen: boolean = loadFromLocalStorage('ui_waifu_details_open', window.innerWidth > 768);

    // Tutorial State
    isTutorialActive = false;
    tutorialStep: TutorialStepId | null = null;
    highlightedElementRect: DOMRect | null = null;
    tutorialText = '';
    tutorialPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
    isTutorialWaitingForInput = false;
    currentTutorialSequence: TutorialStepId[] = TUTORIAL_MENU_SEQUENCE;

    // UI Element States
    menuBackgroundUrl = getImageUrl(`/background/landscape${Math.floor(Math.random() * 19) + 3}.png`);
    snackbar = { message: '', type: 'success' as SnackbarType };
    waifuBubbleMessage = '';
    bubbleTimeoutRef: number | null = null;
    unreadMessageCount = 0;

    // Animation States
    animatingCard: { card: Card; player: Player } | null = null;
    drawingCards: { destination: Player }[] | null = null;

    constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false, bubbleTimeoutRef: false });
        this.rootStore = rootStore;

        autorun(() => localStorage.setItem('ui_difficulty_details_open', JSON.stringify(this.isDifficultyDetailsOpen)));
        autorun(() => localStorage.setItem('ui_waifu_details_open', JSON.stringify(this.isWaifuDetailsOpen)));
    }

    get currentTutorialStepIndex() {
        if (!this.tutorialStep) return 0;
        return this.currentTutorialSequence.indexOf(this.tutorialStep);
    }

    get totalTutorialSteps() {
        return this.currentTutorialSequence.length;
    }

    openModal = (type: ModalType) => {
        if (this.isTutorialActive && type !== 'gallery') return; // Prevent modals during tutorial, except for gallery
        switch (type) {
            case 'rules': this.isRulesModalOpen = true; break;
            case 'privacy': this.isPrivacyModalOpen = true; break;
            case 'terms': this.isTermsModalOpen = true; break;
            case 'gallery': this.isGalleryModalOpen = true; break;
            case 'waifuDetails': this.isWaifuModalOpen = true; break;
            case 'support': this.isSupportModalOpen = true; break;
            case 'confirmLeave': this.isConfirmLeaveModalOpen = true; break;
            case 'history': this.isHistoryModalOpen = true; break;
            case 'soundEditor': this.isSoundEditorModalOpen = true; break;
            case 'gachaSingleUnlock': this.isGachaSingleUnlockModalOpen = true; break;
            case 'gachaMultiUnlock': this.isGachaMultiUnlockModalOpen = true; break;
            case 'legend': this.isLegendModalOpen = true; break;
            case 'settings': this.isSettingsModalOpen = true; break;
            case 'craftingMinigame': this.isCraftingMinigameOpen = true; break;
            case 'noKeys': this.isNoKeysModalOpen = true; break;
            case 'challengeKeySelection': this.isChallengeKeySelectionModalOpen = true; break;
            case 'dungeonProgress': this.isDungeonProgressModalOpen = true; break;
            case 'dungeonEnd': this.isDungeonEndModalOpen = true; break;
            case 'missions': this.isMissionsModalOpen = true; break;
            case 'dungeonMatchStart': this.isDungeonMatchStartModalOpen = true; break;
            case 'dungeonModifierInfo': this.isDungeonModifierInfoModalOpen = true; break;
            case 'chat': 
                this.isChatModalOpen = true; 
                this.setUnreadMessageCount(0);
                break;
        }
    }

    closeModal = (type: ModalType) => {
        switch (type) {
            case 'rules': this.isRulesModalOpen = false; break;
            case 'privacy': this.isPrivacyModalOpen = false; break;
            case 'terms': this.isTermsModalOpen = false; break;
            case 'gallery': this.isGalleryModalOpen = false; break;
            case 'waifuDetails': this.isWaifuModalOpen = false; break;
            case 'support': this.isSupportModalOpen = false; break;
            case 'confirmLeave': this.isConfirmLeaveModalOpen = false; break;
            case 'history': this.isHistoryModalOpen = false; break;
            case 'soundEditor': this.isSoundEditorModalOpen = false; break;
            case 'gachaSingleUnlock': this.isGachaSingleUnlockModalOpen = false; break;
            case 'gachaMultiUnlock': this.isGachaMultiUnlockModalOpen = false; break;
            case 'legend': this.isLegendModalOpen = false; break;
            case 'settings': this.isSettingsModalOpen = false; break;
            case 'craftingMinigame': this.isCraftingMinigameOpen = false; break;
            case 'noKeys': this.isNoKeysModalOpen = false; break;
            case 'challengeKeySelection': this.isChallengeKeySelectionModalOpen = false; break;
            case 'dungeonProgress': this.isDungeonProgressModalOpen = false; break;
            case 'dungeonEnd': this.isDungeonEndModalOpen = false; break;
            case 'missions': this.isMissionsModalOpen = false; break;
            case 'dungeonMatchStart': this.isDungeonMatchStartModalOpen = false; break;
            case 'dungeonModifierInfo': this.isDungeonModifierInfoModalOpen = false; break;
            case 'chat': this.isChatModalOpen = false; break;
        }
    }

    setIsQuotaExceededModalOpen = (isOpen: boolean) => {
        if (this.isTutorialActive) return;
        this.isQuotaExceededModalOpen = isOpen;
    }
    
    refreshMenuBackground = () => {
        const bgIndex = Math.floor(Math.random() * 19) + 3;
        this.menuBackgroundUrl = getImageUrl(`/background/landscape${bgIndex}.png`);
    }
    
    showSnackbar = (message: string, type: SnackbarType) => {
        this.snackbar = { message, type };
    }

    hideSnackbar = () => {
        this.snackbar = { message: '', type: 'success' };
    }

    closeWaifuBubble = () => {
        if (this.bubbleTimeoutRef) {
            clearTimeout(this.bubbleTimeoutRef);
        }
        this.waifuBubbleMessage = '';
    }

    showWaifuBubble = (message: string) => {
        this.closeWaifuBubble();
        this.waifuBubbleMessage = message;
        this.bubbleTimeoutRef = window.setTimeout(() => {
            runInAction(() => {
                this.waifuBubbleMessage = '';
            });
        }, 5000);
    }
    
    setUnreadMessageCount = (count: number | ((prev: number) => number)) => {
        this.unreadMessageCount = typeof count === 'function' ? count(this.unreadMessageCount) : count;
    }

    setAnimatingCard = (card: { card: Card; player: Player } | null) => {
        this.animatingCard = card;
    }
    
    setDrawingCards = (cards: { destination: Player }[] | null) => {
        this.drawingCards = cards;
    }

    handleSubscriptionInterest = (vote: boolean) => {
        this.rootStore.posthog?.capture('subscription_interest_voted', { 
            language: this.rootStore.gameSettingsStore.language, 
            vote: vote ? 'yes' : 'no' 
        });
        this.setHasVotedForSubscription(true);
    }
    
    setHasVotedForSubscription = (voted: boolean) => {
        this.hasVotedForSubscription = voted;
        localStorage.setItem('has_voted_subscription', JSON.stringify(voted));
    }

    toggleDifficultyDetails = () => {
        this.isDifficultyDetailsOpen = !this.isDifficultyDetailsOpen;
    }

    toggleWaifuDetails = () => {
        this.isWaifuDetailsOpen = !this.isWaifuDetailsOpen;
    }

    // --- Tutorial Methods ---
    startTutorial = () => {
        this.isTutorialActive = true;
        this.currentTutorialSequence = TUTORIAL_MENU_SEQUENCE;
        this.setTutorialStep('welcome');
    }

    switchToInGameTutorial = () => {
        this.currentTutorialSequence = TUTORIAL_INGAME_SEQUENCE;
        this.setTutorialStep('playerHand');
    }

    endTutorial = () => {
        this.isTutorialActive = false;
        this.tutorialStep = null;
        this.highlightedElementRect = null;
        this.rootStore.gameSettingsStore.setTutorialCompleted(true);
        if (this.rootStore.gameStateStore.isTutorialGame) {
            this.rootStore.gameStateStore.goToMenu();
        }
    }
    
    setTutorialStep(stepId: TutorialStepId) {
        const T = translations[this.rootStore.gameSettingsStore.language].tutorial;
        const details = TUTORIAL_STEPS[stepId];
        if (!details) {
            this.endTutorial();
            return;
        }

        this.tutorialStep = stepId;
        this.tutorialText = T[details.textKey] as string;
        this.tutorialPosition = details.position ?? 'bottom';
        this.isTutorialWaitingForInput = details.waitForInput ?? false;
        this.setHighlightedElementByQuery(details.elementQuery, stepId);

        if (details.action) {
            details.action(this);
        }
    }

    nextTutorialStep = () => {
        if (!this.tutorialStep) return;
    
        // Special actions on "Next" click that trigger game events
        if (this.tutorialStep === 'aiResponds') {
            this.rootStore.gameStateStore.resolveTrickForTutorial();
            // Hide bubble and wait for 'trickResolved' event to show next step
            this.tutorialStep = null; 
            this.highlightedElementRect = null;
            return;
        }
        if (this.tutorialStep === 'scoreUpdate') {
            // The game will automatically draw cards and trigger the 'cardsDrawn' event.
            // Hiding this bubble makes the transition smooth.
            this.tutorialStep = null;
            this.highlightedElementRect = null;
            return;
        }
    
        // General logic: advance to the next step in the current sequence
        const currentIndex = this.currentTutorialSequence.indexOf(this.tutorialStep);
        if (currentIndex > -1 && currentIndex < this.currentTutorialSequence.length - 1) {
            const nextStepId = this.currentTutorialSequence[currentIndex + 1];
            this.setTutorialStep(nextStepId);
        } else if (this.tutorialStep === 'end' || this.tutorialStep === 'start') {
            // End tutorial after 'start' if we are in menu sequence.
            if (this.currentTutorialSequence === TUTORIAL_MENU_SEQUENCE && this.tutorialStep === 'start') {
                // Do nothing, the action in the step will start the game and switch the sequence
            } else {
                 this.endTutorial();
            }
        }
    };
    
    onTutorialGameEvent(event: 'aiResponded' | 'trickResolved' | 'cardsDrawn') {
        if (!this.isTutorialActive) return;

        switch(event) {
            case 'aiResponded':
                this.setTutorialStep('aiResponds');
                break;
            case 'trickResolved':
                this.setTutorialStep('trickWon');
                break;
            case 'cardsDrawn':
                this.setTutorialStep('drawingCards');
                break;
        }
    }

    setHighlightedElementByQuery(query?: string | null, stepId?: TutorialStepId) {
        setTimeout(() => {
            runInAction(() => {
                if (query) {
                    const element = document.querySelector(query) as HTMLElement;
                    if (element) {
                        // Special handling to scroll sections into view on mobile
                        if (stepId === 'waifu' || stepId === 'gallery') {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // Wait for the smooth scroll to finish before getting the element's position
                            setTimeout(() => {
                                runInAction(() => {
                                    this.highlightedElementRect = element.getBoundingClientRect();
                                });
                            }, 400); 
                        } else {
                            this.highlightedElementRect = element.getBoundingClientRect();
                        }
                    } else {
                        console.warn(`Tutorial element not found: ${query}`);
                        this.highlightedElementRect = null;
                    }
                } else {
                    this.highlightedElementRect = null; 
                }
            });
        }, 150);
    }
}