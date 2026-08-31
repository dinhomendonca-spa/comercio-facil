import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import DeleteProductButton from "./DeleteProductButton";

type Product = {
  id: string;

  name: string;

  description: string | null;

  sku: string | null;

  cost_price: number;

  sale_price: number;

  stock_quantity: number;

  minimum_stock: number;

  track_stock: boolean;

  active: boolean;

  image_path: string | null;
};

function formatMoney(value: number) {
  return Number(value).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

export default async function ProdutosPage() {
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
     EMPRESA
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
     DADOS DA EMPRESA
     ======================================================= */

  const { data: organization } =
    await supabase
      .from("organizations")
      .select(
        `
          id,
          name,
          slug
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
     PRODUTOS
     ======================================================= */

  const {
    data: productsData,
    error,
  } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        description,
        sku,
        cost_price,
        sale_price,
        stock_quantity,
        minimum_stock,
        track_stock,
        active,
        image_path
      `
    )
    .eq(
      "organization_id",
      organization.id
    )
    .order("name", {
      ascending: true,
    });

  const products =
    (productsData ?? []) as Product[];

  /* =======================================================
     INDICADORES
     ======================================================= */

  const activeProducts =
    products.filter(
      (product) => product.active
    ).length;

  const lowStockProducts =
    products.filter(
      (product) =>
        product.active &&
        product.track_stock &&
        Number(
          product.stock_quantity
        ) <=
          Number(
            product.minimum_stock
          )
    ).length;

  /* =======================================================
     QUEM PODE EXCLUIR
     ======================================================= */

  const canDelete =
    membership.role === "owner" ||
    membership.role === "admin";

  /* =======================================================
     INTERFACE
     ======================================================= */

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

              <h1 className="mt-3 text-3xl font-bold text-white">
                Produtos
              </h1>

              <p className="mt-2 text-sm text-muted">
                Cadastre e gerencie os produtos de{" "}
                {organization.name}.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <Link
                href="/app"
                className="glass-button"
              >
                ← Voltar
              </Link>

              <Link
                href="/app/produtos/novo"
                className="glass-button-primary"
              >
                + Novo produto
              </Link>

            </div>

          </div>

        </header>

        {/* =================================================
            INDICADORES
        ================================================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="glass-card p-5">

            <p className="text-sm text-muted">
              Produtos cadastrados
            </p>

            <p className="mt-3 text-3xl font-bold text-white">
              {products.length}
            </p>

          </div>

          <div className="glass-card p-5">

            <p className="text-sm text-muted">
              Produtos ativos
            </p>

            <p className="mt-3 text-3xl font-bold text-white">
              {activeProducts}
            </p>

          </div>

          <div className="glass-card p-5">

            <p className="text-sm text-muted">
              Estoque baixo
            </p>

            <p className="mt-3 text-3xl font-bold text-white">
              {lowStockProducts}
            </p>

          </div>

        </section>

        {/* =================================================
            ERRO
        ================================================= */}

        {error && (
          <div className="glass-error mt-6">
            Não foi possível carregar os produtos.
          </div>
        )}

        {/* =================================================
            SEM PRODUTOS
        ================================================= */}

        {!error &&
          products.length === 0 && (

            <section className="glass-panel mt-6 p-8 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl">
                📦
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                Nenhum produto cadastrado
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                Seu catálogo ainda está vazio.
                Cadastre seu primeiro produto
                para começar.
              </p>

              <div className="mt-6">

                <Link
                  href="/app/produtos/novo"
                  className="glass-button-primary"
                >
                  + Cadastrar primeiro produto
                </Link>

              </div>

            </section>

          )}

        {/* =================================================
            LISTA DOS PRODUTOS
        ================================================= */}

        {!error &&
          products.length > 0 && (

            <section className="mt-6">

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

                {products.map(
                  (product) => {

                    /* =====================================
                       ESTOQUE BAIXO
                       ===================================== */

                    const lowStock =
                      product.track_stock &&
                      Number(
                        product.stock_quantity
                      ) <=
                        Number(
                          product.minimum_stock
                        );

                    /* =====================================
                       FOTO
                       ===================================== */

                    let imageUrl:
                      | string
                      | null = null;

                    if (
                      product.image_path
                    ) {
                      const {
                        data: imageData,
                      } =
                        supabase.storage
                          .from(
                            "product-images"
                          )
                          .getPublicUrl(
                            product.image_path
                          );

                      imageUrl =
                        imageData.publicUrl;
                    }

                    return (

                      <article
                        key={product.id}
                        className="glass-card overflow-hidden"
                      >

                        {/* =================================
                            FOTO
                        ================================= */}

                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/5">

                          {imageUrl ? (

                            <img
                              src={imageUrl}
                              alt={
                                product.name
                              }
                              className="h-full w-full object-cover transition duration-300 hover:opacity-85"
                            />

                          ) : (

                            <div className="flex h-full w-full items-center justify-center">

                              <div className="text-center">

                                <div className="text-5xl">
                                  📦
                                </div>

                                <p className="mt-3 text-xs text-white/35">
                                  Sem foto
                                </p>

                              </div>

                            </div>

                          )}

                          {/* STATUS */}

                          <div className="absolute right-3 top-3">

                            {product.active ? (

                              <span className="rounded-full border border-emerald-300/20 bg-emerald-950/70 px-3 py-1.5 text-xs font-medium text-emerald-200 backdrop-blur-xl">
                                Ativo
                              </span>

                            ) : (

                              <span className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs text-white/60 backdrop-blur-xl">
                                Inativo
                              </span>

                            )}

                          </div>

                        </div>

                        {/* =================================
                            DADOS
                        ================================= */}

                        <div className="p-5">

                          <h2 className="text-lg font-semibold text-white">
                            {product.name}
                          </h2>

                          {product.sku && (

                            <p className="mt-1 text-xs text-white/40">
                              SKU: {product.sku}
                            </p>

                          )}

                          {product.description && (

                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
                              {
                                product.description
                              }
                            </p>

                          )}

                          {/* ===============================
                              PREÇO E ESTOQUE
                          =============================== */}

                          <div className="mt-5 grid grid-cols-2 gap-3">

                            <div className="rounded-xl border border-white/10 bg-white/5 p-3">

                              <p className="text-xs text-white/40">
                                Venda
                              </p>

                              <p className="mt-1 font-semibold text-white">
                                {formatMoney(
                                  product.sale_price
                                )}
                              </p>

                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/5 p-3">

                              <p className="text-xs text-white/40">
                                Estoque
                              </p>

                              <p className="mt-1 font-semibold text-white">

                                {product.track_stock
                                  ? Number(
                                      product.stock_quantity
                                    ).toLocaleString(
                                      "pt-BR"
                                    )
                                  : "Não controlado"}

                              </p>

                            </div>

                          </div>

                          {/* ===============================
                              ESTOQUE BAIXO
                          =============================== */}

                          {lowStock && (

                            <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-400/10 p-3 text-xs text-amber-100">
                              ⚠ Estoque baixo
                            </div>

                          )}

                          {/* ===============================
                              EXCLUIR
                          =============================== */}

                          {canDelete && (

                            <div className="mt-5 border-t border-white/10 pt-5">

                              <DeleteProductButton
                                productId={
                                  product.id
                                }
                                productName={
                                  product.name
                                }
                                imagePath={
                                  product.image_path
                                }
                              />

                            </div>

                          )}

                        </div>

                      </article>

                    );
                  }
                )}

              </div>

            </section>

          )}

      </div>

    </main>
  );
}