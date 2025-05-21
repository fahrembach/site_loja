import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// NOVO: URL base do Luiz Eletrônicos
const BASE_URL = 'https://www.luizeletronicos.com.br/';
const OUTPUT_PATH = path.resolve(__dirname, '../public/produtos.json');

// Função utilitária para baixar uma página
async function fetchPage(url: string): Promise<string> {
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LuizBot/1.0)',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    timeout: 30000,
  });
  return res.data;
}

// NOVO: buscar todas as categorias e subcategorias do menu do Luiz Eletrônicos
async function getCategoriesLuiz(baseUrl: string): Promise<{ nome: string; url: string }[]> {
  const html = await fetchPage(baseUrl);
  const $ = cheerio.load(html);
  const categorias: { nome: string; url: string }[] = [];
  // No menu, todos links para categorias começam com /t/produtos
  $("a[href^='/t/produtos']").each((_, el) => {
    const url = $(el).attr('href');
    const nome = $(el).text().replace(/\s+/g, ' ').trim();
    // Ignorar categorias duplicadas e inválidas
    if (url && nome && !categorias.some(c => c.url === 'https://www.luizeletronicos.com.br' + url)) {
      categorias.push({ nome, url: 'https://www.luizeletronicos.com.br' + url });
    }
  });
  return categorias;
}

// Função auxiliar para garantir URL absoluta
function absolutizeUrlLuiz(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return 'https://www.luizeletronicos.com.br' + url;
  }
  return 'https://www.luizeletronicos.com.br/' + url.replace(/^\/+/, '');
}

// NOVO: Extração de detalhes do produto Luiz Eletrônicos (descrição longa e ficha técnica)
async function getProductDetailsLuiz(productUrl: string): Promise<any> {
  try {
    const html = await fetchPage(productUrl);
    const $ = cheerio.load(html);

    // Descrição longa: geralmente em .descricao-produto ou .product-description
    let descricaoLonga = $('.descricao-produto').text().trim() ||
                         $('.product-description').text().trim() ||
                         $('meta[name="description"]').attr('content')?.trim() || '';

    // Ficha técnica: tabela com th/td ou dt/dd
    const fichaTecnica: Record<string, string> = {};
    // Tabela tradicional
    $('.tabela-ficha-tecnica tr').each((_, tr) => {
      const th = $(tr).find('th').text().trim();
      const td = $(tr).find('td').text().trim();
      if (th && td) fichaTecnica[th] = td;
    });
    // Alternativa: lista de dt/dd
    $('.ficha-tecnica dt').each((i, dt) => {
      const key = $(dt).text().trim();
      const value = $(dt).next('dd').text().trim();
      if (key && value) fichaTecnica[key] = value;
    });

    return { descricaoLonga, fichaTecnica };
  } catch (err) {
    console.warn(`[WARN] Erro ao extrair detalhes: ${productUrl}`);
    return { descricaoLonga: '', fichaTecnica: {} };
  }
}

