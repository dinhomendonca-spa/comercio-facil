"use client";

import {
  FormEvent,
  Suspense,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { createClient } from "@/lib/supabase/client";


/* =========================================================
   NOMES DOS TIPOS DE NEGÓCIO
   ========================================================= */

const businessTypeNames: Record<
  string,
  string
> = {
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


/* =========================================================
   ÍCONES
   ========================================================= */

const businessTypeIcons: Record<
  string,
  string
> = {
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


/* =========================================================
   CRIAR SLUG
   ========================================================= */

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}


/* =========================================================
   CONTEÚDO DA PÁGINA

   Este componente usa useSearchParams().
   Por isso ele ficará dentro de Suspense.
   ========================================================= */

function NegocioContent() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const supabase = useMemo(() => {
    return createClient();
  }, []);


  /* =======================================================
     TIPO ESCOLHIDO
     ======================================================= */

  const businessTypeKey =
    searchParams.get("tipo") ?? "";


  const businessTypeName =
    businessTypeNames[
      businessTypeKey
    ] ?? "Negócio";


  const businessTypeIcon =
    businessTypeIcons[
      businessTypeKey
    ] ?? "🏪";


  /* =======================================================
     ESTADOS
     ======================================================= */

  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [slugEdited, setSlugEdited] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  /* =======================================================
     ALTERAÇÃO DO NOME
     ======================================================= */

  function handleNameChange(
    value: string
  ) {
    setName(value);

    /*
     * Enquanto o usuário não editar
     * o identificador manualmente,
     * ele acompanha o nome.
     */

    if (!slugEdited) {
      setSlug(
        createSlug(value)
      );
    }
  }


  /* =======================================================
     ALTERAÇÃO MANUAL DO SLUG
     ======================================================= */

  function handleSlugChange(
    value: string
  ) {
    setSlugEdited(true);

    setSlug(
      createSlug(value)
    );
  }


  /* =======================================================
     SALVAR NEGÓCIO
     ======================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");


    /* -----------------------------------------------------
       VALIDAR TIPO
       ----------------------------------------------------- */

    if (!businessTypeKey) {
      setErrorMessage(
        "O tipo de negócio não foi informado. Volte e escolha uma opção."
      );

      setLoading(false);
      return;
    }


    /* -----------------------------------------------------
       VALIDAR NOME
       ----------------------------------------------------- */

    const trimmedName =
      name.trim();

    if (
      trimmedName.length < 2
    ) {
      setErrorMessage(
        "Digite o nome da empresa."
      );

      setLoading(false);
      return;
    }


    /* -----------------------------------------------------
       VALIDAR SLUG
       ----------------------------------------------------- */

    const finalSlug =
      createSlug(slug);

    if (!finalSlug) {
      setErrorMessage(
        "Não foi possível criar o identificador da empresa."
      );

      setLoading(false);
      return;
    }


    /* =====================================================
       CONFIRMAR USUÁRIO LOGADO
       ===================================================== */

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser();


    if (userError) {
      console.error(
        "Erro de autenticação:",
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
        "Sua sessão não foi encontrada. Faça login novamente."
      );

      setLoading(false);
      return;
    }


    console.log(
      "Usuário autenticado:",
      user.id
    );


    console.log(
      "Criando organização:",
      {
        p_name:
          trimmedName,

        p_slug:
          finalSlug,

        p_business_type_key:
          businessTypeKey,
      }
    );


    /* =====================================================
       CRIAR ORGANIZAÇÃO
       ===================================================== */

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "create_organization_onboarding",
        {
          p_name:
            trimmedName,

          p_slug:
            finalSlug,

          p_business_type_key:
            businessTypeKey,
        }
      );


    /* =====================================================
       ERRO DO SUPABASE
       ===================================================== */

    if (error) {
      console.error(
        "Erro RPC:",
        error
      );

      setErrorMessage(
        `Supabase respondeu: ${error.message}`
      );

      setLoading(false);
      return;
    }


    /* =====================================================
       VERIFICAR RETORNO
       ===================================================== */

    if (!data) {
      setErrorMessage(
        "A empresa não foi criada. O banco não retornou o identificador da organização."
      );

      setLoading(false);
      return;
    }


    /* =====================================================
       SUCESSO
       ===================================================== */

    setSuccessMessage(
      "Negócio criado com sucesso!"
    );


    setTimeout(() => {
      router.push("/app");

      router.refresh();
    }, 1000);
  }


  /* =======================================================
     INTERFACE
     ======================================================= */

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6">

      <div className="mx-auto w-full max-w-3xl">


        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <header className="glass-panel glass-enter p-6 sm:p-8">

          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            Comércio Fácil
          </p>


          <div className="mt-4 flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl">
              {businessTypeIcon}
            </div>


            <div>

              <p className="text-xs uppercase tracking-wide text-white/40">
                Tipo escolhido
              </p>

              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                {businessTypeName}
              </h1>

            </div>

          </div>


          <p className="mt-5 text-sm leading-6 text-muted">
            Agora precisamos apenas de
            algumas informações para criar
            seu negócio.
          </p>

        </header>


        {/* =================================================
            FORMULÁRIO
        ================================================= */}

        <section className="glass-panel mt-6 p-6 sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >


            {/* NOME */}

            <div>

              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-white/90"
              >
                Nome da empresa *
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
                className="glass-input"
                autoComplete="organization"
              />

              <p className="mt-2 text-xs text-white/40">
                Esse será o nome exibido
                dentro do Comércio Fácil.
              </p>

            </div>


            {/* SLUG */}

            <div>

              <label
                htmlFor="slug"
                className="mb-2 block text-sm font-medium text-white/90"
              >
                Identificador
              </label>

              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(event) =>
                  handleSlugChange(
                    event.target.value
                  )
                }
                placeholder="pizzaria-do-joao"
                className="glass-input"
                autoCapitalize="none"
                autoCorrect="off"
              />

              <p className="mt-2 text-xs leading-5 text-white/40">
                Será usado futuramente no
                endereço público da sua
                loja.
              </p>


              {slug && (

                <div className="glass-card mt-3 p-3">

                  <p className="text-xs text-white/40">
                    Seu endereço poderá ser:
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-white">
                    /loja/{slug}
                  </p>

                </div>

              )}

            </div>


            {/* TIPO */}

            <div>

              <p className="mb-2 block text-sm font-medium text-white/90">
                Tipo de negócio
              </p>

              <div className="glass-card flex items-center gap-4 p-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-2xl">
                  {businessTypeIcon}
                </div>

                <div className="min-w-0">

                  <p className="font-medium text-white">
                    {businessTypeName}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    Recursos serão
                    configurados para esse
                    tipo de negócio.
                  </p>

                </div>

              </div>

            </div>


            {/* ERRO */}

            {errorMessage && (

              <div className="glass-error text-sm">
                {errorMessage}
              </div>

            )}


            {/* SUCESSO */}

            {successMessage && (

              <div className="glass-success text-sm">
                {successMessage}
              </div>

            )}


            {/* BOTÕES */}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">

              <Link
                href="/onboarding"
                className="glass-button"
              >
                ← Voltar
              </Link>


              <button
                type="submit"
                disabled={
                  loading ||
                  Boolean(
                    successMessage
                  )
                }
                className="glass-button-primary min-w-[190px]"
              >

                {loading
                  ? "Criando negócio..."
                  : successMessage
                    ? "Negócio criado"
                    : "Criar meu negócio"}

              </button>

            </div>

          </form>

        </section>

      </div>

    </main>
  );
}


/* =========================================================
   FALLBACK DO SUSPENSE
   ========================================================= */

function NegocioLoading() {
  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6">

      <div className="mx-auto w-full max-w-3xl">

        <section className="glass-panel glass-enter p-8 text-center">

          <div className="text-3xl">
            🏪
          </div>

          <p className="mt-4 text-sm text-muted">
            Carregando configuração do
            negócio...
          </p>

        </section>

      </div>

    </main>
  );
}


/* =========================================================
   PÁGINA

   Suspense resolve o prerender do Next.js/Vercel.
   ========================================================= */

export default function NegocioPage() {
  return (
    <Suspense
      fallback={
        <NegocioLoading />
      }
    >
      <NegocioContent />
    </Suspense>
  );
}