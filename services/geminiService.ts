import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryboardScene } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const generateStoryboardDescriptions = async (
  imagePart: { inlineData: { data: string; mimeType: string; } },
  description: string,
  vibe: string,
  lighting: string,
  contentType: string
) => {
  const prompt = `
    Anda adalah seorang sutradara iklan berpengalaman. Berdasarkan gambar dan deskripsi produk yang diberikan, buat storyboard iklan video 6-scene dalam Bahasa Indonesia.

    Deskripsi Produk: "${description}"

    Arah Kreatif yang diinginkan:
    - Vibe: ${vibe}
    - Pencahayaan: ${lighting}
    - Tipe Konten: ${contentType}

    Untuk setiap scene (total 6 scene), berikan detail berikut:
    1.  **description**: Deskripsi visual yang singkat namun imajinatif dalam Bahasa Indonesia. Deskripsi ini akan digunakan untuk menghasilkan gambar, jadi harus jelas.
    2.  **voiceOver**: Naskah voice-over dalam Bahasa Indonesia yang menarik dan sesuai dengan scene.
    3.  **backsound**: Deskripsi singkat mengenai jenis musik latar atau efek suara yang cocok untuk scene tersebut (misal: "Musik pop upbeat", "Suara alam yang menenangkan").

    Pastikan semua output dalam Bahasa Indonesia. Jangan sertakan nomor atau label scene.
    Kembalikan hasilnya dalam format array JSON yang berisi 6 objek. Setiap objek harus memiliki key "description", "voiceOver", dan "backsound".
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: {
                type: Type.STRING,
                description: "Deskripsi visual detail untuk satu adegan storyboard dalam Bahasa Indonesia.",
              },
              voiceOver: {
                type: Type.STRING,
                description: "Naskah voice-over untuk adegan dalam Bahasa Indonesia.",
              },
              backsound: {
                type: Type.STRING,
                description: "Deskripsi musik latar atau efek suara untuk adegan.",
              },
            },
            required: ["description", "voiceOver", "backsound"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const sceneDescriptions = JSON.parse(jsonText);
    if (!Array.isArray(sceneDescriptions) || sceneDescriptions.length !== 6) {
        throw new Error("API did not return 6 scene descriptions.");
    }
    return sceneDescriptions as { description: string, voiceOver: string, backsound: string }[];
  } catch (error) {
    console.error("Error generating storyboard descriptions:", error);
    throw new Error("Gagal membuat konsep storyboard. Silakan coba lagi.");
  }
};

const generateSceneImage = async (
  originalImagePart: { inlineData: { data: string; mimeType: string; } },
  sceneDescription: string
) => {
    const prompt = `Buat gambar untuk sebuah scene iklan produk berdasarkan produk asli. Gunakan model orang Indonesia. Deskripsi scene: "${sceneDescription}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    originalImagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const part = response.candidates?.[0]?.content?.parts[0];
        if (part?.inlineData?.data) {
             return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        throw new Error('No image data returned from API.');

    } catch (error) {
        console.error("Error generating scene image:", error);
        // Rethrow the error to be handled by the caller
        throw new Error(`Gagal membuat gambar untuk scene: "${sceneDescription}"`);
    }
};


export const generateFullStoryboard = async (
  imageFile: File,
  description: string,
  vibe: string,
  lighting: string,
  contentType: string,
  onSceneGenerated: (scene: StoryboardScene) => void
) => {
    const imagePart = await fileToGenerativePart(imageFile);
    
    // Step 1: Generate all scene descriptions, voice-overs, and backsounds
    const descriptionObjects = await generateStoryboardDescriptions(imagePart, description, vibe, lighting, contentType);

    // Step 2: Generate images for each scene sequentially to avoid rate limiting
    for (let i = 0; i < descriptionObjects.length; i++) {
        const sceneObj = descriptionObjects[i];
        const image = await generateSceneImage(imagePart, sceneObj.description);
        
        onSceneGenerated({
            scene: i + 1,
            description: sceneObj.description,
            voiceOver: sceneObj.voiceOver,
            backsound: sceneObj.backsound,
            image: image,
        });
    }
};