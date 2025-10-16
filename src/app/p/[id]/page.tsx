// src/app/p/[id]/page.tsx
import { supabaseServer } from "@/lib/supabase-server"; // if you use it
import Link from "next/link";

type RouteParams = { id: string };

export default async function ProductPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params; // 👈 IMPORTANT

  // ... your existing data fetching & JSX
  // const sb = supabaseServer();
  // const { data: product } = await sb.from("products").select("*").eq("id", id).single();
  // return ( ... )
}
