// utils/gemini.js
import { ApiError, GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const getResponse = async (content, maxRetries = 3, delayMs = 2000) => {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: content }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      });

      // Extract text safely
      const rawText =
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        response.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        null;

      if (!rawText) {
        console.error("Gemini raw response:", JSON.stringify(response, null, 2));
        throw new ApiError("No text output from Gemini");
      }

      return rawText;

    } catch (error) {
      // Retry only if the model is overloaded (503)
      if (error?.status === 503) {
        attempts++;
        console.warn(`Gemini overloaded. Retry ${attempts}/${maxRetries} in ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        console.error("Gemini API Error:", error);
        throw error;
      }
    }
  }

  // If all retries fail
  throw new ApiError(503, "Gemini API unavailable after multiple retries");
};

export { getResponse };
