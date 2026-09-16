import { GoogleGenAI } from '@google/genai';

export const initializeGemini = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API key is required to initialize AI features.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateWithFallback = async (genAI: GoogleGenAI, prompt: string, systemInstruction?: string) => {
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined
    });
    return response.text;
  } catch (err: any) {
    console.warn("Error with gemini-3.6-flash, falling back to gemini-3.5-flash", err);
    if (err?.status === 400 && err?.message?.includes('API key not valid')) {
       throw new Error('Invalid API Key. Please check your settings.');
    }
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined
      });
      return response.text;
    } catch (fallbackErr: any) {
      if (fallbackErr?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (fallbackErr?.status === 404 || fallbackErr?.message?.includes('not found')) {
        throw new Error('Model unavailable. Please try again later.');
      }
      if (fallbackErr?.message?.includes('fetch') || fallbackErr?.message?.includes('network')) {
        throw new Error('Network error. Please check your connection.');
      }
      throw new Error(fallbackErr.message || 'Error generating content with both primary and fallback models.');
    }
  }
};
