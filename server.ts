/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Create a named instance of GoogleGenAI as required by the gemini-api skill rules.
// User-Agent: 'aistudio-build' is strictly demanded in httpOptions headers.
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini API initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set higher body payload limits for holding uploaded vehicle photos (base64)
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // ================= API ENDPOINTS FIRST =================

  // Healthcheck
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Cartoonize API endpoint
  app.post('/api/cartoonize', async (req: Request, res: Response) => {
    const { vehicleType, vehicleName, originalImageBase64 } = req.body;

    const chosenType = vehicleType || 'delivery truck';
    const chosenName = vehicleName || 'Asset';

    console.log(`Received cartoonize request for type: ${chosenType}, name: ${chosenName}`);

    // If API key is not present or initialization failed, notify client to use fallback
    if (!ai) {
      console.log('No Gemini API key configured. Utilizing aesthetic local SVG vector cartoon assets.');
      return res.json({
        success: true,
        isFallback: true,
        message: 'No GEMINI_API_KEY found. Reverting to elegant vector rendering engine.',
        imageUrl: null
      });
    }

    try {
      // 1. We ask Gemini for a stylized, clear image prompt of the cartoon sticker
      const descriptionPrompt = `Write a short, highly professional 1-sentence prompt for a text-to-image generator. 
      The goal is to generate a beautiful, clean, bold 2D vector cartoon sticker of a "${chosenType}" named "${chosenName}". 
      It should look polished and suitable for an investment portfolio. Include details like bold outline, modern transport colors, solid white background. Do not include text in the image.`;

      const promptResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: descriptionPrompt,
      });

      const processedPromptText = promptResponse.text || `Vibrant 2D cartoon sticker of a modern transport ${chosenType}, vector outline, professional design, solid white background.`;
      console.log(`Generated image prompt via Gemini 3.5 Flash: ${processedPromptText}`);

      // 2. Generate the actual cartoon image using the gemini-2.5-flash-image model
      console.log('Invoking gemini-2.5-flash-image model...');
      const imageGenResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `${processedPromptText} Solid clear outline, simple background.` }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: '1:1',
            imageSize: '512px' // fast and high-quality for avatar size
          }
        }
      });

      let generatedBase64 = '';
      if (imageGenResponse.candidates?.[0]?.content?.parts) {
        for (const part of imageGenResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedBase64 = part.inlineData.data;
            break;
          }
        }
      }

      if (generatedBase64) {
        return res.json({
          success: true,
          isFallback: false,
          imageUrl: `data:image/png;base64,${generatedBase64}`,
          promptUsed: processedPromptText
        });
      } else {
        console.warn('Gemini returned empty parts or no inlineData.');
        return res.json({
          success: true,
          isFallback: true,
          message: 'Empty response parts or format. Reverting to vector rendering engine.',
          imageUrl: null
        });
      }

    } catch (error: any) {
      console.error('Error during Gemini cartoonization process:', error);
      return res.status(200).json({
        success: true,
        isFallback: true,
        error: error.message || 'Gemini Generation timed out or failed.',
        imageUrl: null
      });
    }
  });

  // ================= VITE OR STATIC SERVER MIDDLEWARE =================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
