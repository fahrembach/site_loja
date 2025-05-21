import React from "react";
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { DevicePhoneMobileIcon, AcademicCapIcon, ShoppingBagIcon, UserGroupIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import { HomeIcon, ArrowLeftIcon, PlusIcon, BoltIcon } from "@heroicons/react/24/solid";
import { categories } from "./data/categories";
import { CarrinhoProvider, useCarrinho } from "./CarrinhoContext";
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ToastProvider, useToast } from "./Toast";
import CarrinhoPage from "./CarrinhoPage";

// Utilitário para gerar slug
function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Hook para carregar produtos via fetch
function useProdutosData() {
  const [produtosData, setProdutosData] = React.useState<Record<string, any[]> | null>(null);
  React.useEffect(() => {
    fetch('/produtos.json')
      .then(r => r.ok ? r.json() : {})
      .then(setProdutosData)
      .catch(e => setProdutosData({}));
  }, []);
  return produtosData;
}

// Modern Tech Header (sticky, responsive, all routes)
function Header() {
  const { total } = useCarrinho();
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#210F50] via-[#6742DB] to-[#14B8A6] shadow-xl py-3 px-4 flex items-center gap-3">
      <RocketLaunchIcon className="h-8 w-8 text-white drop-shadow-lg" />
      <Link to="/" className="text-2xl font-extrabold tracking-tight text-white hover:text-[#14B8A6] transition-colors">
        Norte Sul Informática e Assessoria
      </Link>
      {/* MOBILE MENU BUTTON */}
      <button className="ml-auto md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#14B8A6]" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}>
        {menuOpen ? <XMarkIcon className="h-8 w-8 text-white"/> : <Bars3Icon className="h-8 w-8 text-white"/>}
      </button>
      {/* MENU DESKTOP */}
      <nav className="ml-auto hidden md:flex items-center gap-2">
        <Link to="/" className="text-white/90 font-semibold hover:text-[#FFD600] transition px-3 py-1 rounded-md">Home</Link>
        <Link to="/produtos" className="text-white/90 font-semibold hover:text-[#FFD600] transition px-3 py-1 rounded-md">Produtos</Link>
        <Link to="/planos" className="text-white/90 font-semibold hover:text-[#FFD600] transition px-3 py-1 rounded-md">Planos</Link>
        <Link to="/cursos" className="text-white/90 font-semibold hover:text-[#FFD600] transition px-3 py-1 rounded-md">Cursos</Link>
        <a href="https://wa.me/554896381223?text=Olá,%20quero%20falar%20com%20a%20Tech%20Floripa!" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-[#FFD600] font-semibold transition px-3 py-1 rounded-md">Contato</a>
        <div className="relative ml-4">
          <Link to="/carrinho" className="relative group focus:outline-none">
            <ShoppingCartIcon className="h-8 w-8 text-white drop-shadow-xl group-hover:text-[#FFD600] transition duration-150" />
            {total > 0 && <span className="absolute -top-2 -right-2 text-xs bg-[#ff7d1a] text-white rounded-full px-2 border border-white font-bold shadow">{total}</span>}
            <span className="sr-only">Abrir carrinho</span>
          </Link>
        </div>
      </nav>
      {/* MENU MOBILE: overlay e menu lateral */}
      {menuOpen && (
        <div className="fixed inset-0 z-[1050] flex">
          <div className="fixed inset-0 bg-black bg-opacity-20" onClick={() => setMenuOpen(false)}></div>
          <nav className="ml-auto bg-[rgb(33,15,80)] w-64 max-w-full min-h-full h-full flex flex-col gap-2 py-8 px-5 shadow-2xl">
            <Link to="/" className="text-white text-lg font-bold py-2 hover:text-[#14B8A6] rounded" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/produtos" className="text-white text-lg font-bold py-2 hover:text-[#14B8A6] rounded" onClick={() => setMenuOpen(false)}>Produtos</Link>
            <Link to="/planos" className="text-white text-lg font-bold py-2 hover:text-[#14B8A6] rounded" onClick={() => setMenuOpen(false)}>Planos</Link>
            <Link to="/cursos" className="text-white text-lg font-bold py-2 hover:text-[#14B8A6] rounded" onClick={() => setMenuOpen(false)}>Cursos</Link>
            <a href="https://wa.me/554896381223?text=Olá,%20quero%20falar%20com%20a%20Tech%20Floripa!" target="_blank" rel="noopener noreferrer" className="text-white text-lg font-bold py-2 hover:text-[#14B8A6] rounded">Contato</a>
            <div className="relative mt-6">
              <Link to="/carrinho" className="relative flex items-center gap-2 bg-[#14B8A6] rounded-lg px-4 py-2 text-white font-bold shadow hover:bg-[#0e868c]" onClick={() => setMenuOpen(false)}>
                <ShoppingCartIcon className="h-7 w-7" />
                Carrinho
                {total > 0 && <span className="absolute -top-2 -right-2 text-xs bg-[#ff7d1a] text-white rounded-full px-2 border border-white font-bold shadow">{total}</span>}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// --- Página individual de produto ---
function ProductPage() {
  const { slug } = useParams();
  const produtosData = useProdutosData();
  const navigate = useNavigate();
  const { adicionar } = useCarrinho();
  const toast = useToast();
  const [isAdding, setIsAdding] = React.useState(false);

  if (!produtosData) {
    return <div className="max-w-2xl mx-auto mt-12 font-bold text-[#820ad1]">Carregando produto...</div>;
  }
  // Procurar em todas as categorias
  let foundProduct = null;
  let foundCategory = null;
  let foundProdutosCategoria: any[] = [];
  for (const [cat, produtos] of Object.entries(produtosData)) {
    for (const produto of produtos as any[]) {
      if (slugify(produto.nome) === slug) {
        foundProduct = produto;
        foundCategory = cat;
        foundProdutosCategoria = produtos;
        break;
      }
    }
    if (foundProduct) break;
  }
  if (!foundProduct) return <div className="max-w-2xl mx-auto mt-12 font-bold text-red-600">Produto não encontrado.</div>;
  const p = foundProduct;
  // Sugestões: até 4 produtos aleatórios da mesma categoria (exceto produto atual)
  let sugestoes: any[] = [];
  if (foundProdutosCategoria.length > 1) {
    sugestoes = foundProdutosCategoria.filter(prod => prod !== p);
    sugestoes = sugestoes.sort(() => 0.5 - Math.random()).slice(0, 4);
  }

  function handleAddCarrinho() {
    setIsAdding(true);
    adicionar({ nome: p.nome, imagem: p.imagem, preco: p.preco, quantidade: 1, slug: slugify(p.nome) });
    toast("Produto adicionado ao carrinho!");
    setTimeout(() => setIsAdding(false), 1000);
  }

  function handleComprar() {
    alert("Ação de compra futura: integração com API de pagamentos");
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-20 bg-white rounded-xl shadow-lg">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#6742DB] border border-[#D1D6F6] bg-gradient-to-r from-white via-[#f7f8fd] to-[#e4e9fa] px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-[#f2f2fb] hover:scale-[1.03] hover:shadow transition-all"
      >
        <ArrowLeftIcon className="h-5 w-5 text-[#6742DB]" />
        Voltar para produtos
      </button>

      <h1 className="text-2xl font-extrabold text-[#3d2176] mb-1 mt-5">{p.nome}</h1>
      <span className="text-[#7c55de] text-sm font-semibold mb-2 inline-block">Categoria: {foundCategory}</span>
      {p.imagem && (
        <img src={p.imagem} alt={p.nome} className="h-40 mb-4 mx-auto object-contain rounded" />
      )}
      {p.preco && <p className="text-[#ff7d1a] text-xl font-bold mb-2">{p.preco}</p>}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <button
          className={`bg-[#14B8A6] hover:bg-[#0e868c] text-white font-bold py-3 px-6 rounded-lg shadow-md transition text-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2 w-full`}
          onClick={handleAddCarrinho}
          disabled={isAdding}
        >
          {isAdding ? 'Adicionando...' : 'Adicionar ao carrinho'}
        </button>
        <button
          onClick={handleComprar}
          className="flex items-center gap-2 bg-gradient-to-r from-[#ff7d1a] to-[#ff9f37] px-5 py-2 rounded-lg text-white font-bold shadow hover:from-[#db6817] hover:to-[#ff7d1a] hover:scale-[1.03] transition"
        >
          <BoltIcon className="h-5 w-5" />
          Comprar agora
        </button>
      </div>
      {p.descricaoLonga && <div className="mb-3 text-base"><strong className="block text-[#3d2176] text-lg mb-1">Descrição dos produtos</strong>{p.descricaoLonga}</div>}
      {p.fichaTecnica && Object.keys(p.fichaTecnica).filter(k => k.toLowerCase() !== 'garantia com a pauta').length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold text-lg mb-1">Informações Técnicas</h2>
          <table className="min-w-full text-sm">
            <tbody>
              {Object.entries(p.fichaTecnica).filter(([k]) => k.toLowerCase() !== 'garantia com a pauta').map(([k, v]) => (
                <tr key={k}>
                  <td className="pr-2 font-semibold text-[#510097] text-right whitespace-nowrap border-b border-[#f0f0f6] bg-[#f7f8fd] px-2 py-1">{k}</td>
                  <td className="pl-2 text-[#3d2176] border-b border-[#f0f0f6] bg-white px-2 py-1">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {sugestoes.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-[#6742db] text-lg mb-3">Você pode gostar também</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sugestoes.map((sp) => (
              <div key={sp.nome} className="border border-[#ede8fd] bg-gradient-to-br from-[#f7f8fd] to-[#e4e9fa] rounded-xl p-3 flex flex-col items-center shadow group hover:scale-[1.03] transition-all">
                {sp.imagem && <img src={sp.imagem} alt={sp.nome} className="h-20 mb-2 rounded-xl object-contain bg-[#fff]" />}
                <span className="font-bold text-[#3d2176] mb-1 text-center line-clamp-2">{sp.nome}</span>
                {sp.preco && <span className="text-[#ff7d1a] text-base font-bold">{sp.preco}</span>}
                <Link to={`/produto/${slugify(sp.nome)}`} className="mt-2 text-[#6742db] hover:underline text-sm">Ver produto</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Home estilo Vivo ---
function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e3e6ff] via-[#d3e2fd] to-[#edecf7]">
      <div className="h-20" />
      <section className="w-full flex flex-col items-center mt-2 px-4">
        <div className="max-w-2xl w-full bg-white/80 rounded-t-3xl shadow-xl p-6 pb-7 flex flex-col items-center border-x border-t border-[#eee]">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#3d2176] text-center tracking-tight leading-tight mb-3">
            Sua loja referência em Tecnologia em Florianópolis
          </h1>
          <p className="text-lg md:text-xl text-center text-[#555] mb-3 font-medium">
            Produtos, acessórios, montagem de PCs, celulares,<br className="hidden md:inline" />
            planos exclusivos e cursos para todas as idades!
          </p>
          <p className="text-center text-[#7c55de] font-semibold text-base">Há mais de 10 anos trazendo inovação, confiança e suporte para você.</p>
        </div>
      </section>
      <section className="max-w-5xl mx-auto w-full grid sm:grid-cols-2 md:grid-cols-4 gap-7 mt-7 px-2 relative">
        <Link
          to="/planos"
          className="group bg-white rounded-3xl shadow-xl border-2 border-[#eee] flex flex-col items-center py-9 px-3 hover:shadow-2xl hover:border-[#a786f7] transition relative z-10"
        >
          <UserGroupIcon className="h-12 w-12 text-[#820ad1] mb-3 group-hover:scale-110 transition" />
          <span className="font-bold text-lg text-[#5c2bb0] mb-1">Planos Tech</span>
          <span className="text-sm text-[#555] text-center mb-3">Suporte mensal e benefícios pra quem quer tranquilidade.</span>
          <div className="tech-alert-blink w-full rounded-b-2xl px-2 pt-3 pb-4 mt-auto animate-blink-tech">
            <span className="block text-white text-xs sm:text-sm font-semibold leading-tight text-center">
              Quilos e quilos de propaganda no celular, televisão complicada de mexer, computador lotado de vírus, filhos casaram, netos estão sempre ocupados, a idade chegou e você está cercado de tecnologia e ninguém para lhe ajudar com tantas encrenca tecnológicas.<br />
              <strong>Temos a solução e o plano ideal para você!</strong>
            </span>
          </div>
        </Link>
        <Link
          to="/produtos"
          className="group bg-white rounded-3xl shadow-xl border-2 border-[#eee] flex flex-col items-center py-9 px-3 hover:shadow-2xl hover:border-[#a786f7] transition"
        >
          <ShoppingBagIcon className="h-12 w-12 text-[#820ad1] mb-3 group-hover:scale-110 transition" />
          <span className="font-bold text-lg text-[#5c2bb0] mb-1">Comprar Produtos</span>
          <span className="text-sm text-[#555] text-center mb-3">Peças, celulares, acessórios e Monte Seu PC.</span>
          <div className="comprar-alert-blink w-full rounded-b-2xl px-2 pt-3 pb-4 mt-auto animate-blink-comprar">
            <span className="block text-white text-xs sm:text-sm font-semibold leading-tight text-center">
              Não perca! As melhores ofertas em tecnologia, acessórios e celulares estão aqui. Monte seu PC, renove seu smartphone, surpreenda-se com nossos preços e variedade.<br />
              <strong>Clique e aproveite antes que acabe!</strong>
            </span>
          </div>
        </Link>
        <Link
          to="/cursos"
          className="group bg-white rounded-3xl shadow-xl border-2 border-[#eee] flex flex-col items-center py-9 px-3 hover:shadow-2xl hover:border-[#a786f7] transition"
        >
          <AcademicCapIcon className="h-12 w-12 text-[#820ad1] mb-3 group-hover:scale-110 transition" />
          <span className="font-bold text-lg text-[#5c2bb0] mb-1">Cursos</span>
          <span className="text-sm text-[#555] text-center mb-3">Aprenda a usar tecnologia, celular e montar seu computador.</span>
          <div className="cursos-alert-blink w-full rounded-b-2xl px-2 pt-3 pb-4 mt-auto animate-blink-cursos">
            <span className="block text-white text-xs sm:text-sm font-semibold leading-tight text-center">
              Domine a tecnologia com nossos cursos! Aprenda de modo simples, prático e acessível.<br />
              <strong>Invista em conhecimento, garanta já sua vaga!</strong>
            </span>
          </div>
        </Link>
        <a
          href="https://wa.me/554896381223?text=Quero%20tirar%20uma%20dúvida%20ou%20fazer%20orçamento!"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white rounded-3xl shadow-xl border-2 border-[#eee] flex flex-col items-center py-9 px-3 hover:shadow-2xl hover:border-[#00d05a] transition"
        >
          <DevicePhoneMobileIcon className="h-12 w-12 text-[#00d05a] mb-3 group-hover:scale-110 transition" />
          <span className="font-bold text-lg text-[#009048] mb-1">Fale Conosco</span>
          <span className="text-sm text-[#555] text-center">Atendimento rápido via WhatsApp da loja.</span>
        </a>
      </section>
      <footer className="mt-20 py-8 w-full" id="contato">
        <div className="max-w-4xl mx-auto rounded-2xl shadow bg-white/80 px-8 py-6 text-center">
          <span className="text-[#820ad1] font-bold">Tech Floripa</span> &mdash; +10 anos de tradição em informática &bull; Centro, Florianópolis/SC<br />
          <span className="text-sm text-gray-500">Todos os direitos reservados &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          .animate-blink {
            animation: blink 1.1s infinite;
          }
          .speech-bubble-diag {
            background: #e53935;
            border-radius: 12px;
            border: 2.5px solid #b71c1c;
            box-shadow: 0 4px 24px 0 rgba(183, 28, 28, 0.16);
            display: inline-block;
            z-index: 20;
            position: relative;
          }
          .speech-bubble-tail-diag {
            position: absolute;
            left: 75%;
            bottom: -25px;
            transform: translateX(-50%) rotate(37deg);
            width: 0;
            height: 0;
            border-left: 16px solid transparent;
            border-right: 16px solid transparent;
            border-top: 25px solid #e53935;
            filter: drop-shadow(0 2px 2px #b71c1c44);
          }
          @keyframes blink-tech {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.57; }
          }
          .animate-blink-tech {
            animation: blink-tech 1.2s infinite;
          }
          .tech-alert-blink {
            background: #e53935;
            margin-top: 14px;
            border-bottom-left-radius: 1.5rem;
            border-bottom-right-radius: 1.5rem;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            min-height: 108px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @keyframes blink-comprar {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.62; }
          }
          .animate-blink-comprar {
            animation: blink-comprar 1.2s infinite;
          }
          .comprar-alert-blink {
            background: #ff9800;
            margin-top: 14px;
            border-bottom-left-radius: 1.5rem;
            border-bottom-right-radius: 1.5rem;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            min-height: 108px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @keyframes blink-cursos {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.60; }
          }
          .animate-blink-cursos {
            animation: blink-cursos 1.2s infinite;
          }
          .cursos-alert-blink {
            background: #00c484;
            margin-top: 14px;
            border-bottom-left-radius: 1.5rem;
            border-bottom-right-radius: 1.5rem;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            min-height: 108px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @media (max-width: 640px) {
            .tech-alert-blink,
            .comprar-alert-blink,
            .cursos-alert-blink { min-height: 96px; padding-bottom: 0.5rem; }
            .animate-blink-tech,
            .animate-blink-comprar,
            .animate-blink-cursos { animation-duration: 1s; }
            .tech-alert-blink span,
            .comprar-alert-blink span,
            .cursos-alert-blink span { font-size: 0.95em; }
          }
        `}
      </style>
    </div>
  );
}

// --- Produtos com menu superior de categorias (com 'Todos') ---
function Produtos() {
  const produtosData = useProdutosData();
  const navigate = useNavigate();
  const [categoriaAtual, setCategoriaAtual] = React.useState('todos');
  const [ordenarPor, setOrdenarPor] = React.useState('Mais relevantes');

  // Lista todas as categorias do arquivo + 'Todos'
  const categoriasComTodos = [
    { name: 'Todos', slug: 'todos', subcategories: [] },
    ...categories,
  ];

  if (!produtosData) {
    return <div className="py-20 text-center text-lg font-bold text-[#820ad1]">Carregando produtos...</div>;
  }

  let produtos = [];
  if (categoriaAtual === 'todos') {
    produtos = Object.values(produtosData).flat();
  } else {
    const categoriaObj = categories.find(c => c.slug === categoriaAtual);
    if (categoriaObj) {
      produtos = produtosData[categoriaObj.name] || [];
    }
  }

  if (ordenarPor === "Menor preço") {
    produtos = [...produtos].sort((a, b) => {
      const pa = Number.parseFloat((a.preco || "0").replace(/[^\d,]/g, '').replace(',', '.'));
      const pb = Number.parseFloat((b.preco || "0").replace(/[^\d,]/g, '').replace(',', '.'));
      return pa - pb;
    });
  } else if (ordenarPor === "Maior preço") {
    produtos = [...produtos].sort((a, b) => {
      const pa = Number.parseFloat((a.preco || "0").replace(/[^\d,]/g, '').replace(',', '.'));
      const pb = Number.parseFloat((b.preco || "0").replace(/[^\d,]/g, '').replace(',', '.'));
      return pb - pa;
    });
  } else if (ordenarPor === "Nome") {
    produtos = [...produtos].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }

  const menu = (
    <div className="flex flex-wrap gap-3 w-full overflow-x-auto pb-2">
      {categoriasComTodos.map(cat => (
        <button
          key={cat.slug}
          onClick={() => setCategoriaAtual(cat.slug)}
          className={`py-2 px-4 rounded-lg font-bold text-[15px] shadow-sm border-b-2 transition whitespace-nowrap ${
            categoriaAtual === cat.slug ? 'bg-[#ff7d1a] text-white border-[#ff7d1a]' : 'bg-white border-[#fff0e1] text-[#ff7d1a] hover:bg-[#ffeadc]'}
        `}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-2 md:px-4 py-10" id="categorias">
      <div id="menu-categorias-superior" className="mb-8">{menu}</div>
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
        <span className="text-[#333] font-semibold text-lg">Produtos</span>
        <div className="flex gap-2 items-center">
          <span className="text-[#888] text-sm mr-1">Ordenar por:</span>
          <select value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)} className="rounded border border-[#ffe1ce] p-1 px-2 text-sm">
            <option>Mais relevantes</option>
            <option>Menor preço</option>
            <option>Maior preço</option>
            <option>Nome</option>
          </select>
        </div>
      </div>
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
        {produtos.length === 0 && (
          <div className="text-[#ff7d1a] text-lg col-span-full text-center py-14 font-bold">Nenhum produto encontrado.</div>
        )}
        {produtos.map((produto, i) => (
          <div key={produto.nome + i} className="flex flex-col bg-white rounded-xl shadow border-2 border-[#fff0e5] hover:shadow-lg transition group p-5 relative overflow-hidden">
            <Link to={`/produto/${slugify(produto.nome)}`} className="absolute inset-0 z-10" aria-label="Ver detalhes do produto" />
            {produto.imagem ? (
              <img src={produto.imagem} alt={produto.nome} className="mb-2 h-24 w-auto mx-auto object-contain" loading="lazy" />
            ) : (
              <ShoppingBagIcon className="text-[#ff7d1a] w-10 h-10 mx-auto mb-2" />
            )}
            <div className="font-bold text-base text-[#222] mb-1 text-center group-hover:text-[#ff5722] h-9 flex items-center justify-center">{produto.nome}</div>
            <div className="mb-3 text-xl font-black text-[#ff5722] text-center">{produto.preco}</div>
            <a href={`https://wa.me/554896381223?text=Tenho%20interesse%20em%20${encodeURIComponent(produto.nome)}!`} target="_blank" rel="noopener noreferrer"
              className="bg-[#ff7d1a] hover:bg-[#ff5722] text-white rounded-full px-3 py-2 font-bold text-center text-sm shadow w-full">Comprar / Fale conosco</a>
          </div>
        ))}
      </div>
    </div>
  );
}

// Planos dados
const plans = [
  {
    slug: "basico",
    name: "Básico",
    price: "89,00",
    features: [
      "Suporte para tirar dúvidas online ou na loja: 1 hora por mês (não acumulativo)",
      "Serviço de impressão: até 40 páginas no mês",
    ],
    description: (
      <div>
        <p className="text-lg text-gray-700">O plano Básico é ideal para quem precisa de suporte simples e acessível. Com ele, você terá <strong>1 hora por mês</strong> para tirar dúvidas sobre qualquer assunto tecnológico.</p>
        <h3 className="text-xl font-semibold mt-4">O que inclui?</h3>
        <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700">
          <li><strong>Suporte para tirar dúvidas:</strong> Online ou na loja (1 hora/mês).</li>
          <li><strong>Serviço de impressão:</strong> Até 40 páginas por mês.</li>
        </ul>
        <h3 className="text-xl font-semibold mt-4">Exemplos de dúvidas que podemos resolver:</h3>
        <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700">
          <li>Como enviar fotos pelo WhatsApp.</li>
          <li>Como criar um backup do celular.</li>
          <li>Como conectar o celular à TV.</li>
        </ul>
      </div>
    ),
  },
  {
    slug: "intermediario",
    name: "Intermediário",
    price: "119,00",
    features: [
      "Suporte para tirar dúvidas online ou na loja: 2 horas por mês (não acumulativo)",
      "20% de desconto em manutenção",
      "Desconto em película protetora",
    ],
    description: (
      <div>
        <p className="text-lg text-gray-700">
          O plano Intermediário oferece mais tempo para suporte e vantagens exclusivas. Com <strong>2 horas por mês</strong>, você pode sanar todas as suas dúvidas sem se preocupar.</p> <h3 className="text-xl font-semibold mt-4">O que inclui?</h3><ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700"><li><strong>Suporte para tirar dúvidas:</strong> Online ou na loja (2 horas/mês).</li><li><strong>Desconto em manutenção:</strong> Ganhe 20% de desconto.</li><li><strong>Desconto em película:</strong> Preço especial.</li></ul>
        <h3 className="text-xl font-semibold mt-4">Exemplos de dúvidas que podemos resolver:</h3><ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700"><li>Como organizar arquivos no computador.</li><li>Como usar aplicativos de streaming.</li><li>Como fazer videochamadas com os netos.</li></ul>
      </div>
    ),
  },
  {
    slug: "avancado",
    name: "Avançado",
    price: "199,00",
    features: [
      "Suporte domiciliar: 2 horas por mês (não acumulativo)",
      "Suporte para tirar dúvidas online ou na loja: 2 horas por mês (não acumulativo)",
      "20% de desconto em película e capinha",
      "20% de desconto em manutenção",
      "10% de desconto em aulas adicionais",
    ],
    description: (
      <div>
        <p className="text-lg text-gray-700">O plano Avançado é perfeito para quem busca tranquilidade e praticidade. Com <strong>suporte domiciliar</strong> e mais benefícios, você não precisa sair de casa para resolver seus problemas.</p><h3 className="text-xl font-semibold mt-4">O que inclui?</h3><ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700"><li><strong>Suporte domiciliar:</strong> Atendimento em casa (2 horas/mês).</li><li><strong>Suporte para tirar dúvidas:</strong> Online ou na loja (2 horas/mês).</li><li><strong>Descontos exclusivos:</strong> Película, capinha, manutenção e aulas adicionais.</li></ul><h3 className="text-xl font-semibold mt-4">Exemplos de dúvidas que podemos resolver:</h3><ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700"><li>Como instalar programas no computador.</li><li>Como enviar fotos para os familiares pelo WhatsApp ou email.</li><li>Como gerenciar contas bancárias online.</li></ul>
      </div>
    ),
  },
  {
    slug: "vip",
    name: "VIP",
    price: "250,00",
    features: [
      "Suporte domiciliar: 4 horas por mês (não acumulativo)",
      "Suporte para tirar dúvidas online ou na loja: 5 horas por mês (não acumulativo)",
      "Serviço de impressão: até 50 páginas por mês",
      "20% de desconto em película e capinha",
      "20% de desconto em manutenção",
      "10% de desconto em aulas adicionais",
      "Atendimento preferencial",
    ],
    description: (
      <div>
        <p className="text-lg text-gray-700">O plano VIP é a solução definitiva para quem quer o melhor atendimento possível. Com <strong>4 horas de suporte domiciliar</strong> e benefícios exclusivos, você terá toda a assistência que precisa.</p><h3 className="text-xl font-semibold mt-4">O que inclui?</h3><ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700"><li><strong>Suporte domiciliar:</strong> Resolvemos todos os seus problemas diretamente em sua casa (4 horas/mês).</li><li><strong>Suporte para tirar dúvidas:</strong> Online ou na loja (5 horas/mês).</li><li><strong>Serviço de impressão:</strong> Até 50 páginas por mês.</li><li><strong>Descontos exclusivos:</strong> Película, capinha, manutenção e aulas adicionais.</li><li><strong>Atendimento preferencial:</strong> Sem filas!</li></ul><h3 className="text-xl font-semibold mt-4">Exemplos de dúvidas que podemos resolver:</h3><ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700"><li>Como montar uma apresentação no PowerPoint para compartilhar com a família.</li><li>Como enviar fotos para os familiares pelo WhatsApp ou email.</li><li>Como fazer videochamadas com os netos usando aplicativos como Zoom ou WhatsApp.</li></ul>
      </div>
    ),
  },
];

const cursos = [
  {
    nome: "Windows para Iniciantes",
    descricao: "Saiba o básico para usar o computador sem medo.",
  },
  {
    nome: "Descomplicando Android",
    descricao: "Entenda como usar seu smartphone e todos seus aplicativos.",
  },
  {
    nome: "Montagem de Computadores",
    descricao: "Aprenda como escolher e montar seu próprio PC.",
  },
];

function PlanosList() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-t from-indigo-50 via-white to-violet-100 flex flex-col items-center p-4">
      <button
        className="flex items-center gap-2 self-start bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg mt-3 mb-4 transition focus:outline-none focus:ring focus:ring-violet-300"
        onClick={() => navigate("/")}
      >
        <HomeIcon className="w-5 h-5 -ml-1" /> Home
      </button>
      <header className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-6 mb-8">
        <h1 className="text-4xl font-black text-center text-violet-700 mb-2 tracking-tight">Nossos Planos</h1>
        <p className="text-xl text-center text-violet-800">Assessoria mensal, descontos exclusivos e tranquilidade.</p>
      </header>
      <div className="w-full max-w-5xl grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.slug}
            className="rounded-2xl bg-white shadow-xl border border-violet-200 hover:-translate-y-2 hover:shadow-2xl transition p-6 flex flex-col min-h-[370px] justify-between"
            style={{boxShadow: "0 4px 28px 0 #8f5ef880, 0 1.5px 2px #a78bfa33"}}
          >
            <div>
              <h2 className="text-2xl font-bold text-violet-700 mb-2 text-center">{plan.name}</h2>
              <p className="text-2xl text-violet-900 font-black text-center mb-2">R$ {plan.price}<span className="text-base font-semibold">/mês</span></p>
              <ul className="list-none flex flex-col gap-1 mb-3 text-gray-700 text-base">
                {plan.features.map((feature) => (
                  <li key={feature} className="bg-violet-50 text-violet-700 rounded pl-2 py-1 text-base border-l-4 border-violet-200 flex items-center">{feature}</li>
                ))}
              </ul>
            </div>
            <Link
              to={`/planos/${plan.slug}`}
              className="block bg-gradient-to-tr from-violet-700 to-violet-500 hover:from-violet-800 hover:to-violet-600 transition text-white text-center font-bold py-3 px-6 rounded-xl mt-4 shadow-lg"
            >
              Saiba Mais
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function CursoList() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-t from-blue-50 via-white to-indigo-50 flex flex-col items-center p-4">
      <button
        className="flex items-center gap-2 self-start bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg mt-3 mb-4 transition focus:outline-none focus:ring focus:ring-blue-300"
        onClick={() => navigate("/")}
      >
        <HomeIcon className="w-5 h-5 -ml-1" /> Home
      </button>
      <div className="w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-indigo-700 mb-7">Cursos presenciais e online</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {cursos.map((curso) => (
            <div key={curso.nome} className="bg-white rounded-2xl shadow-xl border border-indigo-200 hover:-translate-y-2 hover:shadow-2xl transition p-6 flex flex-col justify-between min-h-[200px]">
              <div>
                <h3 className="text-xl font-bold text-indigo-700 mb-2">{curso.nome}</h3>
                <p className="text-gray-800 mb-2">{curso.descricao}</p>
              </div>
              <a
                href="https://wa.me/554896381223?text=Tenho%20interesse%20neste%20curso!"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gradient-to-tr from-indigo-600 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 transition text-white font-bold text-center py-2 px-5 rounded-xl mt-2 shadow"
              >
                Saber Mais
              </a>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a
            href="https://wa.me/554896381223?text=Gostaria%20de%20saber%20mais%20sobre%20os%20cursos!"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white font-bold py-2 px-6 rounded hover:bg-green-600 shadow-lg"
          >
            Consultar outros cursos pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function Plano() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const plan = plans.find((p) => p.slug === slug);
  if (!plan) return <div className="p-8 text-2xl">Plano não encontrado!</div>;
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="flex flex-row flex-wrap items-center gap-2 mb-4 w-full max-w-3xl">
        <button
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-xl shadow focus:outline-none focus:ring focus:ring-violet-300"
          onClick={() => navigate("/")}
        >
          <HomeIcon className="w-5 h-5 -ml-1" /> Home
        </button>
        <button
          className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-4 py-2 rounded-xl shadow"
          onClick={() => navigate(-1)}
        >
          Voltar
        </button>
      </div>
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-semibold text-indigo-600 mb-2">{plan.name}</h2>
        <p className="text-2xl font-bold text-gray-800 mb-4">R$ {plan.price}/mês</p>
        <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700 mb-6">
          {plan.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <div>{plan.description}</div>
        <div className="flex justify-end mt-8">
          <button
            className="bg-[#5c2bb0] hover:bg-[#7a3af5] text-white font-bold px-8 py-3 rounded-lg text-lg shadow transition-all"
            onClick={async () => {
              const planTitle = plan.name + ' – Fidelidade 6 meses';
              const planDesc = `Assinatura mensal Mercado Pago, fidelidade 6 meses: ${plan.name}`;
              const priceNumber = Number(plan.price.replace(/,/g, '.'));
              if (isNaN(priceNumber)) {
                alert('Preço inválido!');
                return;
              }
              try {
                // Chama backend local para criar preapproval
                const resp = await fetch('/api/create-preapproval', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ planName: planTitle, planDesc, price: priceNumber }),
                });
                if (!resp.ok) throw new Error(await resp.text());
                const data = await resp.json();
                if (data.init_point) {
                  window.location.href = data.init_point;
                } else {
                  alert('Erro ao redirecionar (assinatura Mercado Pago)!');
                }
              } catch (e: any) {
                alert('Erro ao processar assinatura Mercado Pago! ' + e.message);
              }
            }}
          >
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <CarrinhoProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/produto/:slug" element={<ProductPage />} />
            <Route path="/planos" element={<PlanosList />} />
            <Route path="/planos/:slug" element={<Plano />} />
            <Route path="/cursos" element={<CursoList />} />
            <Route path="/carrinho" element={<CarrinhoPage />} />
          </Routes>
        </Router>
      </CarrinhoProvider>
    </ToastProvider>
  );
}
