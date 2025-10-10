/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, runInAction } from 'mobx';
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

type TutorialStepId = 'welcome' | 'gameMode' | 'difficulty' | 'waifu' | 'gallery' | 'start' | 'playerHand' | 'promptPlayCard' | 'aiResponds' | 'trickWon' | 'scoreUpdate' | 'drawingCards' | 'briscola' | 'end';

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
    gallery: { elementQuery: '[data-tutorial-id="gallery"]', textKey: 'gallery', position: 'bottom' },
    start: { elementQuery: '[data-tutorial-id="start-game"]', textKey: 'start', position: 'top', action: (store) => store.rootStore.gameStateStore.startTutorialGame() },
    // In-Game
    playerHand: { elementQuery: '[data-tutorial-id="player-hand"]', textKey: 'playerHand', position: 'top' },
    promptPlayCard: { elementQuery: '[data-tutorial-id="player-hand"]', textKey: 'promptPlayCard', position: 'top', waitForInput: true },
    aiResponds: { elementQuery: '.played-cards', textKey: 'aiResponds', position: 'bottom' },
    trickWon: { elementQuery: '.played-cards', textKey: 'trickWon', position: 'bottom' },
    scoreUpdate: { elementQuery: '[data-tutorial-id="player-score"]', textKey: 'scoreUpdate', position: 'left' },
    drawingCards: { elementQuery: '[data-tutorial-id="briscola-deck"]', textKey: 'drawingCards', position: 'right' },
    briscola: { elementQuery: '[data-tutorial-id="briscola-deck"]', textKey: 'briscola', position: 'right' },
    end: { elementQuery: null, textKey: 'end', position: 'bottom' },
};

const TUTORIAL_SEQUENCE: TutorialStepId[] = [
    'welcome', 'gameMode', 'difficulty', 'waifu', 'gallery', 'start'
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
    hasVotedForSubscription = loadFromLocalStorage('has_voted_subscription', false);

    // Tutorial State
    isTutorialActive = false;
    tutorialStep: TutorialStepId | null = null;
    highlightedElementRect: DOMRect | null = null;
    tutorialText = '';
    tutorialPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
    isTutorialWaitingForInput = false;

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
    }

    openModal = (type: ModalType) => {
        if (this.isTutorialActive) return; // Prevent modals during tutorial
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

    // --- Tutorial Methods ---
    startTutorial = () => {
        this.isTutorialActive = true;
        this.setTutorialStep('welcome');
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
        this.setHighlightedElementByQuery(details.elementQuery);

        if (details.action) {
            details.action(this);
        }
    }

    nextTutorialStep = () => {
        if (!this.tutorialStep) return;
    
        // Handle menu tutorial steps first with the sequence array
        const currentIndex = TUTORIAL_SEQUENCE.indexOf(this.tutorialStep);
        if (currentIndex > -1 && currentIndex < TUTORIAL_SEQUENCE.length - 1) {
            const nextStepId = TUTORIAL_SEQUENCE[currentIndex + 1];
            this.setTutorialStep(nextStepId);
            return;
        }

        // Handle in-game tutorial steps
        switch(this.tutorialStep) {
            case 'start':
                // This is the last menu step. Its action starts the game. The tutorial continues via game events.
                break;
            case 'playerHand':
                this.setTutorialStep('promptPlayCard');
                break;
            case 'aiResponds':
                this.rootStore.gameStateStore.resolveTrickForTutorial();
                // Hide the bubble and wait for the 'trickResolved' event to show the next step.
                this.tutorialStep = null;
                this.highlightedElementRect = null;
                break;
            case 'trickWon':
                this.setTutorialStep('scoreUpdate');
                break;
            case 'scoreUpdate':
                // The game will automatically draw cards and fire the 'cardsDrawn' event,
                // which shows the 'drawingCards' step. Hiding this bubble makes the transition smooth.
                this.tutorialStep = null;
                this.highlightedElementRect = null;
                break;
            case 'drawingCards':
                this.setTutorialStep('briscola');
                break;
            case 'briscola':
                this.setTutorialStep('end');
                break;
        }
    }
    
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

    setHighlightedElementByQuery(query?: string | null) {
        setTimeout(() => {
            runInAction(() => {
                if (query) {
                    const element = document.querySelector(query);
                    if (element) {
                        this.highlightedElementRect = element.getBoundingClientRect();
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