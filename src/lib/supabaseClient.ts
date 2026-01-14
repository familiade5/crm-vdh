import { createClient } from "@supabase/supabase-js";

// NOTE:
// This wrapper exists to prevent a blank screen when Vite env vars are missing.
// We prefer import.meta.env, but we fall back to the Cloud-provisioned values.
//
// We intentionally DO NOT type the client with Database here, because the backend
// schema may be empty during initial setup (which would cause table names to
// become `never` and break builds).

const FALLBACK_SUPABASE_URL = "https://zpyxqnkhlhpcxbmrwuqp.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpweXhxbmtobGhwY3hibXJ3dXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDMzODIsImV4cCI6MjA4Mzk3OTM4Mn0.PR5cunQG3HTyAqZM2zXIoyBVD8P5aHnbt87PeL7k1TA";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  FALLBACK_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
