// src/app/p/[id]/page.tsx
import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";

type RouteParams = { id: string };

type Product = {
  id: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  moq?: number | null;
  moq_units?: string | null;
  location?: string | null;
  certifications?: string[] | null;
  company?: { name?: string | null } | null;
};

export default async function ProductPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params; // 👈 Next 15 requires awaiting params

  const sb = supabaseServer();

  // Adjust the select fields to match your schema if needed
  const { data: product, error } = await sb
    .from("products")
    .select(
      `
      id, name, brand, category, price_min, price_max,
      moq, moq_units, location, certifications,
      company:companies(name)
    `
    )
    .eq("id", id)
    .single<Product>();

  if (error) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Error</h1>
        <p className="mt-2 text-red-600">{error.message}</p>
        <p className="mt-6">
          <Link href="/" className="underline">
            ← Back to home
          </Link>
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-6">
          <Link href="/" className="underline">
            ← Back to home
          </Link>
        </p>
      </main>
    );
  }

  const {
    name,
    brand,
    category,
    price_min,
    price_max,
    moq,
    moq_units,
    location,
    certifications,
    company,
  } = product;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-start gap-6">
        {/* Placeholder image (you can replace with real images later) */}
        <div className="w-64 h-64 bg-yellow-100 flex items-center justify-center rounded">
          <span className="text-sm text-gray-500">MINEXUM</span>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-semibold">{name}</h1>
          <p className="text-gray-600 mt-1">
            {brand ? `${brand} • ` : ""}
            {category ?? "Uncategorized"}
          </p>

          <div className="mt-4 space-y-1">
            <p>
              <strong>Price:</strong>{" "}
              {price_min != null && price_max != null
                ? `$${price_min} – $${price_max} FOB`
                : "Ask for price"}
            </p>
            <p>
              <strong>MOQ:</strong>{" "}
              {moq != null ? `${moq} ${moq_units ?? "units"}` : "—"}
            </p>
            <p>
              <strong>Location:</strong> {location ?? "—"}
            </p>
            <p>
              <strong>Company:</strong> {company?.name ?? "—"}
            </p>
          </div>

          {Array.isArray(certifications) && certifications.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {certifications.map((c) => (
                <span
                  key={c}
                  className="text-xs bg-gray-100 border rounded px-2 py-1"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              href={`/login?intent=rfq&pid=${product.id}`}
              className="bg-yellow-400 text-black px-4 py-2 rounded font-medium"
            >
              Request Quote
            </Link>
            <Link href="/" className="underline">
              Back
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
