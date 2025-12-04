import { GoogleGenAI } from "@google/genai";
import { GroupAssignment } from "../types";

// In a real production app, we would proxy this through a backend to keep the key hidden.
// Since this is a client-side demo, we use the env var.
const apiKey = process.env.API_KEY || '';

export const generateWelcomeMessage = async (group: GroupAssignment): Promise<string> => {
  if (!apiKey) {
    return "Welcome to the study! Your group assignment has been recorded. Please inform the Research Assistant that you have viewed this screen.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are a warm, professional, and empathetic research study assistant.
      A parent/subject has just been assigned to a study group named "${group.groupName}".
      
      Please write a short (2-3 sentences) thank you message.
      - Acknowledge their participation.
      - Confirm they have been successfully sorted.
      - Do NOT explain what the group means medically or scientifically (keep it blind/neutral).
      - Ask them to return the device to the Research Assistant or notify them that they are done.
      - Tone: Calm, reassuring, professional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Thank you for your participation. Your assignment is confirmed.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Thank you for participating! Your group assignment is confirmed. Please let the Research Assistant know you are ready to proceed.";
  }
};