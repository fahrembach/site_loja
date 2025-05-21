export interface Subcategory {
  name: string;
  slug: string;
}

export interface Category {
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

export const categories: Category[] = [
  { name: 'Produtos', slug: 'produtos', subcategories: [] },
  { name: 'SO CAIXA FECHADO', slug: 'so-caixa-fechado', subcategories: [] },
  { name: 'FONE', slug: 'fone', subcategories: [] },
];
