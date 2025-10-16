import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import DeleteProductButton from "@/components/delete-product-button";

export default async function ExporterDashboard() {
  const sb = supabaseServer();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-2">Your Products</h2>
        <p className="text-gray-600">Please sign in as an exporter.</p>
      </div>
    );
  }

  // find my company_id(s)
  const { data: companies } = await sb
    .from("companies")
    .select("id")
    .eq("owner", user.id);

  const companyIds = (companies ?? []).map((c) => c.id);
  let products: any[] = [];

  if (companyIds.length > 0) {
    const { data } = await sb
      .from("products")
      .select("id,name,price_min,price_max,moq_units,images")
      .in("company_id", companyIds)
      .order("created_at", { ascending: false });
    products = data ?? [];
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Your Products</h2>
        <div className="flex gap-2">
          <Link href="/dashboard/exporter/rfqs" className="px-3 py-2 rounded border">
            RFQ Inbox
          </Link>
          <Link href="/dashboard/exporter/new" className="px-3 py-2 rounded bg-yellow-400 text-black">
            + Add Product
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border rounded p-4 flex items-start gap-3">
            <img
              src={p.images?.[0] || "/placeholder.svg"}
              alt={p.name}
              className="w-24 h-24 object-cover rounded border"
            />
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">
                ${Number(p.price_min).toFixed(2)} – ${Number(p.price_max).toFixed(2)} • MOQ {p.moq_units}
              </div>

              <div className="mt-2 flex gap-2">
                <Link
                  href={`/dashboard/exporter/edit/${p.id}`}
                  className="px-3 py-1.5 rounded border"
                >
                  Edit
                </Link>
                <DeleteProductButton id={p.id} />
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-gray-600">No products yet. Click “Add Product”.</div>
        )}
      </div>
    </div>
  );
}
