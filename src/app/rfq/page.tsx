// src/app/rfq/[id]/page.tsx
type RouteParams = { id: string };

export default async function RFQPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params; // 👈

  // ...your existing code
}
