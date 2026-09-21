// API simulada do modo "exemplo" (npm run dev:exemplo). Reproduz as regras do backend
// que a tela precisa respeitar: envelope de erro, 200 {"ok": true}, paginação por cursor,
// carrinho sem quantidade com PAR de variações, PATCH que troca o par inteiro, seleção
// que NÃO esvazia o carrinho.
//
// Para ver os estados da tela sem mexer no código, acrescente à URL do site:
//   ?exemplo=lento  → toda resposta demora 4s (estado carregando)
//   ?exemplo=vazio  → listagens voltam vazias (estado vazio)
//   ?exemplo=erro   → toda leitura (GET) falha com 500 (estado de erro)
//
// Painel: entra com qualquer e-mail e a senha "exemplo" (outra senha → CREDENCIAIS_INVALIDAS).
// Como no backend, a sessão do admin vale mais que a do cliente; só cliente → 403 SEM_PERMISSAO.

import { ErroApi } from '../apiClient.js';
import {
  banners,
  categorias,
  colecoes,
  cores,
  coresDoProduto,
  marcas,
  produtos,
  WHATSAPP_EXEMPLO,
} from './catalogoExemplo.js';

const CHAVE = 'vip-exemplo-estado';
const SENHA_ADMIN_EXEMPLO = 'exemplo';

function lerEstado() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || estadoInicial();
  } catch {
    return estadoInicial();
  }
}

function estadoInicial() {
  return { cliente: null, admin: null, carrinho: [], favoritos: [], selecoes: [], proximoItem: 1 };
}

function gravar(estado) {
  localStorage.setItem(CHAVE, JSON.stringify(estado));
}

const cenario = () => new URLSearchParams(window.location.search).get('exemplo');

function esperar(ms, sinal) {
  return new Promise((resolver, rejeitar) => {
    const t = setTimeout(resolver, ms);
    sinal?.addEventListener('abort', () => {
      clearTimeout(t);
      rejeitar(new DOMException('Abortado', 'AbortError'));
    });
  });
}

const erro = (status, codigo, mensagem, extra = {}) => new ErroApi({ status, codigo, mensagem, ...extra });

const item = (p) => ({
  id: p.id,
  codigo: p.codigo,
  nome: p.nome,
  status: p.status,
  destaque: p.destaque,
  marca: p.marca,
  categoria: p.categoria,
  colecao: p.colecao,
  capa: p.imagens[0] ? { url: p.imagens[0].url, alt: p.imagens[0].alt } : null,
});

function exigirCliente(estado) {
  if (!estado.cliente) throw erro(401, 'NAO_IDENTIFICADO', 'Identifique-se com seu e-mail para continuar.');
}

function itemDoCarrinho(linha) {
  const p = produtos.find((x) => x.id === linha.produtoId);
  const variacao = (id) => p.variacoes.find((v) => v.id === id) || null;
  return {
    ...item(p),
    itemId: linha.itemId,
    variacaoTamanho: variacao(linha.variacaoTamanhoId),
    variacaoCor: variacao(linha.variacaoCorId),
  };
}

function validarPar(p, { variacaoTamanhoId = null, variacaoCorId = null }) {
  for (const [tipo, campo, id] of [
    ['tamanho', 'variacaoTamanhoId', variacaoTamanhoId],
    ['cor', 'variacaoCorId', variacaoCorId],
  ]) {
    if (id === null) continue;
    if (!p.variacoes.some((v) => v.id === id && v.tipo === tipo)) {
      throw erro(400, 'VARIACAO_INVALIDA', 'A variação escolhida não pertence a este produto.', {
        campos: { [campo]: `Escolha ${tipo === 'tamanho' ? 'um tamanho' : 'uma cor'} deste produto.` },
      });
    }
  }
  return { variacaoTamanhoId, variacaoCorId };
}

