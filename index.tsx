/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import { PostHogProvider } from 'posthog-js/react';

import { App } from './src/components/App';
import './src/index.css';

const apiKey = process.env.VITE_PUBLIC_POSTHOG_KEY;

const options = {
  api_host: process.env.VITE_PUBLIC_POSTHOG_HOST,
  // Disable PostHog if the key is not provided to avoid initialization errors.
  disabled: !apiKey,
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <PostHogProvider 
            apiKey={apiKey} 
            options={options}>
            <App />
        </PostHogProvider>
    </React.StrictMode>
);