import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";


/* =========================================================
   ÍCONES DOS MÓDULOS
   ========================================================= */

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


/* =========================================================
   ROTAS DOS MÓDULOS JÁ IMPLEMENTADOS

   Conforme criarmos novas páginas,
   adicionaremos as rotas aqui.
   ========================================================= */

const moduleRoutes: Record<string, string> = {
  products: "/app/produtos",
};


/* =========================================================
   FORMATAR DINHEIRO
   ========================================================= */

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}


/* =========================================================
   PÁGINA PRINCIPAL
   ========================================================= */

export default async function AppPage() {
  const supabase = await createClient();


  /* =======================================================
     USUÁRIO
     ======================================================= */

  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (!user) {
    redirect("/login");
  }


  /* =======================================================
     PERFIL
     ======================================================= */

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();


  /* =======================================================
     EMPRESA DO USUÁRIO
     ======================================================= */

  const { data: membership } =
    await supabase
      .from("memberships")
      .select(
        `
          organization_id,
          role
        `
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();


  if (!membership) {
    redirect("/onboarding");
  }


  /* =======================================================
     ORGANIZAÇÃO
     ======================================================= */

  const { data: organization } =
    await supabase
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
      .eq(
        "id",
        membership.organization_id
      )
      .single();


  if (!organization) {
    redirect("/onboarding");
  }


  /* =======================================================
     TIPO DE NEGÓCIO
     ======================================================= */

  const { data: businessType } =
    await supabase
      .from("business_types")
      .select(
        `
          name,
          icon
        `
      )
      .eq(
        "key",
        organization.business_type_key
      )
      .maybeSingle();


  /* =======================================================
     MÓDULOS ATIVOS
     ======================================================= */

  const { data: organizationModules } =
    await supabase
      .from("organization_modules")
      .select(
        `
          module_key,
          enabled
        `
      )
      .eq(
        "organization_id",
        organization.id
      )
      .eq(
        "enabled",
        true
      );


  const moduleKeys =
    organizationModules?.map(
      (item) => item.module_key
    ) ?? [];


  /* =======================================================
     DADOS DOS MÓDULOS
     ======================================================= */

  let modules: {
    key: string;
    name: string;
    description: string | null;
    sort_order: number;
  }[] = [];


  if (moduleKeys.length > 0) {
    const { data } =
      await supabase
        .from("modules")
        .select(
          `
            key,
            name,
            description,
            sort_order
          `
        )
        .in(
          "key",
          moduleKeys
        )
        .eq(
          "available",
          true
        )
        .order(
          "sort_order",
          {
            ascending: true,
          }
        );


    modules = data ?? [];
  }


  /* =======================================================
     QUANTIDADE REAL DE PRODUTOS
     ======================================================= */

  const {
    count: productsCount,
  } =
    await supabase
      .from("products")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      )
      .eq(
        "organization_id",
        organization.id
      );


  /* =======================================================
     INDICADORES

     Os demais serão conectados às tabelas
     quando criarmos Vendas, Clientes e Gastos.
     ======================================================= */

  const revenueToday = 0;
  const expensesToday = 0;
  const salesToday = 0;
  const customersCount = 0;


  /* =======================================================
     INTERFACE
     ======================================================= */

  return (
    <main className="min-h-screen px-4 py-6 text-white sm:px-6 sm:py-8">

      <div className="mx-auto w-full max-w-7xl">


        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <header className="glass-panel glass-enter p-5 sm:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
                Comércio Fácil
              </p>


              <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">

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

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
                {businessType?.icon ?? "🏪"}
              </div>


              <div className="min-w-0">

                <p className="text-xs uppercase tracking-wide text-white/45">
                  Seu negócio
                </p>

                <p className="mt-1 truncate font-semibold text-white">
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
            AÇÕES RÁPIDAS

            Muito útil no celular.
        ================================================= */}

        <section className="mt-5">

          <p className="text-sm font-semibold text-accent">
            Ações rápidas
          </p>


          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            <Link
              href="/app/produtos/novo"
              className="glass-button-primary min-h-[54px] w-full"
            >
              📷 Cadastrar produto
            </Link>


            <Link
              href="/app/produtos"
              className="glass-button min-h-[54px] w-full"
            >
              📦 Ver produtos
            </Link>

          </div>

        </section>


        {/* =================================================
            INDICADORES
        ================================================= */}

        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">


          {/* FATURAMENTO */}

          <div className="glass-card p-4 sm:p-5">

            <div className="flex items-start justify-between gap-2">

              <div>

                <p className="text-xs text-muted sm:text-sm">
                  Faturamento hoje
                </p>

                <p className="mt-3 text-lg font-bold text-white sm:text-2xl">
                  {formatMoney(
                    revenueToday
                  )}
                </p>

              </div>

              <span className="text-lg">
                💰
              </span>

            </div>

          </div>


          {/* GASTOS */}

          <div className="glass-card p-4 sm:p-5">

            <div className="flex items-start justify-between gap-2">

              <div>

                <p className="text-xs text-muted sm:text-sm">
                  Gastos hoje
                </p>

                <p className="mt-3 text-lg font-bold text-white sm:text-2xl">
                  {formatMoney(
                    expensesToday
                  )}
                </p>

              </div>

              <span className="text-lg">
                💸
              </span>

            </div>

          </div>


          {/* VENDAS */}

          <div className="glass-card p-4 sm:p-5">

            <div className="flex items-start justify-between gap-2">

              <div>

                <p className="text-xs text-muted sm:text-sm">
                  Vendas hoje
                </p>

                <p className="mt-3 text-lg font-bold text-white sm:text-2xl">
                  {salesToday}
                </p>

              </div>

              <span className="text-lg">
                🛒
              </span>

            </div>

          </div>


          {/* PRODUTOS */}

          <Link
            href="/app/produtos"
            className="glass-card block p-4 sm:p-5"
          >

            <div className="flex items-start justify-between gap-2">

              <div>

                <p className="text-xs text-muted sm:text-sm">
                  Produtos
                </p>

                <p className="mt-3 text-lg font-bold text-white sm:text-2xl">
                  {productsCount ?? 0}
                </p>

              </div>

              <span className="text-lg">
                📦
              </span>

            </div>


            <p className="mt-2 text-xs text-accent">
              Abrir produtos →
            </p>

          </Link>


          {/* CLIENTES */}

          <div className="glass-card p-4 sm:p-5">

            <div className="flex items-start justify-between gap-2">

              <div>

                <p className="text-xs text-muted sm:text-sm">
                  Clientes
                </p>

                <p className="mt-3 text-lg font-bold text-white sm:text-2xl">
                  {customersCount}
                </p>

              </div>

              <span className="text-lg">
                👥
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            MÓDULOS
        ================================================= */}

        <section className="mt-8">

          <div>

            <p className="text-sm font-semibold text-accent">
              Ferramentas
            </p>

            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
              O que você quer fazer?
            </h2>

            <p className="mt-2 text-sm text-muted">
              Acesse os recursos disponíveis para sua empresa.
            </p>

          </div>


          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {modules.map(
              (module) => {

                const route =
                  moduleRoutes[
                    module.key
                  ];


                /* =========================================
                   MÓDULO JÁ IMPLEMENTADO
                   ========================================= */

                if (route) {

                  return (

                    <Link
                      key={module.key}
                      href={route}
                      className="glass-card group block p-5"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
                          {moduleIcons[
                            module.key
                          ] ?? "⚙️"}
                        </div>


                        <span className="text-lg text-white/35 transition group-hover:translate-x-1 group-hover:text-white">
                          →
                        </span>

                      </div>


                      <h3 className="mt-4 text-lg font-semibold text-white">
                        {module.name}
                      </h3>


                      <p className="mt-2 text-sm leading-6 text-muted">
                        {module.description}
                      </p>


                      <p className="mt-5 text-sm font-medium text-accent">
                        Abrir →
                      </p>

                    </Link>

                  );
                }


                /* =========================================
                   MÓDULO QUE AINDA SERÁ IMPLEMENTADO
                   ========================================= */

                return (

                  <div
                    key={module.key}
                    className="glass-card p-5"
                  >

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">

                      {moduleIcons[
                        module.key
                      ] ?? "⚙️"}

                    </div>


                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {module.name}
                    </h3>


                    <p className="mt-2 text-sm leading-6 text-muted">
                      {module.description}
                    </p>


                    <div className="mt-5">

                      <span className="text-xs font-medium text-white/40">
                        Em desenvolvimento
                      </span>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        </section>


        {/* =================================================
            INFORMAÇÕES DA EMPRESA
        ================================================= */}

        <section className="glass-panel mt-8 p-5 sm:p-6">

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
                {businessType?.name ??
                  "Comércio"}
              </p>

            </div>


            <div className="glass-card p-4">

              <p className="text-white/40">
                Identificador
              </p>

              <p className="mt-1 break-all font-medium text-white">
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