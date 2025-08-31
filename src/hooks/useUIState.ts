/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useCallback, useRef } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { Player, Card } from '../core/types';
import { translations } from '../core/translations';
import type { Language } from '../core/types';
import { useLocalStorage } from './useLocalStorage';

type SnackbarType = 'success' | 'warning';
type ModalType = 'rules' | 'privacy' | 'terms' | 'gallery' | 'waifuDetails' | 'support' | 'confirmLeave' | 'chat' | 'history';

export const useUIState = (language: Language) => {
    const posthog = usePostHog();
    const T = translations[language];

    // Modal States
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [isWaifuModalOpen, setIsWaifuModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [isConfirmLeaveModalOpen, setIsConfirmLeaveModalOpen] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isQuotaExceededModalOpen, setIsQuotaExceededModalOpen] = useState(false);
    const [hasVotedForSubscription, setHasVotedForSubscription] = useLocalStorage<boolean>('has_voted_subscription', false);


    // UI Element States
    const [menuBackgroundUrl, setMenuBackgroundUrl] = useState(`https://s3.tebi.io/waifubriscola/background/landscape${Math.floor(Math.random() * 19) + 3}.png`);
    const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType }>({ message: '', type: 'success' });
    const [waifuBubbleMessage, setWaifuBubbleMessage] = useState<string>('');
    const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);

    // Animation States
    const [animatingCard, setAnimatingCard] = useState<{ card: Card; player: Player } | null>(null);
    const [drawingCards, setDrawingCards] = useState<{ destination: Player }[] | null>(null);

    const openModal = useCallback((type: ModalType) => {
        switch (type) {
            case 'rules': setIsRulesModalOpen(true); break;
            case 'privacy': setIsPrivacyModalOpen(true); break;
            case 'terms': setIsTermsModalOpen(true); break;
            case 'gallery': setIsGalleryModalOpen(true); break;
            case 'waifuDetails': setIsWaifuModalOpen(true); break;
            case 'support': setIsSupportModalOpen(true); break;
            case 'confirmLeave': setIsConfirmLeaveModalOpen(true); break;
            case 'history': setIsHistoryModalOpen(true); break;
            case 'chat': 
                setIsChatModalOpen(true); 
                setUnreadMessageCount(0);
                break;
        }
    }, []);

    const closeModal = useCallback((type: ModalType) => {
        switch (type) {
            case 'rules': setIsRulesModalOpen(false); break;
            case 'privacy': setIsPrivacyModalOpen(false); break;
            case 'terms': setIsTermsModalOpen(false); break;
            case 'gallery': setIsGalleryModalOpen(false); break;
            case 'waifuDetails': setIsWaifuModalOpen(false); break;
            case 'support': setIsSupportModalOpen(false); break;
            case 'confirmLeave': setIsConfirmLeaveModalOpen(false); break;
            case 'history': setIsHistoryModalOpen(false); break;
            case 'chat': setIsChatModalOpen(false); break;
        }
    }, []);

    const refreshMenuBackground = useCallback(() => {
        const bgIndex = Math.floor(Math.random() * 19) + 3;
        setMenuBackgroundUrl(`https://s3.tebi.io/waifubriscola/background/landscape${bgIndex}.png`);
    }, []);
    
    const showSnackbar = (message: string, type: SnackbarType) => setSnackbar({ message, type });
    const hideSnackbar = () => setSnackbar({ message: '', type: 'success' });

    const closeWaifuBubble = useCallback(() => {
        if (bubbleTimeoutRef.current) {
            clearTimeout(bubbleTimeoutRef.current);
        }
        setWaifuBubbleMessage('');
    }, []);

    const showWaifuBubble = useCallback((message: string) => {
        closeWaifuBubble();
        setWaifuBubbleMessage(message);
        bubbleTimeoutRef.current = setTimeout(() => {
            setWaifuBubbleMessage('');
        }, 5000);
    }, [closeWaifuBubble]);
    
    const handleSubscriptionInterest = useCallback((vote: boolean) => {
        posthog.capture('subscription_interest_voted', { language, vote: vote ? 'yes' : 'no' });
        setHasVotedForSubscription(true);
    }, [posthog, language, setHasVotedForSubscription]);

    return {
        uiState: {
            isRulesModalOpen, isPrivacyModalOpen, isTermsModalOpen, isGalleryModalOpen,
            isWaifuModalOpen, isSupportModalOpen, isConfirmLeaveModalOpen, isChatModalOpen,
            isHistoryModalOpen,
            isQuotaExceededModalOpen,
            menuBackgroundUrl, snackbar, waifuBubbleMessage, unreadMessageCount,
            animatingCard, drawingCards,
            hasVotedForSubscription,
        },
        uiActions: {
            openModal, closeModal, setIsQuotaExceededModalOpen,
            refreshMenuBackground,
            showSnackbar, hideSnackbar,
            showWaifuBubble, closeWaifuBubble,
            setUnreadMessageCount,
            setAnimatingCard, setDrawingCards,
            handleSubscriptionInterest,
        }
    };
};