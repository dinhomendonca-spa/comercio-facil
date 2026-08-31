import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const moduleIcons: Record<string, string> = {
  products: "📦",
  customers: "👥",
  sales: "🛒",
  inventory: "📊",
  revenue: "💰",
  expenses: "💸",
  delivery: "🏍️",
  tables: "🍽️",
  tabs: "🧾",
  kitchen: "👨‍🍳",
  ingredients: "🥬",
  barcode: "▥",
  suppliers: "🚚",
  purchases: "📥",
  catalog: "🛍️",
  whatsapp: "💬",
  pix: "💳",
  finance: "💵",
  fiscal: "🧾",
  ai: "✨",
};

export default async function AppPage() {
  const supabase = await createClient();

  /*
   * =======================================================
   * USUÁRIO LOGADO
   * =======================================================
   */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * =======================================================
   * PERFIL
   * =======================================================
   */

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  /*
   * =======================================================
   * EMPRESA DO USUÁRIO
   * =======================================================
   */

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/onboarding");
  }

  /*
   * =======================================================
   * DADOS DA EMPRESA
   * =======================================================
   */

  const { data: organization } = await supabase
    .from("organizations")
    .select(
      `
        id,
        name,
        slug,
        business_type_key,
        onboarding_completed
      `
    )
    .eq("id", membership.organization_id)
    .single();

  if (!organization) {
    redirect("/onboarding");
  }

  /*
   * =======================================================
   * TIPO DO NEGÓCIO
   * =======================================================
   */

  const { data: businessType } = await supabase
    .from("business_types")
    .select("name, icon")
    .eq("key", organization.business_type_key)
    .maybeSingle();

  /*
   * =======================================================
   * MÓDULOS ATIVOS DA EMPRESA
   * =======================================================
   */

  const { data: organizationModules } = await supabase
    .from("organization_modules")
    .select("module_key, enabled")
    .eq("organization_id", organization.id)
    .eq("enabled", true);

  const moduleKeys =
    organizationModules?.map(
      (item) => item.module_key
    ) ?? [];

  /*
   * =======================================================
   * INFORMAÇÕES DOS MÓDULOS
   * =======================================================
   */

  let modules: {
    key: string;
    name: string;
    description: string | null;
    sort_order: number;
  }[] = [];

  if (moduleKeys.length > 0) {
    const { data } = await supabase
      .from("modules")
      .select(
        `
          key,
          name,
          description,
          sort_order
        `
      )
      .in("key", moduleKeys)
      .eq("available", true)
      .order("sort_order", {
        ascending: true,
      });

    modules = data ?? [];
  }

  /*
   * =======================================================
   * INDICADORES
   *
   * Mais adiante esses valores virão do banco.
   * =======================================================
   */

  const revenueToday = 0;
  const expensesToday = 0;
  const salesToday = 0;
  const productsCount = 0;
  const customersCount = 0;

  /*
   * =======================================================
   * FORMATADOR DE DINHEIRO
   * =======================================================
   */

  function formatMoney(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  /*
   * =======================================================
   * INTERFACE
   * =======================================================
   */

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6">
      <div className="mx-auto w-full max-w-7xl">

        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <header className="glass-panel glass-enter p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
                Comércio Fácil
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Olá
                {profile?.name
                  ? `, ${profile.name}`
                  : ""}
                👋
              </h1>

              <p className="mt-2 text-sm text-muted">
                Aqui está o resumo do seu negócio.
              </p>
            </div>

            <div className="glass-card flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
                {businessType?.icon ?? "🏪"}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/45">
                  Seu negócio
                </p>

                <p className="mt-1 font-semibold text-white">
                  {organization.name}
                </p>

                <p className="mt-1 text-xs text-white/50">
                  {businessType?.name ?? "Comércio"}
                </p>
              </div>
            </div>

          </div>
        </header>

        {/* =================================================
            INDICADORES
        ================================================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* FATURAMENTO */}

          <div className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">
                  Faturamento hoje
                </p>

                <p className="mt-3 text-2xl font-bold text-white">
                  {formatMoney(revenueToday)}
                </p>
              </div>

              <span className="text-xl">
                💰
              </span>
            </div>

            <p className="mt-2 text-xs text-white/40">
              Entradas do dia
            </p>
          </div>

          {/* GASTOS */}

          <div className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">
                  Gastos hoje
                </p>

                <p className="mt-3 text-2xl font-bold text-white">
                  {formatMoney(expensesToday)}
                </p>
              </div>

              <span className="text-xl">
                💸
              </span>
            </div>

            <p className="mt-2 text-xs text-white/40">
              Saídas do dia
            </p>
          </div>

          {/* VENDAS */}

          <div className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">
                  Vendas hoje
                </p>

                <p className="mt-3 text-2xl font-bold text-white">
                  {salesToday}
                </p>
              </div>

              <span className="text-xl">
                🛒
              </span>
            </div>

            <p className="mt-2 text-xs text-white/40">
              Vendas finalizadas
            </p>
          </div>

          {/* PRODUTOS */}

          <div className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">
                  Produtos
                </p>

                <p className="mt-3 text-2xl font-bold text-white">
                  {productsCount}
                </p>
              </div>

              <span className="text-xl">
                📦
              </span>
            </div>

            <p className="mt-2 text-xs text-white/40">
              Produtos cadastrados
            </p>
          </div>

          {/* CLIENTES */}

          <div className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">
                  Clientes
                </p>

                <p className="mt-3 text-2xl font-bold text-white">
                  {customersCount}
                </p>
              </div>

              <span className="text-xl">
                👥
              </span>
            </div>

            <p className="mt-2 text-xs text-white/40">
              Clientes cadastrados
            </p>
          </div>

        </section>

        {/* =================================================
            FERRAMENTAS / MÓDULOS
        ================================================= */}

        <section className="mt-8">

          <div>
            <p className="text-sm font-semibold text-accent">
              Ferramentas
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              O que você quer fazer?
            </h2>

            <p className="mt-2 text-sm text-muted">
              Estes são os recursos ativos para sua empresa.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {modules.map((module) => (
              <div
                key={module.key}
                className="glass-card p-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
                  {moduleIcons[module.key] ?? "⚙️"}
                </div>

                <h3 className="mt-4 text-lg font-semibold text-white">
                  {module.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted">
                  {module.description}
                </p>

                <div className="mt-5">
                  <span className="text-xs font-medium text-white/40">
                    Em breve vamos ativar esta área
                  </span>
                </div>
              </div>
            ))}

          </div>

        </section>

        {/* =================================================
            INFORMAÇÕES DO SISTEMA
        ================================================= */}

        <section className="glass-panel mt-8 p-6">

          <p className="text-sm font-semibold text-accent">
            Sistema configurado
          </p>

          <h2 className="mt-2 text-xl font-bold text-white">
            {organization.name}
          </h2>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">

            <div className="glass-card p-4">
              <p className="text-white/40">
                Tipo
              </p>

              <p className="mt-1 font-medium text-white">
                {businessType?.name ?? "Comércio"}
              </p>
            </div>

            <div className="glass-card p-4">
              <p className="text-white/40">
                Identificador
              </p>

              <p className="mt-1 font-medium text-white">
                {organization.slug}
              </p>
            </div>

            <div className="glass-card p-4">
              <p className="text-white/40">
                Seu acesso
              </p>

              <p className="mt-1 font-medium capitalize text-white">
                {membership.role}
              </p>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}