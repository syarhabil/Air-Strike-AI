
import { GoogleGenAI } from "@google/genai";

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

export const findSoundUrl = async (description: string, fallbackUrl: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find a sound for: '${description}'. Good sources are pixabay.com or mixkit.co.`,
            config: {
                systemInstruction: "You are an expert asset finder. Your task is to find a direct URL to a single, high-quality, royalty-free sound effect. The URL must link directly to an audio file ending in .mp3, .wav, or .ogg. Provide ONLY the raw URL and nothing else.",
                temperature: 0.2,
                stopSequences: ["\n"],
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        const url = response.text.trim();
        if (url.startsWith('https') && (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg'))) {
            console.log(`AI found sound for "${description}": ${url}`);
            return url;
        }
        console.warn(`AI returned an invalid sound URL: "${url}". Using fallback.`);
        return fallbackUrl;
    } catch (error) {
        console.error(`Error finding sound URL for "${description}":`, error);
        return fallbackUrl;
    }
};
