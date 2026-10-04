import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & AI Provider Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    aiProvider: 'Google Gemini 2.5/3.8 Flash (Free Tier)',
    hasApiKey: Boolean(apiKey),
    capabilities: [
      'Multimodal Scene & Landmark Recognition',
      'EXIF & Visual Timestamp Harmonization',
      'Travel DNA Category Breakdown',
      'Core Memory Emotional Narrative Generation',
      'Personalized Itinerary Planner',
    ],
  });
});

// AI Analyze Photo / Location endpoint
app.post('/api/analyze-photos', async (req, res) => {
  try {
    const { photoDescriptions, tripTitle, existingLocations } = req.body;

    if (!ai) {
      // Fallback response with smart heuristics
      return res.json({
        summary: `Analyzed ${photoDescriptions?.length || 0} moments during ${tripTitle || 'the trip'}.`,
        travelDna: {
          food: 50,
          sightseeing: 20,
          groupPhoto: 10,
          selfie: 10,
          streetViews: 10,
        },
        highlights: ['Tsukiji Market', 'Senso-ji Shrine', 'Shibuya Sky'],
        source: 'heuristic_fallback',
      });
    }

    const prompt = `You are a minimalist travel curator.
Analyze photos and locations from: "${tripTitle || 'Travel Journey'}".
Photo metadata: ${JSON.stringify(photoDescriptions || [], null, 2)}
Checkpoints: ${JSON.stringify(existingLocations || [], null, 2)}

Provide JSON:
1. "locationSummaries": object mapping location name to a concise 1-sentence sensory note (max 15 words).
2. "travelDna": { "food": number, "sightseeing": number, "groupPhoto": number, "selfie": number, "streetViews": number } (sum to 100).
3. "coreMemory": {
   - "title": e.g. "The best meal of the trip"
   - "locationName": string
   - "date": string
   - "badge": e.g. "Longest food stop"
   - "duration": "2h 17m"
   - "photoCount": number
   - "narrative": "You stayed here for 2h 17m, You took 23 photos, you revisited this place later, It was one of the most unique places on your trip."
}
4. "tripVibe": 3-word tagline.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ ...parsed, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error analyzing photos with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze photos',
      fallbackDna: {
        food: 50,
        sightseeing: 20,
        groupPhoto: 10,
        selfie: 10,
        streetViews: 10,
      },
    });
  }
});

// AI Personalized Travel Planner
app.post('/api/plan-trip', async (req, res) => {
  try {
    const {
      destination,
      durationDays,
      arrivalTime,
      departureTime,
      startPoint,
      endPoint,
      travelDna,
      previousTripsSummary,
    } = req.body;

    if (!ai) {
      // High quality heuristic planner fallback if API key not injected
      return res.json({
        planTitle: `Personalized ${destination} Blueprint`,
        styleRationale: `Custom-tailored around your Travel DNA profile (${travelDna?.food || 50}% Food, ${travelDna?.sightseeing || 20}% Sightseeing). We prioritized morning markets, artisanal dining alleys, and scenic viewpoints matching your Tsukiji and Kyoto pacing.`,
        days: [
          {
            dayNumber: 1,
            date: 'Day 1',
            focus: 'Arrival, Culinary Immersion & Evening Horizon',
            items: [
              {
                time: arrivalTime || '10:00 AM',
                title: `Arrival at ${startPoint || 'Central Station / Hotel'}`,
                description: 'Check in, drop luggage, and transition into your walking route.',
                category: 'arrival',
                duration: '45m',
              },
              {
                time: '11:30 AM',
                title: `Signature Food Discovery: Local Morning Alley`,
                description: 'Bespoke tasting stop echoing your love for Tsukiji-style fresh market food.',
                category: 'food',
                duration: '1h 45m',
              },
              {
                time: '02:30 PM',
                title: 'Historic District & Cultural Promenade',
                description: 'Unrushed architectural wandering through heritage streets.',
                category: 'sightseeing',
                duration: '2h 15m',
              },
              {
                time: '06:30 PM',
                title: 'Sunset Rooftop & Chef-Curated Dinner',
                description: 'Golden hour city views followed by an unhurried multi-course meal.',
                category: 'food',
                duration: '2h 30m',
              },
            ],
          },
          {
            dayNumber: 2,
            date: 'Day 2',
            focus: 'Artisan Quarters & Scenic Departure',
            items: [
              {
                time: '09:00 AM',
                title: 'Morning Specialty Roast & Street Architecture',
                description: 'Quiet backstreets exploration before midday crowds.',
                category: 'streetViews',
                duration: '1h 30m',
              },
              {
                time: '11:00 AM',
                title: 'Hidden Artisan Workshop & Landmark Checkpoint',
                description: 'Contemplative visit matching your highest-rated past memories.',
                category: 'sightseeing',
                duration: '2h 00m',
              },
              {
                time: '01:30 PM',
                title: 'Farewell Tasting Lunch',
                description: 'Final memorable culinary chapter before heading out.',
                category: 'food',
                duration: '1h 30m',
              },
              {
                time: departureTime || '04:30 PM',
                title: `Transfer to ${endPoint || 'Departure Terminal'}`,
                description: 'Smooth departure with memories archived into your journal.',
                category: 'departure',
                duration: '1h',
              },
            ],
          },
        ],
        source: 'heuristic_planner',
      });
    }

    const prompt = `You are a high-end minimalist travel curator.
The user wants a personalized trip planner based on their travel history and Travel DNA.

Request details:
- Destination: ${destination}
- Duration: ${durationDays} days
- Arrival time at destination: ${arrivalTime}
- Departure time from destination: ${departureTime}
- Starting point: ${startPoint}
- Ending point: ${endPoint}

User's Travel DNA profile:
- Food: ${travelDna?.food || 50}%
- Sightseeing: ${travelDna?.sightseeing || 20}%
- Group photo: ${travelDna?.groupPhoto || 10}%
- Selfie: ${travelDna?.selfie || 10}%
- Street views: ${travelDna?.streetViews || 10}%

User's past trip summaries and checkpoints history:
${JSON.stringify(previousTripsSummary || 'Previous trip included Tokyo: Tsukiji Market (longest stay 2h 17m), Senso-ji, Shibuya Sky, with strong affinity for food markets, peaceful mornings, and scenic street photography.', null, 2)}

Create a personalized day-by-day itinerary strictly formatted in JSON.
The plan MUST reflect their DNA:
- If food is highest (e.g. 50%), dedicate generous 1.5h - 2.5h windows to top authentic eateries, morning street markets, and tasting alleys.
- Seamlessly connect routes in order from arrival at "${startPoint}" through checkpoints to departure at "${endPoint}".
- Account for realistic transit and stay durations.
- Keep descriptions concise (under 12 words per stop), punchy, and non-dense.

Return JSON schema:
{
  "planTitle": string,
  "styleRationale": string (explain why this matches their specific Travel DNA and past favorites),
  "days": [
    {
      "dayNumber": number,
      "date": string,
      "focus": string,
      "items": [
        {
          "time": string,
          "title": string,
          "description": string,
          "category": "food" | "sightseeing" | "streetViews" | "groupPhoto" | "selfie" | "arrival" | "departure",
          "duration": string
        }
      ]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const itinerary = JSON.parse(response.text || '{}');
    return res.json({ ...itinerary, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error planning trip with Gemini:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate itinerary' });
  }
});

// Serve frontend: in dev with Vite middlewares, in production with static build
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
