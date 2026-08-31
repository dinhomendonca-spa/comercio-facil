import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business_types")
    .select("*")
    .limit(5);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Comércio Fácil
        </h1>

        <p className="mt-2 text-gray-600">
          Teste de conexão com o Supabase
        </p>

        <div className="mt-6">
          {error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              <strong>Erro:</strong> {error.message}
            </div>
          ) : (
            <div className="rounded-lg bg-green-50 p-4 text-green-700">
              <strong>Conexão funcionando.</strong>

              <pre className="mt-4 overflow-x-auto text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}