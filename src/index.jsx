/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { PostHogProvider, usePostHog } from 'posthog-js/react';

import { App } from './src/components/App';
import { StoreContext, rootStore } from './src/stores';
import './src/index.css';
import './src/styles/animations.css';
import './src/components/Menu.css';
import './src/components/GameBoard.css';
import './src/components/ChatPanel.css';
import './src/components/Modals.css';
import './src/components/PowerSelectionScreen.css';
import './src/components/TutorialOverlay.css';
import './src/components/Snackbar.css';
import './src/components/Tooltip.css';


const apiKey = process.env.VITE_PUBLIC_POSTHOG_KEY;

const options = {
  api_host: process.env.VITE_PUBLIC_POSTHOG_HOST,
  // Disable PostHog if the key is not provided to avoid initialization errors.
  disabled: !apiKey,
};


const Main = () => {
    const posthog = usePostHog();
    useEffect(() => {
        if (posthog) {
            rootStore.init(posthog);
        }
    }, [posthog]);

    return <App />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));

const renderApp = () => {
    const appContent = (
        <StoreContext.Provider value={rootStore}>
            <Main />
        </StoreContext.Provider>
    );

    if (process.env.VITE_PUBLIC_POSTHOG_HOST) {
        root.render(
            <React.StrictMode>
                <PostHogProvider apiKey={apiKey} options={options}>
                    {appContent}
                </PostHogProvider>
            </React.StrictMode>
        );
    } else {
        root.render(
            <React.StrictMode>
                {appContent}
            </React.StrictMode>
        );
    }
};

renderApp();