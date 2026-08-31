"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function RecuperarSenhaPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setErrorMessage("Digite seu e-mail.");
      setLoading(false);
      return;
    }

    const redirectTo =
      `${window.location.origin}/nova-senha`;

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo,
        }
      );

    if (error) {
      setErrorMessage(
        "Não foi possível enviar o e-mail de recuperação. Tente novamente."
      );

      setLoading(false);
      return;
    }

    setMessage(
      "Se existir uma conta com esse e-mail, você receberá um link para criar uma nova senha."
    );

    setEmail("");
    setLoading(false);
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
              Recuperar senha
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted">
              Informe o e-mail usado na sua conta.
              Enviaremos um link para você criar uma
              nova senha.
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

            {errorMessage && (
              <div className="glass-error text-sm">
                {errorMessage}
              </div>
            )}

            {message && (
              <div className="glass-success text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary w-full"
            >
              {loading
                ? "Enviando..."
                : "Enviar link de recuperação"}
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <Link
              href="/login"
              className="glass-link text-sm font-semibold"
            >
              Voltar para o login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}