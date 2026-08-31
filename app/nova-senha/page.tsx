"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function NovaSenhaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

    if (password.length < 6) {
      setErrorMessage(
        "A senha precisa ter pelo menos 6 caracteres."
      );

      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "As senhas não são iguais."
      );

      setLoading(false);
      return;
    }

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      setErrorMessage(
        "Não foi possível alterar a senha. O link pode ter expirado."
      );

      setLoading(false);
      return;
    }

    setMessage(
      "Senha alterada com sucesso."
    );

    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1500);

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
              Criar nova senha
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted">
              Escolha uma nova senha para acessar sua conta.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-white/90"
              >
                Nova senha
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-white/90"
              >
                Confirmar nova senha
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Digite novamente"
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
                ? "Alterando senha..."
                : "Salvar nova senha"}
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