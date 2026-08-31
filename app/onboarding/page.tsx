"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type BusinessType = {
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  active: boolean;
  sort_order: number;
};

export default function OnboardingPage() {
  const router = useRouter();

  const supabase = useMemo(() => {
    return createClient();
  }, []);

  const [businessTypes, setBusinessTypes] = useState<
    BusinessType[]
  >([]);

  const [selectedBusinessType, setSelectedBusinessType] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadBusinessTypes() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("business_types")
        .select(
          "key, name, description, icon, active, sort_order"
        )
        .eq("active", true)
        .order("sort_order", {
          ascending: true,
        });

      if (error) {
        setErrorMessage(
          "Não foi possível carregar os tipos de negócio."
        );

        setLoading(false);
        return;
      }

      setBusinessTypes(data ?? []);
      setLoading(false);
    }

    loadBusinessTypes();
  }, [supabase]);

  function handleContinue() {
    if (!selectedBusinessType) {
      return;
    }

    router.push(
      `/onboarding/negocio?tipo=${encodeURIComponent(
        selectedBusinessType
      )}`
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <section className="glass-panel glass-enter p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
              Comércio Fácil
            </p>

            <p className="mt-4 text-sm font-medium text-white/60">
              Etapa 1 de 3
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Qual é o seu tipo de negócio?
            </h1>

            <p className="mt-4 text-sm leading-6 text-muted sm:text-base">
              Escolha a opção que mais se aproxima do seu
              estabelecimento. Isso vai nos ajudar a
              personalizar o sistema para você.
            </p>
          </div>

          {loading && (
            <div className="glass-card mt-8 p-5">
              <p className="text-sm text-muted">
                Carregando opções...
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="glass-error mt-8 text-sm">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {businessTypes.map((businessType) => {
                const isSelected =
                  selectedBusinessType ===
                  businessType.key;

                return (
                  <button
                    key={businessType.key}
                    type="button"
                    onClick={() =>
                      setSelectedBusinessType(
                        businessType.key
                      )
                    }
                    className={[
                      "glass-card",
                      "min-h-[170px]",
                      "w-full",
                      "p-5",
                      "text-left",
                      "transition",
                      "duration-200",
                      "focus:outline-none",
                      "focus:ring-2",
                      "focus:ring-blue-400/40",
                      isSelected
                        ? "border-blue-300/50 bg-blue-400/15"
                        : "",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
                        {businessType.icon ?? "🏪"}
                      </div>

                      {isSelected && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-300/40 bg-blue-400/20 text-sm text-white">
                          ✓
                        </div>
                      )}
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-white">
                      {businessType.name}
                    </h2>

                    <p className="mt-2 text-sm leading-5 text-muted">
                      {businessType.description ??
                        "Configure seu negócio."}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {selectedBusinessType ? (
                <p className="text-sm text-white/70">
                  Tipo de negócio selecionado.
                </p>
              ) : (
                <p className="text-sm text-white/50">
                  Selecione uma opção para continuar.
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={!selectedBusinessType}
              onClick={handleContinue}
              className="glass-button-primary min-w-[160px]"
            >
              Continuar
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}