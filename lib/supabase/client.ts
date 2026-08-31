import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "A variável NEXT_PUBLIC_SUPABASE_URL não foi encontrada."
    );
  }

  if (!supabasePublishableKey) {
    throw new Error(
      "A variável NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não foi encontrada."
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabasePublishableKey
  );
}