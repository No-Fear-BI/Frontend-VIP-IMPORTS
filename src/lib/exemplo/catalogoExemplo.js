// Catálogo fictício do modo "exemplo". Formatos idênticos aos esquemas do backend
// (src/vip_api/esquemas/*.py). Imagens em public/exemplo/, geradas por
// scripts/gerar-ilustracoes-exemplo.mjs.

const img = (nome) => `/exemplo/produtos/${nome}.svg`;

export const colecoes = [
  { id: 1, nome: 'Feminina', slug: 'feminino' },
  { id: 2, nome: 'Masculina', slug: 'masculino' },
];

export const marcas = [
  { id: 1, nome: 'Chanel', slug: 'chanel', logoUrl: null },
  { id: 2, nome: 'Louis Vuitton', slug: 'louis-vuitton', logoUrl: null },
  { id: 3, nome: 'Gucci', slug: 'gucci', logoUrl: null },
  { id: 4, nome: 'Prada', slug: 'prada', logoUrl: null },
  { id: 5, nome: 'Dior', slug: 'dior', logoUrl: null },
  { id: 6, nome: 'Saint Laurent', slug: 'saint-laurent', logoUrl: null },
  { id: 7, nome: 'Balenciaga', slug: 'balenciaga', logoUrl: null },
  { id: 8, nome: 'Ray-Ban', slug: 'ray-ban', logoUrl: null },
];

// [id, publicoSlug, nome, slug, desenho] — o público aqui só diz a quem cada produto de exemplo se
// destina; desde a migração 0015 a categoria em si não tem coleção e "Bolsas" existe uma vez só.
const categoriasBrutas = [
  [1, 'feminino', 'Bolsas', 'bolsas', 'bolsas'],
  [2, 'feminino', 'Calçados', 'calcados', 'calcados'],
  [3, 'feminino', 'Óculos', 'oculos', 'acessorios'],
  [4, 'feminino', 'Perfumes', 'perfumes', 'perfumes'],
  [5, 'feminino', 'Carteiras', 'carteiras', 'carteiras'],
  [6, 'masculino', 'Camisas', 'camisas', 'camisas'],
  [7, 'masculino', 'Relógios', 'relogios', 'relogios'],
  [8, 'masculino', 'Cintos', 'cintos', 'cintos'],
  [9, 'masculino', 'Calçados', 'calcados', 'calcados'],
  [10, 'masculino', 'Bolsas', 'bolsas', 'bolsas'],
];

// Categorias únicas por slug (a primeira ocorrência vence): "Calçados" e "Bolsas" estavam nas duas coleções.
export const categorias = categoriasBrutas
  .filter(([, , , slug], i, todas) => todas.findIndex((c) => c[3] === slug) === i)
  .map(([id, , nome, slug, desenho]) => ({
    id,
    nome,
    slug,
    imagemUrl: `/exemplo/categorias/${desenho}.svg`,
  }));

const idDaCategoriaPorSlug = (slug) => categorias.find((c) => c.slug === slug).id;

export const nomeDoPublico = (publicos) =>
  publicos.length > 1 ? 'Unissex' : publicos[0] === 'feminino' ? 'Feminina' : 'Masculina';
export const slugDoPublico = (publicos) => (publicos.includes('feminino') ? 'feminino' : 'masculino');

// Produtos de exemplo que são unissex (aparecem em Feminino e em Masculino).
const UNISSEX = new Set(['R902']);

const TAMANHOS_ROUPA = ['P', 'M', 'G', 'GG'];
const TAMANHOS_CALCADO = ['35', '36', '37', '38', '39', '40', '41', '42'];

