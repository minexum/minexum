import Link from "next/link";
import { supabaseDirect } from "@/lib/supabase-direct";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function price(min: number, max: number) {
  return `$${min.toFixed(2)} – $${max.toFixed(2)} FOB`;
}

export default async function Home() {
  const sb = supabaseDirect();

  // join to companies to show company name; if it errors, remove the select for companies
  const { data: products, error } = await sb
    .from("products")
    .select("id,name,brand,price_min,price_max,moq_units,certifications,images,origin,company_id")
    .limit(24);

  if (error) {
    console.error(error.message);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HERO */}
      <section className="text-center space-y-3 mb-8">
        <h1 className="text-4xl font-bold">Global B2B Export Marketplace</h1>
        <p className="text-muted-foreground">
          Browse verified Turkish exporters. Request quotes. Import with confidence.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/login?role=exporter"><Button className="bg-yellow-400 text-black">Join as Exporter</Button></Link>
          <Link href="/login?role=importer"><Button variant="outline">Join as Importer</Button></Link>
          <Link href="/login?role=logistics"><Button variant="outline">Join as Logistics Firm</Button></Link>
        </div>
      </section>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(products ?? []).map((p: any) => (
          <Card key={p.id} className="overflow-hidden">
            <img
              src={p.images?.[0] || "/placeholder.svg"}
              alt={p.name}
              className="h-48 w-full object-cover"
            />
            <CardContent className="space-y-2 p-4">
              <Link href={`/p/${p.id}`} className="font-semibold hover:underline">
                {p.name}
              </Link>

              <div className="text-sm text-muted-foreground">
                {p.origin || "Turkey"}
              </div>

              <div className="text-sm">
                {price(p.price_min, p.price_max)} • MOQ {p.moq_units} units
              </div>

              <div className="flex gap-1 flex-wrap">
                {(p.certifications ?? []).slice(0, 3).map((c: string) => (
                  <Badge key={c} variant="secondary">
                    {c}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Link href={`/p/${p.id}`}>
                  <Button variant="outline">Details</Button>
                </Link>
                <Link href={`/login?intent=rfq&pid=${p.id}`}>
                  <Button className="bg-yellow-400 text-black">Request Quote</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
