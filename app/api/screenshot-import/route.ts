import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType = "image/jpeg" } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const prompt = `You are a financial data extractor. Analyze this screenshot of an investment portfolio app and extract ALL investment positions shown.

Return ONLY a valid JSON array (no markdown, no explanation) with this exact structure:
[
  {
    "name": "ticker or short name",
    "sub": "full name or description",
    "category": "Crypto|Stocks|ETF|Trading|Business|Real Estate|Bonds|Other",
    "source": "platform or broker name",
    "initial": <cost basis in USD as number>,
    "current": <current value in USD as number>,
    "status": "Active|Closed|Pending"
  }
]

Rules:
- Convert IDR to USD at 16300 IDR/USD
- Convert any other currency to USD
- If cost basis is unknown use 0
- Do not include headers or totals rows, only individual positions
- Return [] if no positions found`;

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: image,
            },
          },
          { type: "text", text: prompt },
        ],
      }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Screenshot import error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
