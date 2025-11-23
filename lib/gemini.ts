import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "dummy-key-for-build";

export const googleAI = new GoogleGenerativeAI(apiKey);
