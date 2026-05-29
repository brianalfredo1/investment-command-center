import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/gemini/client";

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType = "image/jpeg" } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const model = getModel("gemini-1.5-flash");

    const prompt = `You are a financial data extractor. Analyze this screenshot of an investment portfolio app and extract ALL investment positions shown.

Return ONLY a valid JSON array (no markdown, no code fences, no explanation) with this exact structure:
[
  {
    "name": "ticker or short name",
    "sub": "full name or description",
    "category": "Crypto|Stocks|ETF|Trading|Business|Real Estate|Bonds|Other",
    "source": "platform or broker name",
    "initial": <cost basis in USD as a plain number>,
    "current": <current value in USD as a plain number>,
    "status": "Active|Closed|Pending"
  }
]

Rules:
- Convert IDR to USD at 16300 IDR/USD
- Convert any other currency to USD using approximate rates
- If cost basis is unknown or zero use 0
- Include only individual positions, not header rows or totals
- Return [] if no positions are found`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mediaType as string,
          data: image,
        },
      },
      { text: prompt },
    ]);

    const text = result.response.text();
    // Strip markdown code fences if Gemini wraps the JSON
    const clean = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const jsonMatch = clean.match(/\[[\s\S]*\]/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Screenshot import error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
