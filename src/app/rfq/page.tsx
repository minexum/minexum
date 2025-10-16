"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";

type Product = {
  id: string;
  name: string;
  price_min: number;
  price_max: number;
  moq_units: number;
  company_id: string;
};

export default function RFQPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const productId = sp.get("product") || "";
  const sb = supabaseBrowser();

  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [exporterId, setExporterId] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (user?.id) setUserId(user.id);

      if (productId) {
        const { data: p } = await sb
          .from("products")
          .select("id,name,price_min,price_max,moq_units,company_id")
          .eq("id", productId)
          .single();
        if (p) {
          setProduct(p as Product);
          // look up exporter (owner of the product's company)
          const { data: co } = await sb
            .from("companies")
            .select("owner")
            .eq("id", p.company_id)
            .single();
          if (co?.owner) setExporterId(co.owner as string);
        }
      }
    })();
  }, [productId]); // eslint-disable-line

  const disabled = useMemo(() => !userId || !productId || !exporterId, [userId, productId, exporterId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) { alert("Please sign in first."); return; }
    if (!productId || !exporterId) { alert("Missing product/exporter."); return; }
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const payload = {
      importer_id: userId,
      exporter_id: exporterId,           // <— important: exporter can now see RFQ
      product_id: productId,
      quantity: Number(f.get("quantity")),
      incoterm: String(f.get("incoterm")),
      port: String(f.get("port")),
      status: "pending",
      messages: []
    };

    const { error } = await sb.from("rfqs").insert(payload);
    setLoading(false);

    if (error) {
      alert("RFQ error: " + error.message);
    } else {
      alert("Request sent! The exporter will be notified.");
      router.push("/dashboard/importer");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Request Quote</h1>

      {product && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-gray-500">
            ${Number(product.price_min).toFixed(2)} – ${Number(product.price_max).toFixed(2)} FOB • MOQ {product.moq_units}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-3">
        <input name="quantity" type="number" step="1" placeholder="Quantity" className="border p-2 rounded" required />
        <select name="incoterm" className="border p-2 rounded">
          <option value="FOB">FOB</option>
          <option value="EXW">EXW</option>
          <option value="CIF">CIF</option>
        </select>
        <input name="port" placeholder="Destination Port" className="border p-2 rounded" required />

        <button disabled={loading || disabled} className="px-4 py-2 rounded bg-yellow-400 text-black disabled:opacity-60">
          {loading ? "Sending…" : "Send RFQ"}
        </button>

        {!userId && (
          <div className="text-sm text-red-600">
            You must be signed in to send an RFQ. <a className="underline" href="/login?role=importer">Sign in</a>
          </div>
        )}
      </form>
    </div>
  );
}
