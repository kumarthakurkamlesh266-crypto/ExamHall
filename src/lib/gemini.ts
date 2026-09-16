import { GoogleGenAI } from '@google/genai';

export const initializeGemini = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API key is required to initialize AI features.");
  }
  return new GoogleGenAI({ apiKey });
};
