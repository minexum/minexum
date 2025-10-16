"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-client";

type RFQ = {
  id: string;
  product_id: string;
  quantity: number;
  incoterm: string;
  port: string;
  status: string;
  created_at: string;
  product?: { name: string } | null; // normalized to a single object or null
};

// Normalizes Supabase join which can be object OR array OR null
function normalizeProduct(p: any): { name: string } | null {
  if (!p) return null;
  if (Array.isArray(p)) return p[0] ?? null;
  return p;
}

export default function ImporterDashboard() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<RFQ[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      const { data, error } = await sb
        .from("rfqs")
        .select(
          "id,product_id,quantity,incoterm,port,status,created_at,product:product_id(name)"
        )
        .eq("importer_id", user.id) // only my RFQs
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
        return;
      }

      const normalized = (data ?? []).map((r: any) => ({
        id: r.id,
        product_id: r.product_id,
        quantity: r.quantity,
        incoterm: r.incoterm,
        port: r.port,
        status: r.status,
        created_at: r.created_at,
        product: normalizeProduct(r.product),
      })) as RFQ[];

      setRows(normalized);
    })();
  }, []); // eslint-disable-line

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">My RFQs</h2>
      <div className="grid gap-3">
        {rows.map((r) => (
          <div key={r.id} className="border rounded p-4">
            <div className="font-medium">{r.product?.name ?? r.product_id}</div>
            <div className="text-sm text-gray-500">{r.incoterm} • {r.port}</div>
            <div className="text-sm">Qty: {r.quantity} • Status: {r.status}</div>
            <div className="text-xs text-gray-400">
              Created: {new Date(r.created_at).toLocaleString()}
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-gray-500">No RFQs yet.</div>}
      </div>
    </div>
  );
}
