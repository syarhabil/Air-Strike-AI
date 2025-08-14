
import { GoogleGenAI, Type } from "@google/genai";
import { SoundAsset } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: `A 2D sprite for a top-down space shooter game. The object is: ${prompt}. The sprite must have a fully transparent background (alpha channel PNG). The object should be facing upwards towards the top of the image. Clean, pixel-art style.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    }
    throw new Error('No image was generated.');
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image from AI.');
  }
};

export const generateMission = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Generate a short, exciting one-sentence mission briefing for an air combat game against alien invaders.',
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error('Error generating mission:', error);
        return "Destroy all enemy ships!"; // Fallback mission
    }
};

export const findSoundUrl = async (description: string, fallbackAsset: SoundAsset): Promise<SoundAsset> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find a sound for: '${description}'. Good sources are pixabay.com or mixkit.co.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        url: {
                            type: Type.STRING,
                            description: "The direct URL to a single, high-quality, royalty-free audio file (.mp3, .wav, or .ogg).",
                        },
                        source: {
                            type: Type.STRING,
                            description: "The domain name of the source website (e.g., 'pixabay.com' or 'mixkit.co')."
                        }
                    },
                    required: ["url", "source"],
                },
                systemInstruction: "You are an expert asset finder. Your task is to return a JSON object containing a direct audio file URL and its source domain.",
                temperature: 0.2,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        if (parsed.url && parsed.source && parsed.url.startsWith('https')) {
            console.log(`AI found sound for "${description}" from ${parsed.source}: ${parsed.url}`);
            return parsed;
        }

        console.warn(`AI returned invalid JSON: "${jsonText}". Using fallback.`);
        return fallbackAsset;
    } catch (error) {
        console.error(`Error finding sound URL for "${description}":`, error);
        return fallbackAsset;
    }
};