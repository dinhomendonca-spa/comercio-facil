"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { createClient } from "@/lib/supabase/client";

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const businessNames: Record<string, string> = {
  pizzeria: "Pizzaria",
  snack_bar: "Lanchonete",
  restaurant: "Restaurante",
  market: "Mercado / Armazém",
  stationery: "Papelaria",
  kiosk: "Quiosque",
  retail: "Loja / Varejo",
  tools_store: "Ferramentas e Ferragens",
  other: "Outro",
};

const businessIcons: Record<string, string> = {
  pizzeria: "🍕",
  snack_bar: "🍔",
  restaurant: "🍽️",
  market: "🛒",
  stationery: "📚",
  kiosk: "🏪",
  retail: "🛍️",
  tools_store: "🧰",
  other: "⚙️",
};

export default function NegocioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = useMemo(() => {
    return createClient();
  }, []);

  const businessType =
    searchParams.get("tipo") ?? "other";

  const businessName =
    businessNames[businessType] ?? "Outro";

  const businessIcon =
    businessIcons[businessType] ?? "🏪";

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const canContinue = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      slug.length >= 2 &&
      !loading
    );
  }, [name, slug, loading]);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(createSlug(value));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!canContinue) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    /*
     * Primeiro confirmamos se realmente
     * existe um usuário autenticado.
     */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Erro ao consultar usuário:",
        userError
      );

      setErrorMessage(
        `Erro de autenticação: ${userError.message}`
      );

      setLoading(false);
      return;
    }

    if (!user) {
      setErrorMessage(
        "Nenhum usuário autenticado foi encontrado. Faça login novamente."
      );

      setLoading(false);
      return;
    }

    console.log(
      "Usuário autenticado:",
      user.id
    );

    console.log(
      "Criando empresa:",
      {
        name: name.trim(),
        slug,
        businessType,
      }
    );

    /*
     * Agora chamamos a função do Supabase.
     */
    const { data, error } =
      await supabase.rpc(
        "create_organization_onboarding",
        {
          p_name: name.trim(),
          p_slug: slug,
          p_business_type_key:
            businessType,
        }
      );

    if (error) {
      console.error(
        "Erro ao criar empresa:",
        error
      );

      setErrorMessage(
        `Supabase respondeu: ${error.message}`
      );

      setLoading(false);
      return;
    }

    console.log(
      "Empresa criada com ID:",
      data
    );

    if (!data) {
      setErrorMessage(
        "O Supabase não retornou o ID da empresa."
      );

      setLoading(false);
      return;
    }

    setSuccessMessage(
      "Negócio criado com sucesso!"
    );

    setTimeout(() => {
      router.push("/app");
      router.refresh();
    }, 1000);
  }

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <section className="glass-panel glass-enter p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            Comércio Fácil
          </p>

          <p className="mt-4 text-sm font-medium text-white/60">
            Etapa 2 de 3
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Conte um pouco sobre seu negócio
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            Agora vamos identificar seu
            estabelecimento dentro do sistema.
          </p>

          <div className="glass-card mt-6 flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
              {businessIcon}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-white/50">
                Tipo selecionado
              </p>

              <p className="mt-1 font-semibold text-white">
                {businessName}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-white/90"
              >
                Nome do estabelecimento
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  handleNameChange(
                    event.target.value
                  )
                }
                placeholder="Ex.: Pizzaria do João"
                autoComplete="organization"
                className="glass-input"
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="mb-2 block text-sm font-medium text-white/90"
              >
                Identificador do negócio
              </label>

              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(
                    createSlug(
                      event.target.value
                    )
                  )
                }
                placeholder="pizzaria-do-joao"
                className="glass-input"
              />

              <p className="mt-2 text-xs text-white/45">
                Futuramente esse identificador
                poderá fazer parte do endereço
                público da sua loja.
              </p>
            </div>

            {errorMessage && (
              <div className="glass-error text-sm">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="glass-success text-sm">
                {successMessage}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  router.push("/onboarding")
                }
                className="glass-button"
              >
                Voltar
              </button>

              <button
                type="submit"
                disabled={!canContinue}
                className="glass-button-primary min-w-[180px]"
              >
                {loading
                  ? "Criando negócio..."
                  : "Salvar e continuar"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}