export async function responderExemplo(metodo, url, corpo, sinal) {
  const modo = cenario();
  await esperar(modo === 'lento' ? 4000 : 250 + Math.random() * 250, sinal);
  if (modo === 'erro' && metodo === 'GET') {
    throw erro(500, 'ERRO_INTERNO', 'Algo deu errado do nosso lado. Tente de novo em instantes.');
  }
  const vazio = modo === 'vazio';
  const caminho = url.pathname.replace(/^.*\/api\/v1/, '');
  const q = url.searchParams;
  const estado = lerEstado();
  const rota = `${metodo} ${caminho}`;
  let m;

  if (rota === 'POST /admin/sessao') {
    if (corpo?.senha !== SENHA_ADMIN_EXEMPLO) {
      throw erro(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha inválidos.');
    }
    const agora = new Date().toISOString();
    estado.admin = { id: 1, nome: 'Equipe VIP (exemplo)', email: corpo.email, ultimoLoginEm: agora, criadoEm: agora };
    gravar(estado);
    return estado.admin;
  }

  if (rota === 'DELETE /admin/sessao') {
    gravar({ ...estado, admin: null });
    return { ok: true };
  }

  if (caminho.startsWith('/admin/')) {
    if (!estado.admin && estado.cliente) {
      throw erro(403, 'SEM_PERMISSAO', 'Esta área é restrita à equipe da loja.');
    }
    if (!estado.admin) throw erro(401, 'NAO_IDENTIFICADO', 'Faça login para acessar o painel.');
    if (rota === 'GET /admin/eu') return estado.admin;

    /*
     * Paleta do painel. As cores nascem das variações dos produtos (ver catalogoExemplo),
     * e o que o painel cria/edita/exclui vive no estado local — produto de exemplo não muda,
     * então `totalProdutos` continua saindo do catálogo fixo.
     */
    if (rota === 'GET /admin/cores') return coresDoPainel(estado);

    if (rota === 'POST /admin/cores') {
      const nome = String(corpo?.nome || '').trim();
      if (!nome) {
        throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', {
          campos: { nome: 'Obrigatório.' },
        });
      }
      const slug = String(corpo?.slug || nome).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (coresDoPainel(estado).some((c) => c.slug === slug)) {
        throw erro(409, 'SLUG_EM_USO', `O slug '${slug}' já está em uso por outra cor.`, {
          campos: { slug: 'Este slug já está em uso.' },
        });
      }
      const nova = { id: Date.now(), nome, slug, ordem: 0, ativa: corpo?.ativa ?? true };
      gravar({ ...estado, coresExtras: [...(estado.coresExtras || []), nova] });
      return { ...nova, totalProdutos: 0 };
    }

    if ((m = caminho.match(/^\/admin\/cores\/(\d+)$/))) {
      const id = Number(m[1]);
      const atual = coresDoPainel(estado).find((c) => c.id === id);
      if (!atual) throw erro(404, 'COR_NAO_ENCONTRADA', 'Cor não encontrada.');

      if (metodo === 'DELETE') {
        if (atual.totalProdutos > 0) {
          throw erro(
            409,
            'COR_EM_USO',
            `Não é possível excluir: ${atual.totalProdutos} produtos usam esta cor.`,
            { detalhes: { totalProdutos: atual.totalProdutos } },
          );
        }
        gravar({ ...estado, coresExtras: (estado.coresExtras || []).filter((c) => c.id !== id) });
        return { ok: true };
      }

      const mudancas = { ...corpo };
      if (mudancas.nome) mudancas.nome = String(mudancas.nome).trim();
      const ajustadas = (estado.coresExtras || []).map((c) => (c.id === id ? { ...c, ...mudancas } : c));
      // Cor derivada do catálogo não existe no estado: vira uma entrada nova que a sobrescreve.
      if (!ajustadas.some((c) => c.id === id)) ajustadas.push({ ...atual, ...mudancas });
      gravar({ ...estado, coresExtras: ajustadas });
      return { ...atual, ...mudancas };
    }

    if (rota === 'GET /admin/produtos') {
      const corId = Number(q.get('corId'));
      const cor = coresDoPainel(estado).find((c) => c.id === corId);
      const lista = cor ? produtos.filter((p) => coresDoProduto(p).includes(cor.slug)) : [];
      return {
        dados: lista.map(item),
        paginacao: { total: lista.length, porPagina: 50, pagina: 1 },
      };
    }
  }

  if (rota === 'GET /home') {
    const visiveis = vazio ? [] : produtos;
    return {
      banners: vazio ? [] : banners,
      destaques: visiveis.filter((p) => p.destaque).slice(0, 12).map(item),
      categoriasDestaque: (vazio ? [] : categorias.slice(0, 8)).map((c) => ({
        id: c.id,
        nome: c.nome,
        slug: c.slug,
        imagemUrl: c.imagemUrl,
        colecao: { nome: colecoes.find((x) => x.slug === c.colecao).nome, slug: c.colecao },
      })),
      marcas: vazio ? [] : marcasComTotal(),
    };
  }

  if (rota === 'GET /produtos') {
    let lista = vazio ? [] : [...produtos];
    if (q.get('colecao')) lista = lista.filter((p) => p.colecao.slug === q.get('colecao'));
    if (q.get('categoria')) lista = lista.filter((p) => p.categoria.slug === q.get('categoria'));
    if (q.get('marca')) {
      const slugs = q.get('marca').split(',');
      lista = lista.filter((p) => slugs.includes(p.marca.slug));
    }
    if (q.get('cor')) {
      // OU entre as cores, como no backend: quem tem preto OU bege, não os dois.
      const slugs = q.get('cor').split(',');
      lista = lista.filter((p) => coresDoProduto(p).some((slug) => slugs.includes(slug)));
    }
    if (q.get('busca')) {
      const termo = normalizar(q.get('busca'));
      lista = lista.filter((p) => normalizar(`${p.nome} ${p.marca.nome} ${p.codigo}`).includes(termo));
    }
    if (q.get('ordem') === 'nome') lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const porPagina = Math.min(Number(q.get('porPagina')) || 24, 60);
    const inicio = q.get('cursor') ? Number(atob(q.get('cursor'))) : 0;
    const pagina = lista.slice(inicio, inicio + porPagina);
    const fim = inicio + porPagina;
    return {
      dados: pagina.map(item),
      paginacao: {
        total: lista.length,
        porPagina,
        ...(fim < lista.length ? { proximoCursor: btoa(String(fim)) } : {}),
      },
    };
  }

  if ((m = caminho.match(/^\/produtos\/([^/]+)\/relacionados$/)) && metodo === 'GET') {
    const p = acharProduto(decodeURIComponent(m[1]));
    return produtos
      .filter((x) => x.id !== p.id && x.categoria.slug === p.categoria.slug)
      .concat(produtos.filter((x) => x.id !== p.id && x.marca.slug === p.marca.slug))
      .filter((x, i, arr) => arr.indexOf(x) === i)
      .slice(0, 8)
      .map(item);
  }

  if ((m = caminho.match(/^\/produtos\/([^/]+)$/)) && metodo === 'GET') {
    const { criadoEm: _c, ...p } = acharProduto(decodeURIComponent(m[1]));
    return p;
  }

  if (rota === 'GET /marcas') return vazio ? [] : marcasComTotal();
  if (rota === 'GET /cores') return vazio ? [] : coresComTotal();
  if (rota === 'GET /colecoes') return colecoes;

  if ((m = caminho.match(/^\/colecoes\/([^/]+)\/categorias$/)) && metodo === 'GET') {
    if (!colecoes.some((c) => c.slug === m[1])) {
      throw erro(404, 'COLECAO_NAO_ENCONTRADA', 'Coleção não encontrada.');
    }
    return (vazio ? [] : categorias.filter((c) => c.colecao === m[1])).map((c) => ({
      id: c.id,
      nome: c.nome,
      slug: c.slug,
      imagemUrl: c.imagemUrl,
      totalProdutos: produtos.filter((p) => p.categoria.slug === c.slug && p.colecao.slug === m[1]).length,
    }));
  }

  if (rota === 'POST /clientes/identificar') {
    const email = String(corpo?.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw erro(400, 'DADOS_INVALIDOS', 'Confira o e-mail informado.', {
        campos: { email: 'Informe um e-mail válido, como nome@exemplo.com.' },
      });
    }
    estado.cliente = estado.cliente?.email === email
      ? estado.cliente
      : { id: 1, email, nome: null, telefone: null, criadoEm: new Date().toISOString() };
    gravar(estado);
    return estado.cliente;
  }

  if (rota === 'GET /clientes/eu') {
    exigirCliente(estado);
    return estado.cliente;
  }

  if (rota === 'PATCH /clientes/eu') {
    exigirCliente(estado);
    estado.cliente = { ...estado.cliente, ...corpo };
    gravar(estado);
    return estado.cliente;
  }

  if (rota === 'POST /clientes/sair') {
    gravar({ ...estado, cliente: null });
    return { ok: true };
  }

  if (rota === 'GET /favoritos') {
    exigirCliente(estado);
    return estado.favoritos.map((id) => item(produtos.find((p) => p.id === id)));
  }

  if (rota === 'POST /favoritos') {
    exigirCliente(estado);
    if (!estado.favoritos.includes(corpo.produtoId)) estado.favoritos.unshift(corpo.produtoId);
    gravar(estado);
    return { ok: true };
  }

  if ((m = caminho.match(/^\/favoritos\/(\d+)$/)) && metodo === 'DELETE') {
    exigirCliente(estado);
    estado.favoritos = estado.favoritos.filter((id) => id !== Number(m[1]));
    gravar(estado);
    return { ok: true };
  }

  if (rota === 'GET /carrinho') {
    exigirCliente(estado);
    return estado.carrinho.map(itemDoCarrinho);
  }

  if (rota === 'POST /carrinho') {
    exigirCliente(estado);
    const p = produtos.find((x) => x.id === corpo.produtoId);
    if (!p) throw erro(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado.');
    const par = validarPar(p, corpo);
    const repetido = estado.carrinho.some(
      (l) => l.produtoId === p.id && l.variacaoTamanhoId === par.variacaoTamanhoId && l.variacaoCorId === par.variacaoCorId,
    );
    if (!repetido) estado.carrinho.push({ itemId: estado.proximoItem++, produtoId: p.id, ...par });
    gravar(estado);
    return { ok: true };
  }

  if ((m = caminho.match(/^\/carrinho\/(\d+)$/))) {
    exigirCliente(estado);
    const itemId = Number(m[1]);
    const linha = estado.carrinho.find((l) => l.itemId === itemId);
    if (!linha) throw erro(404, 'ITEM_NAO_ENCONTRADO', 'Este item não está mais na sua seleção.');
    if (metodo === 'DELETE') {
      estado.carrinho = estado.carrinho.filter((l) => l.itemId !== itemId);
    } else if (metodo === 'PATCH') {
      // Troca o PAR inteiro: campo ausente vira nulo.
      const par = validarPar(produtos.find((p) => p.id === linha.produtoId), {
        variacaoTamanhoId: corpo.variacaoTamanhoId ?? null,
        variacaoCorId: corpo.variacaoCorId ?? null,
      });
      const gemeo = estado.carrinho.find(
        (l) => l.itemId !== itemId && l.produtoId === linha.produtoId
          && l.variacaoTamanhoId === par.variacaoTamanhoId && l.variacaoCorId === par.variacaoCorId,
      );
      if (gemeo) estado.carrinho = estado.carrinho.filter((l) => l.itemId !== itemId);
      else Object.assign(linha, par);
    }
    gravar(estado);
    return { ok: true };
  }

  if (rota === 'POST /selecoes') {
    exigirCliente(estado);
    if (estado.carrinho.length === 0) {
      throw erro(400, 'CARRINHO_VAZIO', 'Sua seleção está vazia. Adicione produtos antes de enviar.');
    }
    const itens = estado.carrinho.map(itemDoCarrinho).map((i) => ({
      codigo: i.codigo,
      nome: i.nome,
      marca: i.marca.nome,
      variacao: [i.variacaoTamanho?.valor, i.variacaoCor?.valor].filter(Boolean).join(' / ') || null,
    }));
    const mensagem = [
      'Olá! Tenho interesse nestas peças:',
      ...itens.map((i) => `• ${i.codigo} — ${i.nome} (${i.marca}${i.variacao ? `, ${i.variacao}` : ''})`),
    ].join('\n');
    const selecao = { id: estado.selecoes.length + 1, criadoEm: new Date().toISOString(), itens };
    estado.selecoes.unshift({ ...selecao, totalItens: itens.length });
    gravar(estado);
    return {
      ...selecao,
      mensagemWhatsapp: mensagem,
      linkWhatsapp: `https://wa.me/${WHATSAPP_EXEMPLO}?text=${encodeURIComponent(mensagem)}`,
    };
  }

  if (rota === 'GET /selecoes') {
    exigirCliente(estado);
    return { dados: estado.selecoes, paginacao: { total: estado.selecoes.length, porPagina: 20 } };
  }

  throw erro(404, 'ROTA_NAO_ENCONTRADA', `Rota não simulada no modo exemplo: ${rota}`);
}

function acharProduto(codigo) {
  const p = produtos.find((x) => x.codigo.toLowerCase() === codigo.toLowerCase());
  if (!p) throw erro(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado.');
  return p;
}

function marcasComTotal() {
  return marcas.map((m) => ({ ...m, totalProdutos: produtos.filter((p) => p.marca.slug === m.slug).length }));
}

function coresComTotal() {
  return cores.map((c) => ({
    ...c,
    totalProdutos: produtos.filter((p) => coresDoProduto(p).includes(c.slug)).length,
  }));
}

/** A paleta como o painel vê: as do catálogo mais as criadas na sessão, com as edições por cima. */
function coresDoPainel(estado) {
  const extras = estado.coresExtras || [];
  const base = coresComTotal().map((c) => ({ ordem: 0, ativa: true, ...c }));
  const combinadas = base.map((c) => ({ ...c, ...(extras.find((e) => e.id === c.id) || {}) }));
  const novas = extras
    .filter((e) => !base.some((c) => c.id === e.id))
    .map((e) => ({ ...e, totalProdutos: 0 }));
  return [...combinadas, ...novas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
