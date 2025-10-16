import { supabaseDirect } from "@/lib/supabase-direct";
import Link from "next/link";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const sb = supabaseDirect();
  const { data: p } = await sb.from("products").select("*").eq("id", params.id).single();

  if (!p) return <div className="max-w-5xl mx-auto p-6">Product not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-6">
      <img src={p.images?.[0] || "/placeholder.png"} className="rounded border bg-gray-50" />
      <div>
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        <div className="mt-2 font-medium">
          ${Number(p.price_min).toFixed(2)} – ${Number(p.price_max).toFixed(2)} FOB
        </div>
        <div>MOQ: {p.moq_units} units</div>
        <div className="mt-1 text-gray-500">{p.origin || "Turkey"}</div>

        <div className="mt-4">{p.description || ""}</div>

        <div className="mt-6 flex gap-2">
          <Link href={`/rfq?product=${p.id}`} className="px-4 py-2 rounded bg-yellow-400 text-black">
            Request Quote
          </Link>
          <Link href="/" className="px-4 py-2 rounded border">Back</Link>
        </div>
      </div>
    </div>
  );
}
