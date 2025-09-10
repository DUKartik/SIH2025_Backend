// utils/gemini.js
import { ApiError, GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const getResponse = async (content) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: content }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    });

    // ✅ Extract text safely (different SDKs have different shapes)
    let rawText =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      null;

    if (!rawText) {
      console.error("Gemini raw response:", JSON.stringify(response, null, 2));
      throw new ApiError("No text output from Gemini");
    }

    return rawText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export { getResponse };
