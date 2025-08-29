/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import { PostHogProvider } from 'posthog-js/react';

import { App } from './src/components/App';
import './src/index.css';

const options = {
  api_host: process.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: '2025-05-24',
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <PostHogProvider 
            apiKey={process.env.VITE_PUBLIC_POSTHOG_KEY} 
            options={options}>
            <App />
        </PostHogProvider>
    </React.StrictMode>
);