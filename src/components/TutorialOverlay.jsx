/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import React, { useState, useLayoutEffect, useRef } from 'react';

export const TutorialOverlay = observer(() => {
    const { uiStore, gameSettingsStore } = useStores();
    const {
        highlightedElementRect, tutorialText, tutorialPosition, isTutorialWaitingForInput, tutorialStep,
        currentTutorialStepIndex, totalTutorialSteps
    } = uiStore;
    const T = translations[gameSettingsStore.language];
    const bubbleRef = useRef(null);
    const [bubbleStyle, setBubbleStyle] = useState({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0,
    });

    const isLastStep = tutorialStep === 'end';

    useLayoutEffect(() => {
        const BUBBLE_MARGIN = 16;
        const newStyle = { opacity: 1 };

        if (highlightedElementRect && bubbleRef.current) {
            const bubbleRect = bubbleRef.current.getBoundingClientRect();
            const { innerWidth: vw, innerHeight: vh } = window;

            let top = 0;
            let left = 0;

            switch (tutorialPosition) {
                case 'top':
                    top = highlightedElementRect.top - BUBBLE_MARGIN - bubbleRect.height;
                    left = highlightedElementRect.left + (highlightedElementRect.width / 2) - (bubbleRect.width / 2);
                    break;
                case 'left':
                    top = highlightedElementRect.top + (highlightedElementRect.height / 2) - (bubbleRect.height / 2);
                    left = highlightedElementRect.left - BUBBLE_MARGIN - bubbleRect.width;
                    break;
                case 'right':
                    top = highlightedElementRect.top + (highlightedElementRect.height / 2) - (bubbleRect.height / 2);
                    left = highlightedElementRect.right + BUBBLE_MARGIN;
                    break;
                case 'bottom':
                default:
                    top = highlightedElementRect.bottom + BUBBLE_MARGIN;
                    left = highlightedElementRect.left + (highlightedElementRect.width / 2) - (bubbleRect.width / 2);
                    break;
            }

            newStyle.top = `${Math.max(BUBBLE_MARGIN, Math.min(top, vh - bubbleRect.height - BUBBLE_MARGIN))}px`;
            newStyle.left = `${Math.max(BUBBLE_MARGIN, Math.min(left, vw - bubbleRect.width - BUBBLE_MARGIN))}px`;
            newStyle.transform = 'none';

        } else {
            newStyle.top = '50%';
            newStyle.left = '50%';
            newStyle.transform = 'translate(-50%, -50%)';
        }

        setBubbleStyle(newStyle);
    }, [highlightedElementRect, tutorialPosition, tutorialText]);

    return (
        <div className="tutorial-overlay">
            {highlightedElementRect && (
                <>
                    <div className="tutorial-overlay-pane" style={{ top: 0, left: 0, width: '100%', height: `${highlightedElementRect.top}px` }} />
                    <div className="tutorial-overlay-pane" style={{ top: `${highlightedElementRect.bottom}px`, left: 0, width: '100%', height: `calc(100% - ${highlightedElementRect.bottom}px)` }} />
                    <div className="tutorial-overlay-pane" style={{ top: `${highlightedElementRect.top}px`, left: 0, width: `${highlightedElementRect.left}px`, height: `${highlightedElementRect.height}px` }} />
                    <div className="tutorial-overlay-pane" style={{ top: `${highlightedElementRect.top}px`, left: `${highlightedElementRect.right}px`, width: `calc(100% - ${highlightedElementRect.right}px)`, height: `${highlightedElementRect.height}px` }} />
                </>
            )}
            {!highlightedElementRect && <div className="tutorial-overlay-pane" style={{ top: 0, left: 0, width: '100%', height: '100%' }} />}

            <div ref={bubbleRef} className="tutorial-bubble" style={bubbleStyle}>
                <p>{tutorialText}</p>
                <div className="tutorial-buttons">
                    <button className="skip-button" onClick={uiStore.endTutorial}>{T.tutorial.skip}</button>
                    <span className="tutorial-step-counter">
                        {currentTutorialStepIndex + 1} / {totalTutorialSteps}
                    </span>
                    {!isTutorialWaitingForInput && (
                        <button onClick={isLastStep ? uiStore.endTutorial : uiStore.nextTutorialStep}>
                            {isLastStep ? T.tutorial.finish : T.tutorial.next}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});