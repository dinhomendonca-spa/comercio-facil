"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setErrorMessage("Digite seu e-mail.");
      setLoading(false);
      return;
    }

    if (!password) {
      setErrorMessage("Digite sua senha.");
      setLoading(false);
      return;
    }

    const { error } =
      await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

    if (error) {
      setErrorMessage(
        "E-mail ou senha inválidos."
      );

      setLoading(false);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <main className="min-h-screen px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <section className="glass-panel glass-enter w-full p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl backdrop-blur-xl">
              CF
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
              Comércio Fácil
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Bem-vindo de volta
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted">
              Entre na sua conta para acessar seu negócio.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-white/90"
              >
                E-mail
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="voce@email.com"
                autoComplete="email"
                className="glass-input"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-white/90"
                >
                  Senha
                </label>

                <Link
                  href="/recuperar-senha"
                  className="glass-link text-sm font-medium"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Sua senha"
                autoComplete="current-password"
                className="glass-input"
              />
            </div>

            {errorMessage && (
              <div className="glass-error text-sm">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary w-full"
            >
              {loading
                ? "Entrando..."
                : "Entrar"}
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-muted">
              Ainda não possui uma conta?{" "}
              <Link
                href="/cadastro"
                className="glass-link font-semibold"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}