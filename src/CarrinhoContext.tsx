import React, { createContext, useContext, useState, useEffect } from "react";

// Estrutura mínima de produto no carrinho
export type CarrinhoItem = {
  nome: string;
  imagem?: string;
  preco?: string;
  quantidade: number;
  slug: string;
};

interface CarrinhoContextType {
  itens: CarrinhoItem[];
  adicionar: (item: CarrinhoItem) => void;
  remover: (slug: string) => void;
  limpar: () => void;
  total: number;
  alterarQuantidade: (slug: string, novaQuantidade: number) => void;
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error("useCarrinho só pode ser usado dentro do CarrinhoProvider");
  return ctx;
}

export const CarrinhoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [itens, setItens] = useState<CarrinhoItem[]>(() => {
    try {
      const ls = localStorage.getItem("carrinho");
      return ls ? JSON.parse(ls) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("carrinho", JSON.stringify(itens));
  }, [itens]);

  function adicionar(item: CarrinhoItem) {
    setItens((prev) => {
      const idx = prev.findIndex((i) => i.slug === item.slug);
      if (idx === -1) {
        return [...prev, { ...item, quantidade: 1 }];
      }
      const copia = [...prev];
      copia[idx].quantidade += 1;
      return copia;
    });
  }

  function remover(slug: string) {
    setItens((prev) => prev.filter((i) => i.slug !== slug));
  }

  function limpar() {
    setItens([]);
  }

  function alterarQuantidade(slug: string, novaQuantidade: number) {
    setItens((prev) =>
      prev.map(item =>
        item.slug === slug
          ? { ...item, quantidade: novaQuantidade < 1 ? 1 : novaQuantidade }
          : item
      )
    );
  }

  const total = itens.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <CarrinhoContext.Provider value={{ itens, adicionar, remover, limpar, total, alterarQuantidade }}>
      {children}
    </CarrinhoContext.Provider>
  );
};
