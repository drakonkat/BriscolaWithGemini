/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { useState, useLayoutEffect, useRef } from 'react';

export const TutorialOverlay = observer(() => {
    const { uiStore, gameSettingsStore } = useStores();
    const { highlightedElementRect, tutorialText, tutorialPosition } = uiStore;
    const T = translations[gameSettingsStore.language];
    const bubbleRef = useRef<HTMLDivElement>(null);
    const [bubbleStyle, setBubbleStyle] = useState<React.CSSProperties>({
        // Initial style to prevent flash of unstyled content
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0, // Start hidden until position is calculated
    });

    // The tutorial steps are split between menu and game. A simple check for a high step number is a decent heuristic for the "end" step.
    const isLastStep = uiStore.tutorialStep > 10;

    useLayoutEffect(() => {
        const BUBBLE_MARGIN = 16;
        const newStyle: React.CSSProperties = { opacity: 1 }; // Make visible after calculation

        if (highlightedElementRect && bubbleRef.current) {
            const bubbleRect = bubbleRef.current.getBoundingClientRect();
            const { innerWidth: vw, innerHeight: vh } = window;

            let top = 0;
            let left = 0;

            // Calculate ideal position based on the 'tutorialPosition' prop from the store
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

            // Clamp position to ensure the bubble stays within the viewport boundaries
            newStyle.top = `${Math.max(BUBBLE_MARGIN, Math.min(top, vh - bubbleRect.height - BUBBLE_MARGIN))}px`;
            newStyle.left = `${Math.max(BUBBLE_MARGIN, Math.min(left, vw - bubbleRect.width - BUBBLE_MARGIN))}px`;
            newStyle.transform = 'none'; // We've manually calculated the top-left, so no transform is needed

        } else {
            // Center the bubble for steps without a highlighted element (e.g., welcome/end messages)
            newStyle.top = '50%';
            newStyle.left = '50%';
            newStyle.transform = 'translate(-50%, -50%)';
        }

        setBubbleStyle(newStyle);
    }, [highlightedElementRect, tutorialPosition, tutorialText]); // Rerun effect when the target, position, or content changes

    return (
        <div className="tutorial-overlay">
            {highlightedElementRect && (
                <>
                    {/* Top pane */}
                    <div className="tutorial-overlay-pane" style={{ top: 0, left: 0, width: '100%', height: `${highlightedElementRect.top}px` }} />
                    {/* Bottom pane */}
                    <div className="tutorial-overlay-pane" style={{ top: `${highlightedElementRect.bottom}px`, left: 0, width: '100%', height: `calc(100% - ${highlightedElementRect.bottom}px)` }} />
                    {/* Left pane */}
                    <div className="tutorial-overlay-pane" style={{ top: `${highlightedElementRect.top}px`, left: 0, width: `${highlightedElementRect.left}px`, height: `${highlightedElementRect.height}px` }} />
                    {/* Right pane */}
                    <div className="tutorial-overlay-pane" style={{ top: `${highlightedElementRect.top}px`, left: `${highlightedElementRect.right}px`, width: `calc(100% - ${highlightedElementRect.right}px)`, height: `${highlightedElementRect.height}px` }} />
                </>
            )}
            {/* If no rect, a single full-screen pane for welcome/end messages */}
            {!highlightedElementRect && <div className="tutorial-overlay-pane" style={{ top: 0, left: 0, width: '100%', height: '100%' }} />}

            <div ref={bubbleRef} className="tutorial-bubble" style={bubbleStyle}>
                <p>{tutorialText}</p>
                <div className="tutorial-buttons">
                    <button className="skip-button" onClick={uiStore.endTutorial}>{T.tutorial.skip}</button>
                    <button onClick={isLastStep ? uiStore.endTutorial : uiStore.nextTutorialStep}>
                        {isLastStep ? T.tutorial.finish : T.tutorial.next}
                    </button>
                </div>
            </div>
        </div>
    );
});
