/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from '.';
import type { Player, Card, ModalType, SnackbarType } from '../core/types';
import { getImageUrl } from '../core/utils';
// FIX: Add missing import for translations.
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

type TutorialStepDetails = {
    elementQuery: string;
    // FIX: Correct type for textKey
    textKey: keyof (typeof translations)['it']['tutorial'];
    position?: 'top' | 'bottom' | 'left' | 'right';
};

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
    isEventModalOpen = false;
    isSoundEditorModalOpen = false;
    isQuotaExceededModalOpen = false;
    hasVotedForSubscription = loadFromLocalStorage('has_voted_subscription', false);

    // Tutorial State
    isTutorialActive = false;
    tutorialStep = 0;
    highlightedElementRect: DOMRect | null = null;
    tutorialText = '';
    tutorialPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

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
            case 'event': this.isEventModalOpen = true; break;
            case 'soundEditor': this.isSoundEditorModalOpen = true; break;
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
            case 'event': this.isEventModalOpen = false; break;
            case 'soundEditor': this.isSoundEditorModalOpen = false; break;
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
        this.tutorialStep = 0; // Will be incremented to 1 by nextTutorialStep
        this.nextTutorialStep();
    }

    endTutorial = () => {
        this.isTutorialActive = false;
        this.tutorialStep = 0;
        this.highlightedElementRect = null;
        this.rootStore.gameSettingsStore.setTutorialCompleted(true);
        // FIX: Correctly access isTutorialGame from gameStateStore.
        if (this.rootStore.gameStateStore.isTutorialGame) {
            this.rootStore.gameStateStore.goToMenu();
        }
    }

    nextTutorialStep = () => {
        const { gameStateStore, gameSettingsStore } = this.rootStore;
        // FIX: Add missing reference to translations.
        const T = translations[gameSettingsStore.language].tutorial;

        this.tutorialStep++;
    
        const menuSteps: TutorialStepDetails[] = [
            { elementQuery: '[data-tutorial-id="welcome"]', textKey: 'welcome', position: 'bottom' },
            { elementQuery: '[data-tutorial-id="game-mode"]', textKey: 'gameMode', position: 'bottom' },
            { elementQuery: '[data-tutorial-id="difficulty"]', textKey: 'difficulty', position: 'bottom' },
            { elementQuery: '[data-tutorial-id="waifu-selector"]', textKey: 'waifu', position: 'top' },
            { elementQuery: '[data-tutorial-id="gallery"]', textKey: 'gallery', position: 'bottom' },
            { elementQuery: '[data-tutorial-id="start-game"]', textKey: 'start', position: 'top' },
        ];
    
        const gameSteps: TutorialStepDetails[] = [
            { elementQuery: '[data-tutorial-id="player-hand"]', textKey: 'playerHand', position: 'top' },
            { elementQuery: '[data-tutorial-id="briscola-deck"]', textKey: 'briscola', position: 'right' },
            { elementQuery: '[data-tutorial-id="player-score"]', textKey: 'score', position: 'left' },
            { elementQuery: '[data-tutorial-id="waifu-status"]', textKey: 'waifuStatus', position: 'left' },
            { elementQuery: '[data-tutorial-id="end-tutorial"]', textKey: 'end', position: 'bottom' },
        ];
    
        let currentStepDetails: TutorialStepDetails | undefined;
    
        if (gameStateStore.phase === 'menu') {
            currentStepDetails = menuSteps[this.tutorialStep - 1];
        // FIX: Correctly access isTutorialGame from gameStateStore.
        } else if (gameStateStore.isTutorialGame) {
            currentStepDetails = gameSteps[this.tutorialStep - menuSteps.length - 1];
        }
    
        if (currentStepDetails) {
            this.updateTutorialUI(currentStepDetails, T);
            if (this.tutorialStep === menuSteps.length) {
                // Last step of menu, special handling
                // FIX: Correctly call startTutorialGame from gameStateStore.
                setTimeout(() => gameStateStore.startTutorialGame(), 500);
            }
        } else {
            this.endTutorial();
        }
    }
    
    updateTutorialUI(details: TutorialStepDetails, translation: any) {
        this.tutorialText = translation[details.textKey];
        this.tutorialPosition = details.position ?? 'bottom';
        this.setHighlightedElementByQuery(details.elementQuery);
    }
    
    setHighlightedElementByQuery(query: string) {
        // Use a small delay to ensure the element is rendered and laid out
        setTimeout(() => {
            runInAction(() => {
                const element = document.querySelector(query);
                if (element) {
                    this.highlightedElementRect = element.getBoundingClientRect();
                } else {
                    // Fallback for centered "welcome" or "end" messages
                    this.highlightedElementRect = null; 
                }
            });
        }, 100);
    }
}