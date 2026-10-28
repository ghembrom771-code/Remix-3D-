import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;

// Hardcoded interesting locations across the globe
const LOCATIONS = [
  "Eiffel Tower, Paris",
  "Taj Mahal, India",
  "Statue of Liberty, New York",
  "Great Wall of China",
  "Machu Picchu, Peru",
  "Colosseum, Rome",
  "Pyramids of Giza, Egypt",
  "Sydney Opera House",
  "Mount Fuji, Japan",
  "Santorini, Greece",
  "Stonehenge, UK",
  "Petra, Jordan",
  "Burj Khalifa, Dubai",
  "Niagara Falls, Canada",
  "Mount Everest, Himalayas",
  "Golden Gate Bridge, San Francisco",
  "Acropolis of Athens",
  "Angkor Wat, Cambodia",
  "Sagrada Familia, Barcelona",
  "Venice Canals, Italy",
  "Victoria Falls, Zambia",
  "Galapagos Islands",
  "Easter Island statues",
  "Chichen Itza, Mexico",
  "Yellowstone Grand Prismatic Spring",
  "Aurora Borealis in Iceland",
  "Serengeti National Park, Tanzania",
  "Banff National Park, Canada",
  "Salar de Uyuni, Bolivia",
  "Bora Bora overwater bungalows",
  "Maldives beaches",
  "Christ the Redeemer, Brazil",
  "Table Mountain, South Africa",
  "Neuschwanstein Castle, Germany",
  "St. Basil's Cathedral, Moscow",
  "Forbidden City, Beijing",
  "Halong Bay, Vietnam",
  "Times Square, New York at night",
  "Grand Canyon, Arizona",
  "Big Ben, London",
  "Louvre Museum pyramid, Paris",
  "Blue Lagoon, Iceland",
  "Mount Kilimanjaro",
  "Cinque Terre, Italy",
  "Lake Como, Italy",
  "The Alhambra, Spain",
  "Cappadocia hot air balloons, Turkey",
  "Antelope Canyon, Arizona"
];

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  
  app.use(express.json({ limit: '50mb' }));

  // Dedicated 3D Cinematic Portrait endpoint
  app.post("/api/generate-portrait", async (req, res) => {
    try {
      const {
        referenceImage,
        maskStyle = "Matte Black Fabric with micro-stitching and natural folds",
        lightingStyle = "Dramatic studio lighting with soft rim lighting around the subject, balanced highlights, deep natural shadows",
        backgroundStyle = "Modern dark cinematic background with subtle gradients",
        customPromptAdditions = "",
        aspectRatio = "9:16"
      } = req.body;

      if (!referenceImage) {
        return res.status(400).json({ success: false, error: "Reference image is required." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ success: false, error: "GEMINI_API_KEY is not configured." });
      }

      let imageMime = "image/jpeg";
      let base64Data = "";

      const match = referenceImage.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,([^"]*)$/);
      if (match && match.length === 3) {
        imageMime = match[1];
        base64Data = match[2];
      } else if (referenceImage.startsWith('/')) {
        // Local file path
        try {
          const fs = await import('fs');
          const filePath = path.join(process.cwd(), referenceImage.replace(/^\//, ''));
          if (fs.existsSync(filePath)) {
            const fileBuf = fs.readFileSync(filePath);
            base64Data = fileBuf.toString('base64');
            imageMime = referenceImage.endsWith('.png') ? 'image/png' : 'image/jpeg';
          }
        } catch (err) {
          console.error("Failed to read local reference image:", err);
        }
      }

      if (!base64Data) {
        return res.status(400).json({ success: false, error: "Invalid reference image format." });
      }

      const promptText = `Professional 3D Cinematic Portrait | 4K Ultra HD

Transform the uploaded reference photo into an ultra-realistic, high-end 3D cinematic portrait. Preserve the person's exact identity, recognizable facial features, natural skin tone, hairstyle, eye shape, age, and body proportions.

Add a stylish black face mask covering the nose, mouth, and chin, with realistic fabric texture, detailed stitching, natural folds, accurate face fitting, and physically realistic shadows. Mask details: ${maskStyle}.

Create a premium 3D appearance with realistic skin shaders, detailed hair strands, lifelike eyes, subtle subsurface scattering, realistic lighting, ambient occlusion, ray-traced reflections, and cinematic depth of field.

Lighting and background: ${lightingStyle}, ${backgroundStyle}, and professional 3D rendering quality.

Camera and composition: Vertical ${aspectRatio} aspect ratio, portrait orientation, eye-level camera angle, sharp focus on the eyes, realistic perspective, and a professional composition suitable for social media.

Rendering quality: Ultra-realistic 3D render, 4K UHD, high-detail textures, physically based rendering (PBR), Unreal Engine 5 quality, cinematic color grading, crisp details, photorealistic finish.

Negative prompt: Cartoon, anime, plastic skin, fake face, identity changes, distorted eyes, deformed hands, extra fingers, blurry image, low resolution, excessive smoothing, incorrect mask placement, oversaturated colors, watermark, unwanted text.${customPromptAdditions ? ` Extra director note: ${customPromptAdditions}` : ''}

Final output: A stunning, realistic 3D cinematic portrait with a premium black mask, natural facial identity, dramatic lighting, and professional 4K quality in ${aspectRatio} format.`;

      const parts: any[] = [
        {
          inlineData: {
            mimeType: imageMime,
            data: base64Data
          }
        },
        {
          text: promptText
        }
      ];

      const validAspect = (aspectRatio === "3:4" || aspectRatio === "1:1" || aspectRatio === "16:9") ? aspectRatio : "9:16";

      const imageResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: validAspect
          }
        }
      });

      let finalBase64 = "";
      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          finalBase64 = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!finalBase64) {
        return res.status(502).json({
          success: false,
          error: "The model did not return image data. Please retry."
        });
      }

      const cinematicSpecs = {
        renderEngine: "Unreal Engine 5 PBR / Lumen Global Illumination",
        cameraSetup: "85mm f/1.4 Cine Prime, Eye-Level, 9:16 Vertical",
        shutterSpeed: "1/200s, ISO 100, Master 4K UHD",
        shaders: "Subsurface Scattering (Skin), Ray-Traced Reflections (Eyes), Ambient Occlusion",
        maskCraft: maskStyle,
        lighting: lightingStyle,
        background: backgroundStyle,
        generatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        portraitImage: finalBase64,
        promptUsed: promptText,
        specs: cinematicSpecs
      });
    } catch (e: any) {
      console.error("Portrait generation error:", e);
      res.status(500).json({
        success: false,
        error: e.message || "Failed to generate 3D cinematic portrait."
      });
    }
  });

  // API endpoint
  app.post("/api/generate-location", async (req, res) => {
    try {
      const { index, userImageBase64 } = req.body;
      const location = LOCATIONS[index % LOCATIONS.length];
      
      let finalBase64 = "";
      let info = "";

      if (process.env.GEMINI_API_KEY) {
        try {
          let parts: any[] = [{ text: `A bright, vivid, photorealistic travel photo taken directly in front of the ${location}. Extremely detailed background. High quality, stunning. Keep the exact same subjects from the original image—preserving the exact number of people, their faces, body structures, and poses. Only change their outfits to be culturally or weather appropriate for the location, and seamlessly place them in this new environment.` }];
          
          if (userImageBase64) {
            const match = userImageBase64.match(/^data:(image\/[a-zA-Z]*);base64,([^"]*)$/);
            if (match && match.length === 3) {
              parts.unshift({
                inlineData: {
                  mimeType: match[1],
                  data: match[2],
                },
              });
            } else {
              console.log("Failed to parse userImageBase64");
            }
          }

          const imagePromise = ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: { parts },
            config: {
              imageConfig: { aspectRatio: "3:4" }
            },
          });

          const infoPromise = ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: `Provide information about ${location} exactly in this format:
# [Name of Location], [Name of Country] [Country Flag Emoji]
[One short, engaging paragraph about the location as a travel destination]
Do not include any other text or introductory phrases.`,
          });

          const [imageResponse, infoResponse] = await Promise.all([
            imagePromise.catch((e: any) => { console.error("Image GenAI Error:", e); return null; }),
            infoPromise.catch((e: any) => { console.error("Text GenAI Error:", e); return null; })
          ]);
          
          if (imageResponse) {
            let base64EncodeString = "";
            for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData) {
                base64EncodeString = part.inlineData.data;
                break;
              }
            }

            if (base64EncodeString) {
              finalBase64 = `data:image/png;base64,${base64EncodeString}`;
            }
          }

          if (infoResponse) {
            info = infoResponse.text || "";
          }

        } catch (e) {
          console.error("GenAI Error:", e);
        }
      }

      if (!finalBase64) {
        // Fallback: Generate a simple placehold error or dummy color if API fails or quota limited
        finalBase64 = `https://placehold.co/400x500/cccccc/444444.jpeg?text=${encodeURIComponent(location)}`;
      }

      if (!info) {
        info = "Information about " + location + " is currently unavailable.";
      }

      res.json({ success: true, base64: finalBase64, location, info });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false });
    }
  });

  // API endpoint for generating location description
  app.post("/api/location-info", async (req, res) => {
    try {
      const { location } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ info: "Information about " + location + " is not available because the Gemini API key is missing." });
      }
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Provide information about ${location} exactly in this format:
# [Name of Location], [Name of Country] [Country Flag Emoji]
[One short, engaging paragraph about the location as a travel destination]
Do not include any other text or introductory phrases.`,
      });
      res.json({ info: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ info: "Could not load information at this time." });
    }
  });

  // Endpoint to start omni generation
  app.post('/api/generate-video', async (req, res) => {
    try {
      const { imageBase64, prompt } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ success: false, error: "Missing API Key" });
      }

      const match = imageBase64.match(/^data:(image\/[a-zA-Z]*);base64,([^"]*)$/);
      if (!match || match.length !== 3) {
        return res.status(400).json({ success: false, error: "Invalid base64 image" });
      }

      console.log(`Sending request to Gemini Omni...`);

      const interaction = await ai.interactions.create({
        model: 'gemini-omni-1.1-flash',
        input: [
            { type: 'image' as const, data: match[2], mime_type: match[1] },
            { type: 'text', text: prompt || 'A beautiful cinematic panning video' }
        ],
        response_format: { type: 'video', delivery: 'uri' },
        store: true,
        background: false,
        stream: false
      });

      console.log(`Interaction created: ${interaction.id}`);
      
      if (!interaction.output_video || !interaction.output_video.uri) {
        throw new Error('No video URI returned from interaction.');
      }
      
      const fileIdMatch = interaction.output_video.uri.match(/files\/([a-zA-Z0-9_-]+)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;

      res.json({ success: true, interactionId: interaction.id, uri: interaction.output_video.uri, fileId });
    } catch (e: any) {
      console.error('Error generating video:', e);
      res.status(500).json({ success: false, error: e?.body || e.message });
    }
  });

  // Endpoint to poll file status
  app.post('/api/video-status', async (req, res) => {
    try {
      const { fileId } = req.body;
      if (!fileId) return res.status(400).json({ error: "fileId is required" });
      
      const fInfo = await ai.files.get({ name: `files/${fileId}` });
      const state = (fInfo.state as any)?.name || fInfo.state;
      // Map state to the expected 'done' boolean for the frontend
      const done = state === 'ACTIVE' || state === 'FAILED' || state === 'STATE_UNSPECIFIED' ? state === 'ACTIVE' : (state === 'SUCCEEDED' || state === 'FAILED');
      
      // Usually, if it's available for download it's ACTIVE, but we'll return the raw state too
      res.json({ done: state === 'ACTIVE' || state === 'SUCCEEDED', state });
    } catch(e: any) {
      console.error("Video polling error:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  const videoCache = new Map<string, Buffer>();

  app.get('/api/video-download', async (req, res) => {
    try {
      const fileId = req.query.fileId as string;
      if (!fileId) {
        return res.status(400).json({ error: "fileId is required" });
      }

      let buffer = videoCache.get(fileId);
      if (!buffer) {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/files/${fileId}:download?alt=media&key=${apiKey}`;
        const upstream = await fetch(url);
        if (!upstream.ok) {
          return res.status(upstream.status).send(`Failed to fetch video: ${upstream.statusText}`);
        }
        buffer = Buffer.from(await upstream.arrayBuffer());
        if (videoCache.size >= 12) {
          const oldest = videoCache.keys().next().value;
          if (oldest) videoCache.delete(oldest);
        }
        videoCache.set(fileId, buffer);
      }

      const total = buffer.length;
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      const range = req.headers.range;
      if (range) {
        const match = /bytes=(\d*)-(\d*)/.exec(range);
        let start = match && match[1] ? parseInt(match[1], 10) : 0;
        let end = match && match[2] ? parseInt(match[2], 10) : total - 1;
        if (Number.isNaN(start)) start = 0;
        if (Number.isNaN(end) || end >= total) end = total - 1;
        if (start > end || start >= total) {
          res.status(416).setHeader('Content-Range', `bytes */${total}`).end();
          return;
        }
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`);
        res.setHeader('Content-Length', end - start + 1);
        res.end(buffer.subarray(start, end + 1));
      } else {
        res.setHeader('Content-Length', total);
        res.end(buffer);
      }
    } catch(e: any) {
      console.error("Video download error:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
