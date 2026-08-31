"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setErrorMessage("Digite seu nome.");
      setLoading(false);
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("Digite seu e-mail.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        "A senha precisa ter pelo menos 6 caracteres."
      );
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          name: trimmedName,
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setName("");
    setEmail("");
    setPassword("");

    if (data.session) {
      setMessage(
        "Conta criada com sucesso! Você já está autenticado."
      );
    } else {
      setMessage(
        "Conta criada! Verifique seu e-mail para confirmar o cadastro."
      );
    }

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
              Crie sua conta
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted">
              Comece criando seu acesso ao sistema.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-white/90"
              >
                Seu nome
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Ex.: João Silva"
                autoComplete="name"
                className="glass-input"
              />
            </div>

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
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-white/90"
              >
                Senha
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Mínimo de 6 caracteres"
                autoComplete="new-password"
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
                ? "Criando conta..."
                : "Criar minha conta"}
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-muted">
              Já possui uma conta?{" "}
              <Link
                href="/login"
                className="glass-link font-semibold"
              >
                Entrar
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}