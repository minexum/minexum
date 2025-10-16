import { supabaseBrowser } from "@/lib/supabase-client";

export async function uploadProductImage(file: File) {
  const sb = supabaseBrowser();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Please sign in");

  const ext = file.name.split(".").pop() || "png";
  const key = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await sb.storage.from("product-images").upload(key, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data: pub } = sb.storage.from("product-images").getPublicUrl(key);
  return pub.publicUrl; // use this URL in products.images[]
}
