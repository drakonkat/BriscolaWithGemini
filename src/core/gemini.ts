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

  try {
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
      console.warn("AI chose a card not in its hand, playing first valid card.");
      return aiHand[0];
    }
  } catch (error) {
      console.error("Error getting AI move:", error);
      // Fallback in case of API error
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 1,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating waifu trick message:", error);
    return T.chatFallback;
  }
};