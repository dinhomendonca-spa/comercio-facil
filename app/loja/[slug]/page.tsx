import { createClient } from "@/lib/supabase/server";

type LojaPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LojaPage({
  params,
}: LojaPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_public_catalog",
    {
      p_slug: slug,
    }
  );

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6">
      <div className="mx-auto w-full max-w-3xl">

        <section className="glass-panel p-6 sm:p-8">

          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            Comércio Fácil
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Teste do catálogo
          </h1>

          <div className="mt-6 space-y-4">

            <div className="glass-card p-4">

              <p className="text-xs text-white/40">
                Slug recebido pela página
              </p>

              <p className="mt-2 font-semibold text-white">
                {slug}
              </p>

            </div>

            {error && (
              <div className="glass-error">

                <p className="font-semibold">
                  Erro do Supabase
                </p>

                <p className="mt-2 text-sm">
                  {error.message}
                </p>

              </div>
            )}

            {!error && !data && (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-amber-100">

                <p className="font-semibold">
                  A página existe, mas a empresa não foi encontrada.
                </p>

                <p className="mt-2 text-sm">
                  Provavelmente estamos usando um slug diferente do cadastrado no Supabase.
                </p>

              </div>
            )}

            {!error && data && (
              <div className="glass-success">

                <p className="font-semibold">
                  ✅ Catálogo encontrado
                </p>

                <p className="mt-2 text-sm">
                  A rota e o Supabase estão funcionando.
                </p>

              </div>
            )}

            <div className="glass-card p-4">

              <p className="text-xs text-white/40">
                Resposta do banco
              </p>

              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-white/70">
                {JSON.stringify(
                  data,
                  null,
                  2
                )}
              </pre>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}