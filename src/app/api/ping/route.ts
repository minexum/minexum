import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(url!, key!);
  const { data, error } = await supabase.from("products").select("id").limit(1);

  return NextResponse.json({
    haveUrl: Boolean(url),
    haveKey: Boolean(key),
    urlStarts: url?.slice(0, 30),
    keyStarts: key?.slice(0, 15),
    ok: !error,
    error: error?.message ?? null,
  });
}
