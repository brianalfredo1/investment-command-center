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

    const prompt = `You are a blunt investment advisor. Be extremely concise.

Portfolio data:
- Invested: $${totalInvested.toFixed(2)} | Current: $${totalCurrent.toFixed(2)} | ROI: ${roi}%
${summary.map((p: { asset: string; cost_basis: string; current_value: string; roi_pct: string }) => `- ${p.asset}: cost ${p.cost_basis} → ${p.current_value} (${p.roi_pct})`).join("\n")}

Return HTML only. No paragraphs. No explanations. Just short bullets.
Each bullet must be under 12 words.

Use exactly this structure:

<h3>⚠️ Hurting you</h3>
<ul>
<li>...</li> (max 3 bullets)
</ul>

<h3>✅ Working</h3>
<ul>
<li>...</li> (max 2 bullets)
</ul>

<h3>🎯 Do this now</h3>
<ul>
<li>...</li> (exactly 3 actions)
</ul>

<h3>📊 Target allocation</h3>
<ul>
<li>BTC: X%</li>
<li>ETH: X%</li>
(one line per asset class)
</ul>

No intro. No conclusion. No paragraphs. Bullets only. Asset names only, no full names. Do not wrap in markdown code fences.`;

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
