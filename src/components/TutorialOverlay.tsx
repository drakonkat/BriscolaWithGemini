/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';

export const TutorialOverlay = observer(() => {
    const { uiStore, gameSettingsStore } = useStores();
    const { highlightedElementRect, tutorialText } = uiStore;
    const T = translations[gameSettingsStore.language];

    const isLastStep = uiStore.tutorialStep > 10;

    const bubbleStyle: React.CSSProperties = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    };

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
            {/* If no rect, a single full-screen pane */}
            {!highlightedElementRect && <div className="tutorial-overlay-pane" style={{ top: 0, left: 0, width: '100%', height: '100%' }} />}

            <div className="tutorial-bubble" style={bubbleStyle}>
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