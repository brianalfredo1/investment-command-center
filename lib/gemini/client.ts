import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function getModel(modelName = "gemini-1.5-flash") {
  return genAI.getGenerativeModel({ model: modelName });
}
