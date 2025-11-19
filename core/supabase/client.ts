import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables are missing. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

const resolvedSupabaseUrl = supabaseUrl as string;
const resolvedSupabaseAnonKey = supabaseAnonKey as string;

export function getSupabaseClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey);
  }

  return browserClient;
}
