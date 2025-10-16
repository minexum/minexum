"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";

type Msg = {
  id: string;
  rfq_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function RFQChatPage() {
  const params = useParams<{ id: string }>();
  const rfqId = params.id;
  const sb = supabaseBrowser();

  const [userId, setUserId] = useState<string>("");
  const [rows, setRows] = useState<Msg[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (user?.id) setUserId(user.id);

      await loadMsgs();

      // realtime subscription
      const ch = sb
        .channel(`rfq:${rfqId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `rfq_id=eq.${rfqId}` },
          (payload) => {
            setRows((prev) => [...prev, payload.new as any]);
          }
        )
        .subscribe();

      return () => { sb.removeChannel(ch); };
    })();

    async function loadMsgs() {
      const { data } = await sb
        .from("messages")
        .select("*")
        .eq("rfq_id", rfqId)
        .order("created_at", { ascending: true });
      setRows((data as Msg[]) || []);
    }
  }, [rfqId]); // eslint-disable-line

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = inputRef.current?.value?.trim();
    if (!body) return;
    const { error } = await sb.from("messages").insert({ rfq_id: rfqId, sender_id: userId, body });
    if (!error && inputRef.current) inputRef.current.value = "";
    if (error) alert(error.message);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">RFQ Conversation</h1>

      <div className="border rounded p-4 h-[60vh] overflow-y-auto space-y-2 bg-gray-50">
        {rows.map((m) => (
          <div key={m.id} className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}>
            <div className={`px-3 py-2 rounded ${m.sender_id === userId ? "bg-yellow-300" : "bg-white border"}`}>
              <div className="text-sm">{m.body}</div>
              <div className="text-[10px] text-gray-500">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-gray-500">No messages yet.</div>}
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input ref={inputRef} className="flex-1 border rounded p-2" placeholder="Type a message..." />
        <button className="px-4 py-2 rounded bg-yellow-400 text-black">Send</button>
      </form>
    </div>
  );
}
