import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
      roi_pct: p.cost_basis > 0
        ? `${(((p.current_value - p.cost_basis) / p.cost_basis) * 100).toFixed(1)}%`
        : "N/A",
      status: p.status,
    }));

    const prompt = `You are a senior portfolio analyst. Analyze this investment portfolio and provide actionable insights.

Portfolio Summary:
- Total Invested: $${totalInvested.toFixed(2)}
- Current Value: $${totalCurrent.toFixed(2)}
- Overall ROI: ${roi}%
- Positions: ${portfolio.length}

Positions:
${JSON.stringify(summary, null, 2)}

Respond with HTML (no <html>/<body> tags, just inner content) covering:
1. <h3>Portfolio Health Summary</h3> — overall performance assessment
2. <h3>Concentration Risks</h3> — over-weighted positions or categories
3. <h3>Diversification Gaps</h3> — missing asset classes or sectors
4. <h3>Rebalancing Suggestions</h3> — specific % targets for each category
5. <h3>Top 3 Next Steps</h3> — actionable bullet points

Use <p>, <ul>, <li>, <strong>, <span class="green"> for positive metrics and <span class="red"> for negative metrics.
Be specific, data-driven, and concise.`;

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const html = response.content[0].type === "text" ? response.content[0].text : "<p>No analysis available</p>";
    return NextResponse.json({ html });
  } catch (e) {
    console.error("AI suggestions error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