// NOVO: Scraping de produtos de uma categoria Luiz Eletrônicos (com paginação)
async function getProductsFromCategoryLuiz(catUrl: string): Promise<any[]> {
  let produtos: any[] = [];
  let page = 1;
  let existeProximaPagina = true;
  let baseUrl = catUrl.split('?')[0];

  while (existeProximaPagina) {
    const urlAtual = page === 1 ? baseUrl : `${baseUrl}?pagina=${page}`;
    const html = await fetchPage(urlAtual);
    const $ = cheerio.load(html);
    let encontrados = 0;

    // Buscar produtos por blocos reais do HTML Luiz
    $(".product-card").each((_, card) => {
      // Imagem
      let urlImg = '';
      const imgEl = $(card).find('a.product-card__image-frame img').first();
      if (imgEl.length) {
        urlImg = imgEl.attr('src') || imgEl.attr('data-src') || '';
        if (urlImg) urlImg = absolutizeUrlLuiz(urlImg);
      }
      // Nome
      const nome = $(card).find('h3.product-card__name').first().text().trim();
      // Link
      let urlProduto = $(card).find('a.product-card__detail-link').first().attr('href') || '';
      if (urlProduto) urlProduto = absolutizeUrlLuiz(urlProduto);
      // Preço
      let preco = $(card).find('.inline-buy__price').first().text().replace(/\s+/g, ' ').replace(/\s*\/.*$/, '').trim();
      // SKU (opcional)
      const sku = $(card).find('.product-card__sku').first().text().trim();
      // Descrição curta
      const descricao = sku ? sku : '';
      if (nome && urlProduto) {
        produtos.push({ nome, preco, imagem: urlImg, descricao, url: urlProduto });
      }
    });

    console.log(`[LOG] Página ${page}: Produtos encontrados: ${produtos.length}`);

    // Detecta se existe próxima página (paginador com links ?pagina=)
    let maiorPagina = page;
    $("a[href*='?pagina=']").each((_, a) => {
      const href = $(a).attr('href');
      const match = href && href.match(/pagina=(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maiorPagina) maiorPagina = num;
      }
    });
    if (maiorPagina > page) {
      page++;
      existeProximaPagina = true;
    } else {
      existeProximaPagina = false;
    }
  }

  if (produtos.length === 0) {
    console.warn(`[WARN] Nenhum produto extraído nesta categoria: ${catUrl}`);
  } else {
    produtos.slice(0, 5).forEach(p => console.log(`[LOG] Produto exemplo: ${p.nome} - ${p.url}`));
  }

  // Extração de detalhes
  let loteCount = 0;
  for (let i = 0; i < produtos.length; i++) {
    const produto = produtos[i];
    const detalhes = await getProductDetailsLuiz(produto.url);
    produto.descricaoLonga = detalhes.descricaoLonga;
    produto.fichaTecnica = detalhes.fichaTecnica;
    loteCount++;
    if (loteCount === 10 || i === produtos.length - 1) {
      // Salva progresso incremental
      if (!(globalThis as any)._produtosTemp) (globalThis as any)._produtosTemp = [];
      (globalThis as any)._produtosTemp = produtos.slice(0, i + 1);
      // Salva em disco um arquivo temporário para garantir o progresso
      fs.writeFileSync(
        OUTPUT_PATH.replace('.json', '_parcial.json'),
        JSON.stringify((globalThis as any)._produtosTemp, null, 2),
        'utf8'
      );
      loteCount = 0;
      if (i !== produtos.length - 1) {
        console.log('[LOG] Pausa curta de 10 segundos para evitar bloqueio...');
        await sleep(10000);
      }
    }
  }
  return produtos.map(p => ({
    nome: p.nome,
    preco: p.preco,
    imagem: p.imagem,
    url: p.url,
    descricao: p.descricao,
    descricaoLonga: p.descricaoLonga,
    fichaTecnica: p.fichaTecnica
  }));
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Função com contagem regressiva para pausa customizada
async function countdownPause(seconds: number) {
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(`\r[PAUSA] Aguardando ${i}s... `);
    await sleep(1000);
  }
  process.stdout.write("\r[Pausa concluída, retomando extração!   ]\n");
}

async function main() {
  console.log('Coletando categorias/subcategorias do Luiz Eletrônicos...');
  const allCats = await getCategoriesLuiz(BASE_URL);
  const produtosPorCategoria: Record<string, any[]> = {};
  let countSincePause = 0;
  for (const c of allCats) {
    console.log(`-- Lendo produtos de: ${c.nome}`);
    try {
      const produtos = await getProductsFromCategoryLuiz(c.url);
      produtosPorCategoria[c.nome] = produtos;
      // Salva incrementalmente após cada categoria
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(produtosPorCategoria, null, 2), 'utf8');
      countSincePause++;
      if (countSincePause >= 7) {
        console.log('[LOG] Pausa de 35 segundos para evitar bloqueio IP e salvar progresso...');
        await countdownPause(35);
        countSincePause = 0;
      }
    } catch (err) {
      console.error(`Falha ao buscar ${c.url}`, err);
    }
  }
  // Salvar final (garantia extra)
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(produtosPorCategoria, null, 2), 'utf8');
  console.log('Produtos salvos em', OUTPUT_PATH);
}

main();
