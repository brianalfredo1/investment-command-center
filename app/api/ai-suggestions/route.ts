import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/gemini/client";

export async function POST(req: NextRequest) {
  try {
    const { portfolio } = await req.json();
    if (!portfolio?.length) return NextResponse.json({ error: "Empty portfolio" }, { status: 400 });

    const totalInvested = portfolio.reduce((s: number, p: { cost_basis: number }) => s + Number(p.cost_basis), 0);
    const totalCurrent = portfolio.reduce((s: number, p: { current_value: number }) => s + Number(p.current_value), 0);
    const roi = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested * 100).toFixed(2) : "0";

    const summary = portfolio.map((p: {
      name: string; subtitle: string; category: string; platform: string;
      cost_basis: number; current_value: number; status: string;
    }) => ({
      asset: `${p.name} (${p.subtitle})`,
      category: p.category,
      platform: p.platform,
      cost_basis: `$${Number(p.cost_basis).toFixed(2)}`,
      current_value: `$${Number(p.current_value).toFixed(2)}`,
      roi_pct: Number(p.cost_basis) > 0
        ? `${(((Number(p.current_value) - Number(p.cost_basis)) / Number(p.cost_basis)) * 100).toFixed(1)}%`
        : "N/A",
      status: p.status,
    }));

    const prompt = `You are a sharp investment advisor. Analyze this portfolio and respond in SHORT, DIRECT bullets only. No long explanations. No paragraphs. Just the point.

Portfolio Summary:
- Total Invested: $${totalInvested.toFixed(2)}
- Current Value: $${totalCurrent.toFixed(2)}
- Overall ROI: ${roi}%
- Positions: ${portfolio.length}

Positions:
${JSON.stringify(summary, null, 2)}

Format your response as HTML with these exact 4 sections:

<h3>⚠️ What's hurting you</h3>
<ul> 3-4 bullet points max, each under 15 words </ul>

<h3>✅ What's working</h3>
<ul> 2-3 bullet points max, each under 15 words </ul>

<h3>🎯 What to do next</h3>
<ul> 3 specific actions, each under 15 words </ul>

<h3>📊 Target allocation</h3>
<ul> list each asset class with a % target, one line each </ul>

Be brutal and specific. Use asset names. No fluff. No intros. No conclusions. Do not wrap the response in markdown code fences.`;

    const model = getModel("gemini-2.5-flash");
    const result = await model.generateContent(prompt);
    const html = result.response.text()
      .replace(/```html\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    return NextResponse.json({ html });
  } catch (e) {
    console.error("AI suggestions error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
