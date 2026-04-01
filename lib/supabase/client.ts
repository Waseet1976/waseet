/**
 * lib/supabase/client.ts — MOCK (visualisation sans Supabase)
 * Remplacer par createBrowserClient(@supabase/ssr) une fois Supabase configuré.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: (_event: unknown, _callback: unknown) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: async () => ({
        data: null,
        error: { message: "Supabase non configuré (mode mock)" },
      }),
      signOut: async () => ({ error: null }),
    },
    storage: {
      from: (_bucket: string) => ({
        upload: async (_path: string, _file: unknown) => ({
          data: { path: `mock/${Date.now()}` },
          error: null,
        }),
        getPublicUrl: (_path: string) => ({
          data: { publicUrl: "" },
        }),
      }),
    },
  } as unknown as SupabaseClient;
}
