import React from "react";
import { useCarrinho } from "./CarrinhoContext";
import { Link } from "react-router-dom";
import { TrashIcon, ShoppingCartIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

export default function CarrinhoPage() {
  const { itens, remover, limpar, alterarQuantidade } = useCarrinho();
  const total = itens.reduce((acc, item) => {
    const precoNum = Number(String(item.preco || "").replace(/[^0-9,]/g, "").replace(",", "."));
    return acc + (precoNum || 0) * item.quantidade;
  }, 0);

  async function handleCheckout() {
    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itens
        }),
      });

      const data = await response.json();
      if (data.id) {
        window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?preference-id=${data.id}`;
      } else {
        alert('Erro ao criar preferência de pagamento');
      }
    } catch (error) {
      console.error('Erro ao processar checkout:', error);
      alert('Erro ao processar pagamento');
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-3 min-h-[66vh] text-[#2e2c45]">
      <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <ShoppingCartIcon className="h-8 w-8 text-[#6742db]" />
        Meu Carrinho
      </h1>
      {itens.length === 0 ? (
        <div className="flex flex-col gap-4 items-center mt-14 text-gray-400">
          <ShoppingCartIcon className="h-20 w-20 opacity-60" />
          <p className="text-lg font-semibold">Seu carrinho está vazio</p>
          <Link to="/produtos" className="bg-gradient-to-r from-[#6742db] to-[#14b8a6] hover:from-[#210f50] hover:to-[#6742db] py-2 px-6 rounded-lg text-white font-bold transition mt-2">Ver produtos</Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-6">
            {itens.map((item) => (
              <div key={item.slug} className="flex flex-col md:flex-row gap-4 items-center bg-[#f7f8fd] border border-[#ede8fd] rounded-xl py-4 px-4 group relative">
                {item.imagem && <img src={item.imagem} alt={item.nome} className="h-16 w-16 object-contain rounded-lg bg-white border mr-2 flex-shrink-0" />}
                <div className="flex-grow min-w-0 w-full">
                  <p className="font-bold text-[#3d2176] mb-1 truncate">{item.nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      className="p-2 rounded-full border border-[#eee] bg-white hover:bg-[#fafaff] disabled:opacity-60"
                      onClick={() => alterarQuantidade(item.slug, item.quantidade - 1)}
                      disabled={item.quantidade <= 1}
                    >
                      <MinusIcon className="h-5 w-5 text-[#6742db]" />
                    </button>
                    <span className="font-bold text-lg px-2">{item.quantidade}</span>
                    <button
                      className="p-2 rounded-full border border-[#eee] bg-white hover:bg-[#fafaff]"
                      onClick={() => alterarQuantidade(item.slug, item.quantidade + 1)}
                    >
                      <PlusIcon className="h-5 w-5 text-[#14b8a6]" />
                    </button>
                  </div>
                  <p className="text-[#ff7d1a] font-bold text-sm mt-1">{item.preco || '--'} cada</p>
                  <p className="text-xs text-[#7768b6] mt-1">
                    Subtotal: <span className="font-bold text-[#210f50]">R$ {((Number(String(item.preco||'').replace(/[^0-9,]/g,"").replace(",","."))||0)*item.quantidade).toFixed(2)}</span>
                  </p>
                </div>
                <button className="ml-3 text-[#6742db] hover:text-red-500" onClick={() => remover(item.slug)} title="Remover item">
                  <TrashIcon className="h-7 w-7"/>
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t pt-6 flex flex-col items-end gap-3">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-[#3d2176] text-lg">Total:</span>
              <span className="font-bold text-[#ff7d1a] text-xl">R$ {total.toFixed(2)}</span>
            </div>
            <button onClick={limpar} className="text-sm text-[#6742db] hover:underline mr-auto">Esvaziar carrinho</button>
            <button 
              onClick={handleCheckout}
              className="bg-gradient-to-r from-[#ff7d1a] to-[#ff9f37] hover:from-[#db6817] hover:to-[#ff7d1a] px-6 py-3 rounded-lg text-white font-extrabold tracking-wide shadow text-lg w-full"
            >
              Finalizar compra
            </button>
          </div>
        </>
      )}
    </div>
  );
}