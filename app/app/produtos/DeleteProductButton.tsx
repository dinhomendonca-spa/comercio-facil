"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
  imagePath: string | null;
};

export default function DeleteProductButton({
  productId,
  productName,
  imagePath,
}: DeleteProductButtonProps) {
  const router = useRouter();

  const supabase = useMemo(() => {
    return createClient();
  }, []);

  const [deleting, setDeleting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleDelete() {
    setErrorMessage("");

    /*
     * =====================================================
     * CONFIRMAÇÃO
     * =====================================================
     */

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${productName}"?\n\nEssa ação não poderá ser desfeita.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    /*
     * =====================================================
     * EXCLUIR PRODUTO DO BANCO
     * =====================================================
     */

    const { error: deleteError } =
      await supabase
        .from("products")
        .delete()
        .eq("id", productId);

    if (deleteError) {
      console.error(
        "Erro ao excluir produto:",
        deleteError
      );

      setErrorMessage(
        `Não foi possível excluir: ${deleteError.message}`
      );

      setDeleting(false);

      return;
    }

    /*
     * =====================================================
     * EXCLUIR FOTO DO STORAGE
     *
     * Fazemos isso depois que o banco confirmou
     * que o produto pode realmente ser excluído.
     * =====================================================
     */

    if (imagePath) {
      const { error: imageError } =
        await supabase.storage
          .from("product-images")
          .remove([imagePath]);

      if (imageError) {
        /*
         * Não impedimos a exclusão do produto caso
         * apenas a limpeza da imagem falhe.
         */

        console.error(
          "Produto removido, mas houve erro ao remover a foto:",
          imageError
        );
      }
    }

    /*
     * =====================================================
     * ATUALIZAR LISTA
     * =====================================================
     */

    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="
          inline-flex min-h-[42px]
          w-full items-center
          justify-center rounded-xl
          border border-red-300/20
          bg-red-500/10
          px-4 py-2
          text-sm font-medium
          text-red-200
          transition
          hover:bg-red-500/20
          hover:text-white
          active:opacity-60
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        {deleting
          ? "Excluindo..."
          : "🗑️ Excluir produto"}
      </button>

      {errorMessage && (
        <div className="mt-3 rounded-xl border border-red-300/20 bg-red-500/10 p-3 text-xs text-red-200">
          {errorMessage}
        </div>
      )}
    </div>
  );
}