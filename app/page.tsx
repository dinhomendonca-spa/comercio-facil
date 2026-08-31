import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  /*
   * =======================================================
   * VERIFICAR SE EXISTE USUÁRIO LOGADO
   * =======================================================
   */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * =======================================================
   * USUÁRIO LOGADO
   *
   * Vai diretamente para o painel.
   * =======================================================
   */

  if (user) {
    redirect("/app");
  }

  /*
   * =======================================================
   * USUÁRIO NÃO LOGADO
   *
   * Vai para a tela de login.
   * =======================================================
   */

  redirect("/login");
}