// [codigo, nome, marcaSlug, categoriaId, desenho, status, variações?]
const produtosBrutos = [
  ['X030', 'Bolsa Clássica Aba Dupla', 'chanel', 1, 'bolsa-corrente', 'normal', { cores: ['Preto', 'Bege'] }],
  ['L114', 'Bolsa Tote Monograma', 'louis-vuitton', 1, 'bolsa', 'normal', { cores: ['Marrom'] }],
  ['G207', 'Scarpin Salto Fino', 'gucci', 2, 'scarpin', 'normal', { tamanhos: TAMANHOS_CALCADO.slice(0, 6), cores: ['Preto', 'Nude'] }],
  ['P088', 'Óculos Gatinho Acetato', 'prada', 3, 'oculos', 'normal', {}],
  ['D301', 'Eau de Parfum 100 ml', 'dior', 4, 'perfume', 'normal', {}],
  ['S045', 'Carteira Envelope Couro', 'saint-laurent', 5, 'carteira', 'esgotado', { cores: ['Preto'] }],
  ['C512', 'Bolsa Tiracolo Matelassê', 'chanel', 1, 'bolsa-corrente', 'normal', { cores: ['Branco', 'Preto'] }],
  ['G118', 'Camisa Seda Estampada', 'gucci', 6, 'camisa', 'normal', { tamanhos: TAMANHOS_ROUPA }],
  ['R902', 'Óculos Aviador Metal', 'ray-ban', 3, 'oculos', 'normal', { cores: ['Dourado', 'Prata'] }],
  ['L770', 'Relógio Tambour Aço', 'louis-vuitton', 7, 'relogio', 'normal', {}],
  ['B233', 'Tênis Triple S', 'balenciaga', 9, 'tenis', 'normal', { tamanhos: TAMANHOS_CALCADO.slice(3) }],
  ['P415', 'Cinto Couro Saffiano', 'prada', 8, 'cinto', 'normal', { tamanhos: ['90', '95', '100', '105'] }],
  ['G640', 'Mocassim Horsebit', 'gucci', 9, 'mocassim', 'normal', { tamanhos: TAMANHOS_CALCADO.slice(4), cores: ['Preto', 'Caramelo'] }],
  ['D122', 'Lenço de Seda Oblique', 'dior', 3, 'lenco', 'normal', {}],
  ['S508', 'Camisa Oxford Slim', 'saint-laurent', 6, 'camisa', 'esgotado', { tamanhos: TAMANHOS_ROUPA }],
  ['C219', 'Scarpin Slingback Bicolor', 'chanel', 2, 'scarpin', 'normal', { tamanhos: TAMANHOS_CALCADO.slice(0, 6) }],
  ['L305', 'Carteira Zippy', 'louis-vuitton', 5, 'carteira', 'normal', {}],
  ['B610', 'Bolsa Hourglass', 'balenciaga', 1, 'bolsa', 'normal', { cores: ['Preto', 'Verde'] }],
  ['D877', 'Relógio Chiffre Rouge', 'dior', 7, 'relogio', 'normal', {}],
  ['P990', 'Mochila Re-Nylon', 'prada', 10, 'bolsa', 'normal', {}],
  ['G333', 'Perfume Bloom 50 ml', 'gucci', 4, 'perfume', 'normal', {}],
  ['C701', 'Óculos Borboleta', 'chanel', 3, 'oculos', 'normal', {}],
  ['S150', 'Mocassim Le Loafer', 'saint-laurent', 9, 'mocassim', 'normal', { tamanhos: TAMANHOS_CALCADO.slice(3) }],
  ['L660', 'Cinto Initiales', 'louis-vuitton', 8, 'cinto', 'normal', { tamanhos: ['85', '90', '95', '100'], cores: ['Preto', 'Marrom'] }],
  ['B415', 'Tênis Speed Trainer', 'balenciaga', 2, 'tenis', 'normal', { tamanhos: TAMANHOS_CALCADO.slice(0, 5) }],
  ['X101', 'Produto sem foto cadastrada', 'chanel', 5, null, 'normal', {}],
];

const DESCRICOES = [
  'Texto de exemplo para a descrição do produto. Aqui entram material, medidas e detalhes de acabamento cadastrados no painel.',
  'Descrição de exemplo mais curta, para ver como o bloco se comporta com pouco texto.',
  null,
];

let proximaVariacao = 1;

export const produtos = produtosBrutos.map(([codigo, nome, marcaSlug, categoriaId, desenho, status, variacoes], i) => {
  const marca = marcas.find((m) => m.slug === marcaSlug);
  const bruta = categoriasBrutas.find((c) => c[0] === categoriaId);
  const categoria = categorias.find((c) => c.slug === bruta[3]);
  const publicos = UNISSEX.has(codigo) ? ['feminino', 'masculino'] : [bruta[1]];
  const imagens = desenho
    ? [
        { id: i * 10 + 1, url: img(desenho), alt: `${nome} — foto 1`, ordem: 1 },
        { id: i * 10 + 2, url: img(`${desenho}-2`), alt: `${nome} — foto 2`, ordem: 2 },
      ]
    : [];
  const lista = [
    ...(variacoes.tamanhos || []).map((valor, j) => ({
      id: proximaVariacao++,
      tipo: 'tamanho',
      valor,
      disponivel: !(i % 3 === 0 && j === 1),
    })),
    ...(variacoes.cores || []).map((valor) => ({ id: proximaVariacao++, tipo: 'cor', valor, disponivel: true })),
  ];
  return {
    id: 100 + i,
    codigo,
    nome: `${nome} ${marca.nome}`,
    descricao: DESCRICOES[i % DESCRICOES.length],
    status,
    destaque: i < 12,
    marca: { nome: marca.nome, slug: marca.slug },
    categoria: { nome: categoria.nome, slug: categoria.slug },
    publicos,
    colecao: { nome: nomeDoPublico(publicos), slug: slugDoPublico(publicos) },
    imagens,
    variacoes: lista,
    // Relativo a hoje, de 3 em 3 dias: os primeiros caem na janela de Novidades (14 dias) e o resto
    // não, para dar para ver o filtro funcionando em qualquer dia.
    criadoEm: new Date(Date.now() - i * 3 * 86400000).toISOString(),
  };
});

