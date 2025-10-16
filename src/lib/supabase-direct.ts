// src/lib/supabase-direct.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseDirect = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,         // https://urwfgocvohcuftoowyty.supabase.co
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!     // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyd2Znb2N2b2hjdWZ0b293eXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjEzMTIsImV4cCI6MjA3NjEzNzMxMn0.tOskl_QFsGnY22awvWAD0oqttFkOYXHhP-GKO6W2GO8
  );
