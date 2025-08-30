
import { URL, fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_PUBLIC_POSTHOG_HOST': JSON.stringify(env.VITE_PUBLIC_POSTHOG_HOST),
        'process.env.VITE_PUBLIC_POSTHOG_KEY': JSON.stringify(env.VITE_PUBLIC_POSTHOG_KEY),
        'process.env.APP_VERSION': JSON.stringify(process.env.npm_package_version)
      },
      resolve: {
        alias: {
          // FIX: __dirname is not available in ES modules. Replaced with an equivalent using import.meta.url.
          '@': fileURLToPath(new URL('.', import.meta.url)),
        }
      }
    };
});