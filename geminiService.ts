
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Grade } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function scanTranscriptImage(base64Image: string): Promise<Partial<Course>[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Extract all course data from this transcript image. 
  Include Course Code (Kode MK), Course Name (Nama MK), Credits (SKS), and Letter Grade (Nilai Mutu).
  Return strictly a JSON array of objects.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING },
            name: { type: Type.STRING },
            sks: { type: Type.NUMBER },
            grade: { type: Type.STRING, description: "One of: A, AB, B, BC, C, D, E" },
          },
          required: ["name", "sks", "grade"],
        },
      },
    },
  });

  try {
    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return [];
  }
}
