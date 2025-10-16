// src/app/rfq/[id]/page.tsx
import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";

type RouteParams = { id: string };

type RFQ = {
  id: string;
  product_id: string;
  quantity?: number | null;
  incoterm?: string | null;
  port?: string | null;
  status?: string | null;
  created_at?: string | null;
  product?: {
    name?: string | null;
    price_min?: number | null;
    price_max?: number | null;
    moq_units?: string | null;
  } | null;
  importer?: {
    name?: string | null;
  } | null;
};

export default async function RFQPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params; // 👈 Next 15 requires awaiting params

  const sb = supabaseServer();

  const { data: rfq, error } = await sb
    .from("rfqs")
    .select(
      `
      id, product_id, quantity, incoterm, port, status, created_at,
      product:products(name, price_min, price_max, moq_units),
      importer:profiles(name)
    `
    )
    .eq("id", id)
    .single<RFQ>();

  if (error) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Error</h1>
        <p className="mt-2 text-red-600">{error.message}</p>
        <p className="mt-6">
          <Link href="/dashboard/exporter" className="underline">
            ← Back
          </Link>
        </p>
      </main>
    );
  }

  if (!rfq) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">RFQ not found</h1>
        <p className="mt-6">
          <Link href="/dashboard/exporter" className="underline">
            ← Back
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">RFQ #{rfq.id}</h1>

      <div className="mt-4 space-y-2">
        <p>
          <strong>Product:</strong> {rfq.product?.name ?? "—"}
        </p>
        <p>
          <strong>Quantity:</strong> {rfq.quantity ?? "—"}{" "}
          {rfq.product?.moq_units ?? ""}
        </p>
        <p>
          <strong>Incoterm:</strong> {rfq.incoterm ?? "—"}
        </p>
        <p>
          <strong>Port:</strong> {rfq.port ?? "—"}
        </p>
        <p>
          <strong>Status:</strong> {rfq.status ?? "—"}
        </p>
        <p>
          <strong>Created:</strong>{" "}
          {rfq.created_at ? new Date(rfq.created_at).toLocaleString() : "—"}
        </p>
        <p>
          <strong>Importer:</strong> {rfq.importer?.name ?? "—"}
        </p>
      </div>

      <div className="mt-6">
        <Link href="/dashboard/exporter" className="underline">
          ← Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
