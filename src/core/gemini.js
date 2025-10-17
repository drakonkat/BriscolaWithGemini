/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI } from '@google/genai';
import { translations } from './translations.js';
import { getCardId } from './utils.js';

export const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

/** Custom error for quota exhaustion. */
export class QuotaExceededError extends Error {
  constructor(message) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}


/**
 * Esegue una chiamata API con una logica di retry con backoff esponenziale.
 * @param apiCall La funzione che esegue la chiamata API.
 * @param maxRetries Numero massimo di tentativi.
 * @param initialDelay Ritardo iniziale in millisecondi.
 * @returns La promessa risolta dalla chiamata API.
 */
const withRetry = async (apiCall, maxRetries = 3, initialDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            const isRateLimitError = error.toString().includes('429') || error.toString().includes('RESOURCE_EXHAUSTED');

            if (isRateLimitError) {
                if (i < maxRetries - 1) {
                    const delay = initialDelay * Math.pow(2, i);
                    console.warn(`Rate limit superato. Riprovo in ${delay}ms... (Tentativo ${i + 1}/${maxRetries - 1})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error('API quota exceeded after all retries.');
                    throw new QuotaExceededError('API quota exceeded after all retries.');
                }
            } else {
                throw error; // Rilancia l'errore se non è un errore di rate limit o se i tentativi sono esauriti
            }
        }
    }
    throw new Error('Numero massimo di tentativi superato.');
};

export const getAIWaifuTrickMessage = async (
  waifu,
  emotionalState,
  humanCard,
  aiCard,
  points,
  lang
) => {
  const T = translations[lang];
  const humanCardId = getCardId(humanCard, lang);
  const aiCardId = getCardId(aiCard, lang);
  const personality = waifu.systemInstructions[lang][emotionalState];

  const prompt = T.waifuTrickWinPrompt(
      waifu.name,
      personality,
      humanCardId,
      aiCardId,
      points
  );

  const performApiCall = async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 1,
      }
    });
    const message = response.text.trim();
    const tokens = response.usageMetadata?.totalTokenCount ?? 0;
    return { message, tokens };
  };

  try {
    return await withRetry(performApiCall);
  } catch (error) {
    if (error instanceof QuotaExceededError) {
        throw error; // Re-throw to be caught by App.tsx
    }
    console.error("Errore durante la generazione del messaggio della waifu:", error);
    return { message: T.chatFallback, tokens: 0 };
  }
};

export const getAIGenericTeasingMessage = async (
  waifu,
  emotionalState,
  aiScore,
  humanScore,
  lang
) => {
  const T = translations[lang];
  const personality = waifu.systemInstructions[lang][emotionalState];

  // FIX: Corrected typo from waifuGenericTeasingMessage to waifuGenericTeasePrompt.
  const prompt = T.waifuGenericTeasePrompt(
      waifu.name,
      personality,
      aiScore,
      humanScore
  );

  const performApiCall = async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 1,
      }
    });
    const message = response.text.trim();
    const tokens = response.usageMetadata?.totalTokenCount ?? 0;
    return { message, tokens };
  };

  try {
    return await withRetry(performApiCall);
  } catch (error) {
    if (error instanceof QuotaExceededError) {
        throw error; // Re-throw to be caught by App.tsx
    }
    console.error("Errore durante la generazione del messaggio generico della waifu:", error);
    return { message: T.chatFallback, tokens: 0 };
  }
};