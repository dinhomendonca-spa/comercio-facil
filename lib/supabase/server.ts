import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

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

  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(name, value, options);
              }
            );
          } catch {
            /*
             * Em alguns Server Components,
             * o Next.js não permite alterar cookies diretamente.
             *
             * Isso será tratado posteriormente pelo proxy
             * de autenticação do Supabase.
             */
          }
        },
      },
    }
  );
}