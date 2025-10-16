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
  product?: { name: string } | null;  // normalized
  importer?: { id: string } | null;   // normalized
};

function normalizeOne(obj: any): any | null {
  if (!obj) return null;
  if (Array.isArray(obj)) return obj[0] ?? null;
  return obj;
}

export default function ExporterRFQs() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<RFQ[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      const { data, error } = await sb
        .from("rfqs")
        .select(
          "id,product_id,quantity,incoterm,port,status,created_at,product:product_id(name),importer:importer_id(id)"
        )
        .eq("exporter_id", user.id)
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
        product: normalizeOne(r.product),
        importer: normalizeOne(r.importer),
      })) as RFQ[];

      setRows(normalized);
    })();
  }, []); // eslint-disable-line

  async function setStatus(id: string, status: "accepted" | "rejected") {
    const { error } = await sb.from("rfqs").update({ status }).eq("id", id);
    if (!error) {
      setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } else {
      alert(error.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">RFQ Inbox</h2>
      <div className="grid gap-3">
        {rows.map((r) => (
          <div key={r.id} className="border rounded p-4">
            <div className="font-medium">{r.product?.name ?? r.product_id}</div>
            <div className="text-sm text-gray-500">{r.incoterm} • {r.port}</div>
            <div className="text-sm">Qty: {r.quantity} • Status: {r.status}</div>
            <div className="text-xs text-gray-400">
              Created: {new Date(r.created_at).toLocaleString()}
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setStatus(r.id, "accepted")} className="px-3 py-1.5 rounded bg-green-600 text-white">Accept</button>
              <button onClick={() => setStatus(r.id, "rejected")} className="px-3 py-1.5 rounded bg-red-600 text-white">Reject</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-gray-500">No RFQs yet.</div>}
      </div>
    </div>
  );
}
