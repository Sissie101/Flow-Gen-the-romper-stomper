import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Analyze Stream / Chat Transcript with Gemini 3.7 Flash
  app.post("/api/gemini/analyze-stream", async (req, res) => {
    try {
      const { rawText, eventTitle, accountId, currentViewers } = req.body;
      const genAI = getGenAI();

      if (!genAI) {
        // Fallback intelligent heuristic if key is not configured
        const lower = (rawText || "").toLowerCase();
        const fomoKeywords = ["hurry", "fast", "only", "left", "limited", "now", "deal", "discount", "timer", "seconds", "last chance"];
        const matches = fomoKeywords.filter((k) => lower.includes(k)).length;
        const heuristicHype = Math.min(Math.max(matches * 0.15 + 0.1, 0.05), 0.95);

        return res.json({
          hypeScore: parseFloat(heuristicHype.toFixed(2)),
          sentiment: heuristicHype > 0.6 ? "artificial_fomo" : "organic_curiosity",
          botRiskAssessment: heuristicHype > 0.6 ? "Elevated artificial pressure detected in chat keywords" : "Chat volume appears organic with normal engagement variance",
          genuineBuyerSignals: ["Specific product questions asked", "Pricing clarifications requested", "User inquiry on shipping speed"],
          suggestedSoloCreatorTalkTrack: `Hey everyone! Thank you so much for hanging out with me solo today. For those asking about ${eventTitle || "our special drop"}, I'm packaging every order personally!`,
          suggestedEngagementQuestion: "What color/version do you all want to see unboxed next in the live demo?",
          topKeywords: matches > 0 ? fomoKeywords.filter((k) => lower.includes(k)) : ["organic", "community", "live"],
          source: "heuristic_fallback (Configure GEMINI_API_KEY in Secrets for deep AI reasoning)",
        });
      }

      const prompt = `You are an elite live-commerce and livestream fraud analyst helping a solo creator/marketer optimize their stream, detect fake bot hype, and identify genuine buyers.

Analyze this livestream event:
- Event Title: "${eventTitle || "Live Drop"}"
- Host / Account: "${accountId || "Solo Creator"}"
- Concurrent Viewers: ${currentViewers || 100}
- Raw Transcript / Chat Log:
"""
${rawText || "No chat transcript provided"}
"""

Evaluate:
1. Hype Score: Float between 0.0 (calm, authentic, organic) and 1.0 (extreme fake FOMO, high-pressure countdowns, bot-driven urgency).
2. Dominant Sentiment: ('enthusiastic' | 'organic_curiosity' | 'artificial_fomo' | 'skeptical' | 'neutral')
3. Bot Risk Assessment: Concrete findings on whether chat patterns show bot repetition vs authentic human engagement.
4. Genuine Buyer Signals: List 2-4 real buying intent signs detected in the chat.
5. Suggested Solo Creator Talk Track: 2 sentences of high-converting, authentic, warm speech the solo host can say right now to connect with real buyers without sounding pushy.
6. Suggested Engagement Question: 1 engaging icebreaker question the host can ask the chat to boost organic retention.
7. Top Keywords: 3-6 relevant keywords extracted from the transcript.`;

      const response = await genAI.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hypeScore: {
                type: Type.NUMBER,
                description: "Hype score between 0.0 and 1.0 (decimal format)",
              },
              sentiment: {
                type: Type.STRING,
                description: "Sentiment classification",
              },
              botRiskAssessment: {
                type: Type.STRING,
                description: "Analysis of bot patterns vs organic conversation",
              },
              genuineBuyerSignals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key signals indicating real buyer interest",
              },
              suggestedSoloCreatorTalkTrack: {
                type: Type.STRING,
                description: "Warm, authentic talk track for solo creator",
              },
              suggestedEngagementQuestion: {
                type: Type.STRING,
                description: "Icebreaker to engage real viewers",
              },
              topKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Extracted keywords",
              },
            },
            required: [
              "hypeScore",
              "sentiment",
              "botRiskAssessment",
              "genuineBuyerSignals",
              "suggestedSoloCreatorTalkTrack",
              "suggestedEngagementQuestion",
              "topKeywords",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      // Clamp hype score
      if (typeof parsed.hypeScore === "number") {
        parsed.hypeScore = Math.min(Math.max(parsed.hypeScore, 0.0), 1.0);
      } else {
        parsed.hypeScore = 0.25;
      }
      parsed.source = "gemini-3.7-flash";

      return res.json(parsed);
    } catch (err: any) {
      console.error("Gemini stream analysis error:", err);
      return res.status(500).json({
        error: "Failed to analyze stream transcript with Gemini",
        details: err?.message || String(err),
      });
    }
  });

  // 2. Solo Creator Marketing & Buyer Connection Assistant
  app.post("/api/gemini/solo-marketing", async (req, res) => {
    try {
      const {
        channelName,
        category,
        goal,
        productName,
        pricePoint,
        vibe,
        targetSegment,
      } = req.body;
      const genAI = getGenAI();

      if (!genAI) {
        // High-quality deterministic templates for solo creators when API key is pending
        return res.json({
          headline: `Exclusive ${category || "Live"} Community Drop for ${productName || "VIP Members"}`,
          dmFollowUp: `Hey there! Thank you so much for tuning into the stream earlier today. As a solo creator, I hand-pack and inspect every single item myself. I saved a private link for you with the 15% community discount if you still wanted to grab ${productName || "yours"}: [LINK]. Let me know if you have any questions!`,
          liveChatIcebreaker: `Quick question for the chat: What is the #1 feature you look for before deciding to grab something new? Drop it in the chat and I'll show it live!`,
          emailBroadcast: `Subject: A quick personal thank you + your private VIP reserve link\n\nHey friend,\n\nI just wrapped up our live session and wanted to say thank you for being here. Doing all of this solo is a lot of work, but getting to chat with genuine supporters like you makes every minute worth it.\n\nIf you were eyeing the ${productName || "new drop"} during the stream, I set aside a limited batch for subscribers with code SOLOCOMMUNITY for free shipping.\n\nWarmly,\n${channelName || "Your Solo Creator"}`,
          socialHook: `Running a solo brand means zero corporate fluff—just 100% genuine craftsmanship. Here's why our community is loving ${productName || "this drop"} today... 👇`,
          conversionTip: "Focus on your authentic solo story: mention that you personally answer every question and ship every package. Solo authenticity converts 3.4x higher than generic corporate urgency.",
          source: "template_fallback (Configure GEMINI_API_KEY in Secrets for dynamic AI generation)",
        });
      }

      const prompt = `You are a world-class marketing strategist, copywriter, and growth coach specializing in helping SOLO CREATORS, solo e-commerce sellers, and live streamers build genuine connections with subscribers and paying buyers without feeling overwhelmed, lonely, or fake.

Context:
- Brand / Creator: "${channelName || "Solo Creator"}"
- Stream Category: "${category || "E-commerce & Live Drops"}"
- Main Goal: "${goal || "Convert live viewers into repeat buyers and loyal subscribers"}"
- Featured Product / Offer: "${productName || "Handcrafted Signature Collection"}"
- Price Point: "${pricePoint || "$35 - $75"}"
- Desired Vibe: "${vibe || "Warm, authentic, community-first, transparent"}"
- Target Segment: "${targetSegment || "Active Chatters & Verified Subscribers"}"

Generate actionable, high-converting, deeply authentic marketing assets that take the burden off a solo creator:
1. High-Converting Campaign Headline
2. Personalized DM / Chat Follow-Up (friendly, zero spam, high conversion)
3. Live Chat Icebreaker Question (stimulates organic comments & reveals buyer preferences)
4. Email / Community Broadcast Newsletter (warm storytelling + clear CTA)
5. Short-Form Social Hook / Caption (TikTok, X, Instagram, Discord)
6. Solo Marketer Growth Tip (one high-leverage marketing hack for solo sellers)`;

      const response = await genAI.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              dmFollowUp: { type: Type.STRING },
              liveChatIcebreaker: { type: Type.STRING },
              emailBroadcast: { type: Type.STRING },
              socialHook: { type: Type.STRING },
              conversionTip: { type: Type.STRING },
            },
            required: [
              "headline",
              "dmFollowUp",
              "liveChatIcebreaker",
              "emailBroadcast",
              "socialHook",
              "conversionTip",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      parsed.source = "gemini-3.7-flash";
      return res.json(parsed);
    } catch (err: any) {
      console.error("Gemini solo marketing error:", err);
      return res.status(500).json({
        error: "Failed to generate marketing campaign with Gemini",
        details: err?.message || String(err),
      });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
