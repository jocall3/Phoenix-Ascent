
import { GoogleGenAI } from "@google/genai";
import { ICommandContext } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateCodeFromAudio = async (
  audioBase64: string,
  context: ICommandContext
) => {
  const model = ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: audioBase64
            }
          },
          {
            text: `Act as a senior software engineer. Based on the provided audio request, perform the following task: ${context.generationMode}. 
            Target Language: ${context.targetLanguage}
            Target Framework: ${context.targetFramework}
            
            Return the output in Markdown format. The output MUST include:
            1. A high-quality, production-ready code block.
            2. A brief explanation of the implementation.
            3. A simulated quality score out of 100.
            4. Any security considerations.`
          }
        ]
      }
    ],
    config: {
      temperature: context.promptTemperature,
      maxOutputTokens: context.maxTokens,
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  const response = await model;
  return response.text;
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