/*
 * A paleta, espelhando a tabela `cores` do backend (revisão 0007). Aqui ela é
 * DERIVADA das variações de cor dos produtos, com a mesma regra de slug do
 * backend (minúscula, sem acento, não-alfanumérico vira hífen): assim "Preto" e
 * "preto" caem na mesma cor, como cairiam lá.
 */
export const slugDeCor = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .join('-');

export const cores = [
  ...new Map(
    produtos.flatMap((p) =>
      p.variacoes.filter((v) => v.tipo === 'cor').map((v) => [slugDeCor(v.valor), v.valor]),
    ),
  ),
]
  .sort(([, a], [, b]) => a.localeCompare(b, 'pt-BR'))
  .map(([slug, nome], i) => ({ id: 900 + i, nome, slug }));

/** Os slugs de cor de um produto — é o que o filtro `?cor=` compara. */
export const coresDoProduto = (produto) =>
  produto.variacoes.filter((v) => v.tipo === 'cor').map((v) => slugDeCor(v.valor));

export const banners = [
  {
    id: 1,
    titulo: 'Bolsas que chegaram esta semana',
    subtitulo: 'Nova remessa',
    imagemUrl: '/exemplo/banners/banner-1.svg',
    imagemUrlMobile: '/exemplo/banners/banner-1-mobile.svg',
    alt: 'Ilustração de bolsas em creme sobre fundo verde',
    linkUrl: '/novidades',
  },
  {
    id: 2,
    titulo: 'Óculos e relógios de grife',
    subtitulo: 'Acessórios',
    imagemUrl: '/exemplo/banners/banner-2.svg',
    imagemUrlMobile: '/exemplo/banners/banner-2-mobile.svg',
    alt: 'Ilustração de óculos e relógio',
    linkUrl: '/produtos?colecao=feminino&categoria=oculos',
  },
  {
    id: 3,
    titulo: 'O guarda-roupa masculino, importado',
    subtitulo: 'Coleção masculina',
    imagemUrl: '/exemplo/banners/banner-3.svg',
    imagemUrlMobile: '/exemplo/banners/banner-3-mobile.svg',
    alt: 'Ilustração de mocassim e camisa',
    linkUrl: '/masculino',
  },
];

// Banners de cores vibrantes, só para avaliar o carrossel (?exemplo=vibrante): contraste alto entre
// um slide e o seguinte deixa o deslizar e o arrastar evidentes. Fora da paleta da marca de
// propósito — é foto de teste, não UI. Imagens em public/exemplo/banners-teste/.
export const bannersVibrantes = [
  {
    id: 101,
    titulo: 'Teste um: pink e laranja',
    subtitulo: 'Carrossel de teste',
    imagemUrl: '/exemplo/banners-teste/vibrante-1.png',
    imagemUrlMobile: '/exemplo/banners-teste/vibrante-1-mobile.png',
    alt: 'Fundo de teste em pink e laranja com formas geométricas',
    linkUrl: '/novidades',
  },
  {
    id: 102,
    titulo: 'Teste dois: azul e turquesa',
    subtitulo: 'Carrossel de teste',
    imagemUrl: '/exemplo/banners-teste/vibrante-2.png',
    imagemUrlMobile: '/exemplo/banners-teste/vibrante-2-mobile.png',
    alt: 'Fundo de teste em azul e turquesa com formas geométricas',
    linkUrl: '/feminino',
  },
  {
    id: 103,
    titulo: 'Teste três: roxo e limão',
    subtitulo: 'Carrossel de teste',
    imagemUrl: '/exemplo/banners-teste/vibrante-3.png',
    imagemUrlMobile: '/exemplo/banners-teste/vibrante-3-mobile.png',
    alt: 'Fundo de teste em roxo e verde-limão com formas geométricas',
    linkUrl: '/masculino',
  },
];

export const WHATSAPP_EXEMPLO = '5500000000000';
