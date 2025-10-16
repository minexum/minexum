"use client";

import { supabaseBrowser } from "@/lib/supabase-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const sb = supabaseBrowser();
  const router = useRouter();
  const sp = useSearchParams();

  // read ?role=importer|exporter|logistics from URL if present (e.g. Join buttons)
  const roleFromQuery = (sp.get("role") as "importer" | "exporter" | "logistics" | null) ?? null;
  const [role, setRole] = useState<"importer" | "exporter" | "logistics">(roleFromQuery || "importer");
  const [loading, setLoading] = useState(false);

  function destForRole(r: "importer" | "exporter" | "logistics") {
    if (r === "exporter") return "/dashboard/exporter";
    if (r === "importer") return "/dashboard/importer";
    return "/"; // change when you add logistics dashboard
  }

  async function upsertProfile(userId: string) {
    await sb.from("profiles").upsert({ id: userId, roles: [role] as any }, { onConflict: "id" });
  }

  async function ensureExporterCompany(userId: string, companyName: string) {
    if (role !== "exporter") return;
    const { data: existing } = await sb
      .from("companies")
      .select("id")
      .eq("owner", userId)
      .limit(1);
    if (!existing || existing.length === 0) {
      await sb.from("companies").insert({
        owner: userId,
        type: "exporter",
        name: companyName || "My Company",
        country: "Turkey",
        city: "Istanbul",
        verified: false,
      });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "");
    const company = String(f.get("company") || "");
    const email = String(f.get("email") || "");
    const password = String(f.get("password") || "");

    const { data: signUp, error: signUpErr } = await sb.auth.signUp({
      email,
      password,
      options: { data: { name, company, role } },
    });

    // If “already registered”, sign in instead
    if (signUpErr) {
      if (/already/.test(signUpErr.message.toLowerCase())) {
        const { data: signIn, error: signInErr } = await sb.auth.signInWithPassword({ email, password });
        if (signInErr) { setLoading(false); alert("Sign in error: " + signInErr.message); return; }
        await upsertProfile(signIn.user!.id);
        await ensureExporterCompany(signIn.user!.id, company);
        setLoading(false);
        router.push(destForRole(roleFromQuery || role));
        return;
      }
      setLoading(false);
      alert("Sign up error: " + signUpErr.message);
      return;
    }

    if (signUp.user) {
      await upsertProfile(signUp.user.id);
      await ensureExporterCompany(signUp.user.id, company);
      setLoading(false);
      router.push(destForRole(roleFromQuery || role));
      return;
    }

    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto p-6 grid gap-3">
      {/* if you have tabs for role, call setRole("exporter" | "importer" | "logistics") */}
      <input name="name" placeholder="Your name" className="border p-2 rounded" />
      <input name="company" placeholder="Company (if exporter)" className="border p-2 rounded" />
      <input name="email" type="email" required className="border p-2 rounded" />
      <input name="password" type="password" required className="border p-2 rounded" />
      <button disabled={loading} className="px-4 py-2 rounded bg-yellow-400 text-black">
        {loading ? "Please wait..." : "Create account / Sign in"}
      </button>
    </form>
  );
}
