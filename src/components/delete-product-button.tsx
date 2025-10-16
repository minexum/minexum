"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id }: { id: string }) {
  const sb = supabaseBrowser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    const { error } = await sb.from("products").delete().eq("id", id);
    setLoading(false);
    if (error) alert(error.message);
    else router.refresh();
  }

  return (
    <button
      onClick={onDelete}
      disabled={loading}
      className={`px-3 py-1.5 rounded border ${
        loading ? "opacity-50 cursor-wait" : "text-red-600"
      }`}
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
