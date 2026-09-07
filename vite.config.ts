import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function googleReviewApiPlugin(): Plugin {
  return {
    name: 'google-review-api',
    configureServer(server) {
      // 1. Google Review Destination URL Endpoint
      server.middlewares.use('/api/google-review-url', (req, res) => {
        const parsedUrl = new URL(req.url || '', 'http://localhost');
        const restaurantId = parsedUrl.searchParams.get('restaurantId') || 'mirch-masala-01';

        const reviewUrl =
          process.env.GOOGLE_REVIEW_URL ||
          'https://www.google.com/maps/search/?api=1&query=The+New+Mirch+Masala+Gunupur+Odisha';

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(
          JSON.stringify({
            success: true,
            restaurantId,
            googleReviewUrl: reviewUrl,
            isConfigured: true,
            source: 'server_api',
            timestamp: new Date().toISOString(),
          })
        );
      });

      // 2. Gemini AI Review Suggestion Endpoint
      server.middlewares.use('/api/gemini/suggest-review', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          try {
            const data = JSON.parse(body || '{}');
            const rating = Number(data.rating) || 5;
            const topics = Array.isArray(data.topics) ? data.topics : [];
            const currentFeedback = String(data.currentFeedback || '').trim();
            const customerName = String(data.customerName || '').trim();
            const tone = String(data.tone || 'foodie');

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              throw new Error('GEMINI_API_KEY is not configured on server');
            }

            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            let prompt = `Write an authentic, highly realistic customer review for The New Mirch Masala, a popular and beloved restaurant in Gunupur, Odisha.
- Star Rating: ${rating} out of 5 stars
- Highlights: ${topics.length > 0 ? topics.join(', ') : 'Great Taste, Fresh Food'}
- Reviewer: ${customerName || 'Valued Diner'}
- Preferred tone: ${tone}`;

            if (currentFeedback) {
              prompt += `\nThe customer already drafted this initial text: "${currentFeedback}". Polish, enhance, and complete this review into a natural, engaging 2 to 3-sentence review.`;
            } else {
              prompt += `\nWrite a 2 to 3 sentence natural, positive customer review specifically mentioning popular specialties like Chicken Biryani, Paneer Butter Masala, Tandoori Chicken, or fresh Naan, with friendly service.`;
            }

            prompt += `\nOutput ONLY the review text. Do NOT enclose in quotation marks or write headings.`;

            const geminiResponse = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: {
                systemInstruction:
                  'You are a friendly AI assistant helping diners at The New Mirch Masala in Gunupur, Odisha express their feedback authentically and concisely for Google Reviews.',
                temperature: 0.7,
              },
            });

            const generatedText = (geminiResponse.text || '').trim().replace(/^["']|["']$/g, '');

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                reviewText: generatedText,
                source: 'gemini',
              })
            );
          } catch (err: any) {
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: false,
                error: err.message || 'Failed to generate review',
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), googleReviewApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
