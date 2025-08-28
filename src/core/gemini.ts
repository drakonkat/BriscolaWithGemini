/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from '@google/genai';
import { translations } from './translations';
import { getCardId } from './utils';
import { SUITS_IT } from './constants';
import type { Card, GameEmotionalState, Language, Suit, Waifu } from './types';

export const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

/**
 * Esegue una chiamata API con una logica di retry con backoff esponenziale.
 * @param apiCall La funzione che esegue la chiamata API.
 * @param maxRetries Numero massimo di tentativi.
 * @param initialDelay Ritardo iniziale in millisecondi.
 * @returns La promessa risolta dalla chiamata API.
 */
const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error: any) {
            const isRateLimitError = error.toString().includes('429') || error.toString().includes('RESOURCE_EXHAUSTED');

            if (isRateLimitError && i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                console.warn(`Rate limit superato. Riprovo in ${delay}ms... (Tentativo ${i + 1}/${maxRetries - 1})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error; // Rilancia l'errore se non è un errore di rate limit o se i tentativi sono esauriti
            }
        }
    }
    throw new Error('Numero massimo di tentativi superato.');
};


export const getAIMove = async (
  aiHand: Card[],
  briscolaSuit: Suit,
  cardsOnTable: Card[],
  lang: Language
): Promise<Card> => {
    
  const langStrings = translations[lang];
  const aiHandIds = aiHand.map(card => getCardId(card, lang));
  const humanCard = cardsOnTable.length > 0 ? cardsOnTable[0] : null;
  const humanCardId = humanCard ? getCardId(humanCard, lang) : null;
  const briscolaSuitId = langStrings.suits[SUITS_IT.indexOf(briscolaSuit)];
  
  const prompt = langStrings.aiMovePrompt(humanCardId, briscolaSuitId, aiHandIds);

  const performApiCall = async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cardToPlay: {
              type: Type.STRING,
              description: langStrings.aiMoveSchemaDescription(aiHandIds),
            },
            reasoning: {
              type: Type.STRING,
              description: "A brief explanation of your choice."
            }
          },
          required: ["cardToPlay"]
        },
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const result = JSON.parse(response.text);
    const chosenCardId = result.cardToPlay;
    const chosenCard = aiHand.find(card => getCardId(card, lang) === chosenCardId);

    if (chosenCard) {
      return chosenCard;
    } else {
      console.warn("L'IA ha scelto una carta non presente nella sua mano, gioca la prima carta valida.");
      return aiHand[0];
    }
  };

  try {
      return await withRetry(performApiCall);
  } catch (error) {
      console.error("Errore durante la scelta della mossa dell'IA:", error);
      // Fallback in caso di errore API
      return aiHand[Math.floor(Math.random() * aiHand.length)];
  }
};

export const getAIWaifuTrickMessage = async (
  waifu: Waifu,
  emotionalState: GameEmotionalState,
  humanCard: Card,
  aiCard: Card,
  points: number,
  lang: Language
): Promise<string> => {
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
    return response.text.trim();
  };

  try {
    return await withRetry(performApiCall);
  } catch (error) {
    console.error("Errore durante la generazione del messaggio della waifu:", error);
    return T.chatFallback;
  }
};
