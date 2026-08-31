"use client";

import Link from "next/link";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";


/* =========================================================
   CONVERSÃO DE DINHEIRO
   ========================================================= */

function parseMoney(value: string) {
  const normalized = value
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(normalized);

  if (Number.isNaN(number)) {
    return 0;
  }

  return number;
}


/* =========================================================
   CONVERSÃO DE QUANTIDADE
   ========================================================= */

function parseQuantity(value: string) {
  const normalized = value
    .trim()
    .replace(",", ".");

  const number = Number(normalized);

  if (Number.isNaN(number)) {
    return 0;
  }

  return number;
}


/* =========================================================
   EXTENSÃO DA IMAGEM
   ========================================================= */

function getImageExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}


/* =========================================================
   PÁGINA
   ========================================================= */

export default function NovoProdutoPage() {
  const router = useRouter();

  const supabase = useMemo(() => {
    return createClient();
  }, []);


  /* =======================================================
     PRODUTO
     ======================================================= */

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [sku, setSku] =
    useState("");

  const [costPrice, setCostPrice] =
    useState("");

  const [salePrice, setSalePrice] =
    useState("");

  const [stockQuantity, setStockQuantity] =
    useState("0");

  const [minimumStock, setMinimumStock] =
    useState("0");

  const [trackStock, setTrackStock] =
    useState(true);

  const [active, setActive] =
    useState(true);


  /* =======================================================
     FOTO
     ======================================================= */

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);


  /* =======================================================
     INTERFACE
     ======================================================= */

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");


  /* =======================================================
     LIMPAR URL TEMPORÁRIA
     ======================================================= */

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);


  /* =======================================================
     SELEÇÃO DA FOTO
     ======================================================= */

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setErrorMessage("");

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }


    /* -----------------------------------------------------
       Validar se realmente é imagem
       ----------------------------------------------------- */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      setErrorMessage(
        "Use uma imagem JPG, PNG ou WEBP."
      );

      event.target.value = "";
      return;
    }


    /* -----------------------------------------------------
       Limite de 5 MB
       ----------------------------------------------------- */

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setErrorMessage(
        "A foto deve ter no máximo 5 MB."
      );

      event.target.value = "";
      return;
    }


    /* -----------------------------------------------------
       Remover preview anterior
       ----------------------------------------------------- */

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }


    /* -----------------------------------------------------
       Criar preview
       ----------------------------------------------------- */

    const preview =
      URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(preview);
  }


  /* =======================================================
     REMOVER FOTO SELECIONADA
     ======================================================= */

  function removeImage() {
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImageFile(null);
    setImagePreview(null);
  }


  /* =======================================================
     SALVAR
     ======================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");


    /* -----------------------------------------------------
       Validações básicas
       ----------------------------------------------------- */

    const trimmedName =
      name.trim();

    if (trimmedName.length < 2) {
      setErrorMessage(
        "Digite o nome do produto."
      );

      setLoading(false);
      return;
    }


    const parsedCostPrice =
      parseMoney(costPrice);

    const parsedSalePrice =
      parseMoney(salePrice);

    const parsedStock =
      parseQuantity(stockQuantity);

    const parsedMinimumStock =
      parseQuantity(minimumStock);


    if (parsedCostPrice < 0) {
      setErrorMessage(
        "O preço de custo não pode ser negativo."
      );

      setLoading(false);
      return;
    }


    if (parsedSalePrice <= 0) {
      setErrorMessage(
        "Informe um preço de venda maior que zero."
      );

      setLoading(false);
      return;
    }


    if (
      trackStock &&
      parsedStock < 0
    ) {
      setErrorMessage(
        "O estoque não pode ser negativo."
      );

      setLoading(false);
      return;
    }


    if (
      trackStock &&
      parsedMinimumStock < 0
    ) {
      setErrorMessage(
        "O estoque mínimo não pode ser negativo."
      );

      setLoading(false);
      return;
    }


    /* =====================================================
       USUÁRIO
       ===================================================== */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();


    if (
      userError ||
      !user
    ) {
      setErrorMessage(
        "Sua sessão expirou. Entre novamente."
      );

      setLoading(false);
      return;
    }


    /* =====================================================
       EMPRESA
       ===================================================== */

    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("memberships")
      .select("organization_id")
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "status",
        "active"
      )
      .limit(1)
      .maybeSingle();


    if (
      membershipError ||
      !membership
    ) {
      console.error(
        membershipError
      );

      setErrorMessage(
        "Não foi possível identificar sua empresa."
      );

      setLoading(false);
      return;
    }


    /* =====================================================
       FOTO
       ===================================================== */

    let imagePath:
      | string
      | null = null;


    if (imageFile) {
      const extension =
        getImageExtension(
          imageFile
        );


      /*
       * Cada empresa possui sua própria pasta.
       *
       * Exemplo:
       *
       * uuid-da-empresa/
       *     uuid-da-foto.jpg
       */

      imagePath =
        `${membership.organization_id}/` +
        `${crypto.randomUUID()}.${extension}`;


      const {
        error: uploadError,
      } = await supabase.storage
        .from("product-images")
        .upload(
          imagePath,
          imageFile,
          {
            cacheControl: "3600",
            upsert: false,
            contentType:
              imageFile.type,
          }
        );


      if (uploadError) {
        console.error(
          "Erro no upload:",
          uploadError
        );

        setErrorMessage(
          `Não foi possível salvar a foto: ${uploadError.message}`
        );

        setLoading(false);
        return;
      }
    }


    /* =====================================================
       CADASTRAR PRODUTO
       ===================================================== */

    const {
      error: insertError,
    } = await supabase
      .from("products")
      .insert({
        organization_id:
          membership.organization_id,

        name:
          trimmedName,

        description:
          description.trim() ||
          null,

        sku:
          sku.trim() ||
          null,

        cost_price:
          parsedCostPrice,

        sale_price:
          parsedSalePrice,

        stock_quantity:
          trackStock
            ? parsedStock
            : 0,

        minimum_stock:
          trackStock
            ? parsedMinimumStock
            : 0,

        track_stock:
          trackStock,

        active,

        image_path:
          imagePath,
      });


    /* =====================================================
       SE PRODUTO FALHAR, REMOVER FOTO QUE SOBROU
       ===================================================== */

    if (insertError) {
      console.error(
        "Erro ao cadastrar produto:",
        insertError
      );


      if (imagePath) {
        await supabase.storage
          .from("product-images")
          .remove([
            imagePath,
          ]);
      }


      setErrorMessage(
        `Não foi possível cadastrar o produto: ${insertError.message}`
      );

      setLoading(false);
      return;
    }


    /* =====================================================
       CONCLUÍDO
       ===================================================== */

    router.push(
      "/app/produtos"
    );

    router.refresh();
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

          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h1 className="text-3xl font-bold text-white">
                Novo produto
              </h1>

              <p className="mt-2 text-sm text-muted">
                Cadastre um novo item para sua empresa.
              </p>

            </div>

            <Link
              href="/app/produtos"
              className="glass-button"
            >
              ← Voltar
            </Link>

          </div>

        </header>


        {/* =================================================
            FORMULÁRIO
        ================================================= */}

        <section className="glass-panel mt-6 p-6 sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >


            {/* =================================================
                FOTO
            ================================================= */}

            <div>

              <p className="text-sm font-semibold text-accent">
                Foto
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Imagem do produto
              </h2>

              <p className="mt-2 text-sm text-muted">
                Você pode fotografar o produto pelo celular
                ou escolher uma imagem da galeria.
              </p>


              <div className="mt-5">

                {!imagePreview ? (

                  <label className="glass-card flex min-h-[190px] cursor-pointer flex-col items-center justify-center p-6 text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl">
                      📷
                    </div>

                    <p className="mt-4 font-semibold text-white">
                      Fotografar produto
                    </p>

                    <p className="mt-2 text-xs text-muted">
                      Toque aqui para abrir a câmera
                      ou escolher uma foto
                    </p>


                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={
                        handleImageChange
                      }
                      className="hidden"
                    />

                  </label>

                ) : (

                  <div className="glass-card overflow-hidden">

                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">

                      <img
                        src={
                          imagePreview
                        }
                        alt="Prévia do produto"
                        className="h-full w-full object-cover"
                      />

                    </div>


                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="text-sm font-medium text-white">
                          Foto selecionada
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          {
                            imageFile?.name
                          }
                        </p>

                      </div>


                      <div className="flex flex-wrap gap-2">

                        <label className="glass-button cursor-pointer">

                          Trocar foto

                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={
                              handleImageChange
                            }
                            className="hidden"
                          />

                        </label>


                        <button
                          type="button"
                          onClick={
                            removeImage
                          }
                          className="glass-button"
                        >
                          Remover
                        </button>

                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>


            {/* =================================================
                INFORMAÇÕES
            ================================================= */}

            <div className="border-t border-white/10 pt-7">

              <p className="text-sm font-semibold text-accent">
                Informações básicas
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Identificação
              </h2>

            </div>


            <div className="grid gap-5 sm:grid-cols-2">


              <div className="sm:col-span-2">

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-white/90"
                >
                  Nome do produto *
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Coca-Cola 2L"
                  className="glass-input"
                />

              </div>


              <div>

                <label
                  htmlFor="sku"
                  className="mb-2 block text-sm font-medium text-white/90"
                >
                  Código / SKU
                </label>

                <input
                  id="sku"
                  type="text"
                  value={sku}
                  onChange={(event) =>
                    setSku(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: BEB-001"
                  className="glass-input"
                />

              </div>


              <div className="sm:col-span-2">

                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-white/90"
                >
                  Descrição
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Descrição do produto..."
                  rows={4}
                  className="glass-input resize-none"
                />

              </div>

            </div>


            {/* =================================================
                PREÇOS
            ================================================= */}

            <div className="border-t border-white/10 pt-7">

              <p className="text-sm font-semibold text-accent">
                Valores
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Preços
              </h2>


              <div className="mt-5 grid gap-5 sm:grid-cols-2">


                <div>

                  <label
                    htmlFor="costPrice"
                    className="mb-2 block text-sm font-medium text-white/90"
                  >
                    Preço de custo
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40">
                      R$
                    </span>

                    <input
                      id="costPrice"
                      type="text"
                      inputMode="decimal"
                      value={costPrice}
                      onChange={(event) =>
                        setCostPrice(
                          event.target.value
                        )
                      }
                      placeholder="0,00"
                      className="glass-input pl-11"
                    />

                  </div>

                </div>


                <div>

                  <label
                    htmlFor="salePrice"
                    className="mb-2 block text-sm font-medium text-white/90"
                  >
                    Preço de venda *
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40">
                      R$
                    </span>

                    <input
                      id="salePrice"
                      type="text"
                      inputMode="decimal"
                      value={salePrice}
                      onChange={(event) =>
                        setSalePrice(
                          event.target.value
                        )
                      }
                      placeholder="0,00"
                      className="glass-input pl-11"
                    />

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                ESTOQUE
            ================================================= */}

            <div className="border-t border-white/10 pt-7">

              <p className="text-sm font-semibold text-accent">
                Estoque
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Controle de quantidade
              </h2>


              <label className="glass-card mt-5 flex cursor-pointer items-center justify-between gap-4 p-4">

                <div>

                  <p className="font-medium text-white">
                    Controlar estoque
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Desative para refeições ou serviços.
                  </p>

                </div>


                <input
                  type="checkbox"
                  checked={
                    trackStock
                  }
                  onChange={(event) =>
                    setTrackStock(
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 accent-blue-500"
                />

              </label>


              {trackStock && (

                <div className="mt-5 grid gap-5 sm:grid-cols-2">


                  <div>

                    <label
                      htmlFor="stockQuantity"
                      className="mb-2 block text-sm font-medium text-white/90"
                    >
                      Estoque inicial
                    </label>

                    <input
                      id="stockQuantity"
                      type="text"
                      inputMode="decimal"
                      value={
                        stockQuantity
                      }
                      onChange={(event) =>
                        setStockQuantity(
                          event.target.value
                        )
                      }
                      placeholder="0"
                      className="glass-input"
                    />

                  </div>


                  <div>

                    <label
                      htmlFor="minimumStock"
                      className="mb-2 block text-sm font-medium text-white/90"
                    >
                      Estoque mínimo
                    </label>

                    <input
                      id="minimumStock"
                      type="text"
                      inputMode="decimal"
                      value={
                        minimumStock
                      }
                      onChange={(event) =>
                        setMinimumStock(
                          event.target.value
                        )
                      }
                      placeholder="0"
                      className="glass-input"
                    />

                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                STATUS
            ================================================= */}

            <div className="border-t border-white/10 pt-7">

              <label className="glass-card flex cursor-pointer items-center justify-between gap-4 p-4">

                <div>

                  <p className="font-medium text-white">
                    Produto ativo
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Produtos inativos ficam guardados,
                    mas não aparecem para venda.
                  </p>

                </div>


                <input
                  type="checkbox"
                  checked={
                    active
                  }
                  onChange={(event) =>
                    setActive(
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 accent-blue-500"
                />

              </label>

            </div>


            {/* =================================================
                ERRO
            ================================================= */}

            {errorMessage && (

              <div className="glass-error text-sm">
                {errorMessage}
              </div>

            )}


            {/* =================================================
                AÇÕES
            ================================================= */}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-7 sm:flex-row sm:justify-end">

              <Link
                href="/app/produtos"
                className="glass-button"
              >
                Cancelar
              </Link>


              <button
                type="submit"
                disabled={
                  loading
                }
                className="glass-button-primary min-w-[180px]"
              >

                {loading
                  ? "Salvando..."
                  : "Salvar produto"}

              </button>

            </div>

          </form>

        </section>

      </div>

    </main>
  );
}