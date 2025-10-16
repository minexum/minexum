"use client";

import { useState } from "react";
import { uploadProductImage } from "@/lib/upload";
import { supabaseBrowser } from "@/lib/supabase-client";

export default function ProductForm() {
  const sb = supabaseBrowser();
  const [imgUrl, setImgUrl] = useState<string>("");

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const url = await uploadProductImage(f);
      setImgUrl(url);
      alert("Image uploaded!");
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // ...collect existing fields...
    const payload: any = {
      company_id: fd.get("company_id"),
      name: String(fd.get("name")),
      brand: String(fd.get("brand")),
      category: String(fd.get("category")),
      price_min: Number(fd.get("price_min")),
      price_max: Number(fd.get("price_max")),
      moq_units: Number(fd.get("moq_units")),
      origin: String(fd.get("origin")),
      certifications: String(fd.get("certs") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      images: imgUrl ? [imgUrl] : [],   // <— attach uploaded image
      description: String(fd.get("description") || ""),
    };

    const { error } = await sb.from("products").insert(payload);
    if (error) return alert(error.message);
    alert("Product added!");
    e.currentTarget.reset();
    setImgUrl("");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      {/* existing inputs... */}
      <input type="file" accept="image/*" onChange={onFileChange} />
      {imgUrl && <img src={imgUrl} alt="preview" className="h-24 rounded border" />}

      {/* existing submit button */}
      <button className="px-4 py-2 rounded bg-yellow-400 text-black">Save</button>
    </form>
  );
}
