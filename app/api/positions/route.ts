import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const userId = req.nextUrl.searchParams.get("user_id") || "demo";
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("user_id", userId)
      .order("current_value", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const { data, error } = await supabase.from("positions").insert([body]).select();
    if (error) throw error;
    return NextResponse.json(data?.[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { id, ...updates } = await req.json();
    const { data, error } = await supabase.from("positions").update(updates).eq("id", id).select();
    if (error) throw error;
    return NextResponse.json(data?.[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const { error } = await supabase.from("positions").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
