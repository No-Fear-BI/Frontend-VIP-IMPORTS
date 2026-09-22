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
  slugDeCor,
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

    if (rota === 'GET /admin/marcas') return vazio ? [] : marcasDoPainel(estado);

    if (rota === 'POST /admin/marcas') {
      const nome = String(corpo?.nome || '').trim();
      if (!nome) {
        throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', { campos: { nome: 'Obrigatório.' } });
      }
      const existentes = marcasDoPainel(estado);
      const slugs = existentes.map((mm) => mm.slug);
      let slug;
      if (corpo?.slug) {
        slug = slugDeCor(corpo.slug);
        if (slugs.includes(slug)) {
          throw erro(409, 'SLUG_EM_USO', `O slug '${slug}' já está em uso por outra marca.`, {
            campos: { slug: 'Este slug já está em uso.' },
          });
        }
      } else {
        slug = slugUnico(slugs, slugDeCor(nome));
      }
      const agora = new Date().toISOString();
      const nova = {
        id: proximoId(estado, 'proximoIdMarca', 800000),
        nome,
        slug,
        logoUrl: null,
        ordem: 0,
        ativa: true,
        totalProdutos: 0,
        criadoEm: agora,
        atualizadoEm: agora,
      };
      estado.marcasExtras = [...(estado.marcasExtras || []), nova];
      gravar(estado);
      return nova;
    }

    if ((m = caminho.match(/^\/admin\/marcas\/(\d+)$/))) {
      const id = Number(m[1]);
      const atual = marcasDoPainel(estado).find((mm) => mm.id === id);
      if (!atual) throw erro(404, 'MARCA_NAO_ENCONTRADA', 'Marca não encontrada.');

      if (metodo === 'DELETE') {
        if (atual.totalProdutos > 0) {
          throw erro(409, 'MARCA_COM_PRODUTOS', `Não é possível excluir: ${atual.totalProdutos} produtos usam esta marca.`, {
            detalhes: { totalProdutos: atual.totalProdutos },
          });
        }
        estado.marcasExtras = (estado.marcasExtras || []).filter((mm) => mm.id !== id);
        gravar(estado);
        return { ok: true };
      }

      const mudancas = {};
      if (corpo?.nome) mudancas.nome = String(corpo.nome).trim();
      if (corpo?.slug) {
        const slug = slugDeCor(corpo.slug);
        if (marcasDoPainel(estado).some((mm) => mm.id !== id && mm.slug === slug)) {
          throw erro(409, 'SLUG_EM_USO', `O slug '${slug}' já está em uso por outra marca.`, {
            campos: { slug: 'Este slug já está em uso.' },
          });
        }
        mudancas.slug = slug;
      }
      mudancas.atualizadoEm = new Date().toISOString();
      const ajustadas = (estado.marcasExtras || []).map((mm) => (mm.id === id ? { ...mm, ...mudancas } : mm));
      if (!ajustadas.some((mm) => mm.id === id)) ajustadas.push({ ...atual, ...mudancas });
      estado.marcasExtras = ajustadas;
      gravar(estado);
      return { ...atual, ...mudancas };
    }

    if (rota === 'GET /admin/categorias') {
      const colecaoId = Number(q.get('colecaoId')) || null;
      let lista = vazio ? [] : categoriasDoPainel(estado);
      if (colecaoId) lista = lista.filter((c) => c.colecaoId === colecaoId);
      return lista;
    }

    if (rota === 'POST /admin/categorias') {
      const nome = String(corpo?.nome || '').trim();
      if (!nome) {
        throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', { campos: { nome: 'Obrigatório.' } });
      }
      const colecaoId = Number(corpo?.colecaoId);
      const colecao = colecoes.find((c) => c.id === colecaoId);
      if (!colecao) {
        throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', { campos: { colecaoId: 'Coleção não encontrada.' } });
      }
      const daColecao = categoriasDoPainel(estado).filter((c) => c.colecaoId === colecaoId);
      const slugs = daColecao.map((c) => c.slug);
      let slug;
      if (corpo?.slug) {
        slug = slugDeCor(corpo.slug);
        if (slugs.includes(slug)) {
          throw erro(409, 'SLUG_EM_USO', `Já existe uma categoria '${slug}' na coleção ${colecao.slug}.`, {
            campos: { slug: 'Este slug já existe nesta coleção.' },
          });
        }
      } else {
        slug = slugUnico(slugs, slugDeCor(nome));
      }
      const agora = new Date().toISOString();
      const nova = {
        id: proximoId(estado, 'proximoIdCategoria', 800000),
        colecaoId,
        colecaoSlug: colecao.slug,
        nome,
        slug,
        imagemUrl: null,
        destaque: false,
        destaqueOrdem: null,
        ordem: 0,
        ativa: true,
        totalProdutos: 0,
        criadoEm: agora,
        atualizadoEm: agora,
      };
      estado.categoriasExtras = [...(estado.categoriasExtras || []), nova];
      gravar(estado);
      return nova;
    }

    if ((m = caminho.match(/^\/admin\/categorias\/(\d+)$/))) {
      const id = Number(m[1]);
      const atual = categoriasDoPainel(estado).find((c) => c.id === id);
      if (!atual) throw erro(404, 'CATEGORIA_NAO_ENCONTRADA', 'Categoria não encontrada.');

      if (metodo === 'DELETE') {
        if (atual.totalProdutos > 0) {
          throw erro(409, 'CATEGORIA_COM_PRODUTOS', `Não é possível excluir: ${atual.totalProdutos} produtos usam esta categoria.`, {
            detalhes: { totalProdutos: atual.totalProdutos },
          });
        }
        estado.categoriasExtras = (estado.categoriasExtras || []).filter((c) => c.id !== id);
        gravar(estado);
        return { ok: true };
      }

      // Esta tela não manda colecaoId no PATCH (ver comentário de Categorias.jsx): só nome e slug.
      const mudancas = {};
      if (corpo?.nome) mudancas.nome = String(corpo.nome).trim();
      if (corpo?.slug) {
        const slug = slugDeCor(corpo.slug);
        const naMesmaColecao = categoriasDoPainel(estado).filter((c) => c.id !== id && c.colecaoId === atual.colecaoId);
        if (naMesmaColecao.some((c) => c.slug === slug)) {
          throw erro(409, 'SLUG_EM_USO', `Já existe uma categoria '${slug}' na coleção ${atual.colecaoSlug}.`, {
            campos: { slug: 'Este slug já existe nesta coleção.' },
          });
        }
        mudancas.slug = slug;
      }
      mudancas.atualizadoEm = new Date().toISOString();
      const ajustadas = (estado.categoriasExtras || []).map((c) => (c.id === id ? { ...c, ...mudancas } : c));
      if (!ajustadas.some((c) => c.id === id)) ajustadas.push({ ...atual, ...mudancas });
      estado.categoriasExtras = ajustadas;
      gravar(estado);
      return { ...atual, ...mudancas };
    }

    if (rota === 'GET /admin/produtos') {
      let lista = vazio ? [] : produtosDoPainel(estado);
      const marcaId = Number(q.get('marcaId')) || null;
      const categoriaId = Number(q.get('categoriaId')) || null;
      const colecaoId = Number(q.get('colecaoId')) || null;
      const corId = Number(q.get('corId')) || null;
      const status = q.get('status') || null;
      const busca = (q.get('busca') || '').trim();

      if (marcaId) lista = lista.filter((p) => p.marcaId === marcaId);
      if (categoriaId) lista = lista.filter((p) => p.categoriaId === categoriaId);
      else if (colecaoId) lista = lista.filter((p) => p.colecaoId === colecaoId);
      if (status) lista = lista.filter((p) => p.status === status);
      if (corId) {
        const cor = coresDoPainel(estado).find((c) => c.id === corId);
        lista = cor ? lista.filter((p) => coresDoProduto(p).includes(cor.slug)) : [];
      }
      if (busca) {
        const termo = normalizar(busca);
        const termoCodigo = busca.toUpperCase();
        lista = lista.filter((p) => normalizar(p.nome).includes(termo) || p.codigo.includes(termoCodigo));
      }

      const porPagina = Math.min(Number(q.get('porPagina')) || 50, 100);
      const pagina = Math.max(1, Number(q.get('pagina')) || 1);
      const inicio = (pagina - 1) * porPagina;
      return {
        dados: lista.slice(inicio, inicio + porPagina).map(itemDoPainel),
        paginacao: { total: lista.length, porPagina, pagina },
      };
    }

    if (rota === 'POST /admin/produtos') {
      const nome = String(corpo?.nome || '').trim();
      if (!nome) throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', { campos: { nome: 'Obrigatório.' } });
      const marcaId = Number(corpo?.marcaId);
      const marca = marcas.find((m) => m.id === marcaId);
      if (!marca) {
        throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', { campos: { marcaId: 'Marca não encontrada.' } });
      }
      const categoriaId = Number(corpo?.categoriaId);
      const categoria = categorias.find((c) => c.id === categoriaId);
      if (!categoria) {
        throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', { campos: { categoriaId: 'Categoria não encontrada.' } });
      }
      const colecaoId = colecoes.find((c) => c.slug === categoria.colecao).id;
      const existentes = produtosDoPainel(estado);
      let codigo = corpo?.codigo ? String(corpo.codigo).trim().toUpperCase() : '';
      if (codigo && existentes.some((p) => p.codigo === codigo)) {
        throw erro(409, 'CODIGO_EM_USO', `O código ${codigo} já está em uso por outro produto.`, {
          campos: { codigo: 'Este código já está em uso.' },
        });
      }
      if (!codigo) codigo = proximoCodigo(existentes, marca.nome);

      const agora = new Date().toISOString();
      const novo = {
        id: proximoId(estado, 'proximoIdProduto', 100000),
        codigo,
        nome,
        descricao: corpo?.descricao ?? null,
        status: corpo?.status || 'normal',
        destaque: false,
        destaqueOrdem: null,
        marcaId,
        categoriaId,
        colecaoId,
        imagens: [],
        variacoes: [],
        criadoEm: agora,
        atualizadoEm: agora,
      };
      estado.produtosCriados = [...(estado.produtosCriados || []), novo];
      gravar(estado);
      return detalheDoPainel(novo);
    }

    if ((m = caminho.match(/^\/admin\/produtos\/(\d+)$/)) && metodo === 'GET') {
      const p = produtoDoPainelPorId(estado, Number(m[1]));
      if (!p) throw erro(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado.');
      return detalheDoPainel(p);
    }

    if ((m = caminho.match(/^\/admin\/produtos\/(\d+)$/)) && metodo === 'PATCH') {
      const id = Number(m[1]);
      const atual = produtoDoPainelPorId(estado, id);
      if (!atual) throw erro(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado.');

      const campos = {};
      if ('codigo' in corpo && corpo.codigo) {
        const novoCodigo = String(corpo.codigo).trim().toUpperCase();
        if (produtosDoPainel(estado).some((p) => p.id !== id && p.codigo === novoCodigo)) {
          throw erro(409, 'CODIGO_EM_USO', `O código ${novoCodigo} já está em uso por outro produto.`, {
            campos: { codigo: 'Este código já está em uso.' },
          });
        }
        campos.codigo = novoCodigo;
      }
      if ('nome' in corpo && corpo.nome) campos.nome = String(corpo.nome).trim();
      if ('descricao' in corpo) campos.descricao = corpo.descricao ?? null;
      if ('status' in corpo && corpo.status) campos.status = corpo.status;
      if ('marcaId' in corpo && corpo.marcaId != null) {
        if (!marcas.some((mm) => mm.id === corpo.marcaId)) {
          throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', { campos: { marcaId: 'Marca não encontrada.' } });
        }
        campos.marcaId = corpo.marcaId;
      }
      if ('categoriaId' in corpo && corpo.categoriaId != null) {
        const categoria = categorias.find((c) => c.id === corpo.categoriaId);
        if (!categoria) {
          throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', { campos: { categoriaId: 'Categoria não encontrada.' } });
        }
        campos.categoriaId = corpo.categoriaId;
        campos.colecaoId = colecoes.find((c) => c.slug === categoria.colecao).id;
      }
      if ('destaque' in corpo && corpo.destaque != null) campos.destaque = corpo.destaque;
      campos.atualizadoEm = new Date().toISOString();

      aplicarEdicao(estado, id, campos);
      gravar(estado);
      return detalheDoPainel(produtoDoPainelPorId(estado, id));
    }

    if ((m = caminho.match(/^\/admin\/produtos\/(\d+)\/duplicar$/)) && metodo === 'POST') {
      const original = produtoDoPainelPorId(estado, Number(m[1]));
      if (!original) throw erro(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado.');
      const marca = marcas.find((mm) => mm.id === original.marcaId);
      const agora = new Date().toISOString();
      const copia = {
        id: proximoId(estado, 'proximoIdProduto', 100000),
        codigo: proximoCodigo(produtosDoPainel(estado), marca?.nome || 'Produto'),
        nome: `${original.nome} (cópia)`.slice(0, 180),
        descricao: original.descricao,
        status: 'oculto',
        destaque: false,
        destaqueOrdem: null,
        marcaId: original.marcaId,
        categoriaId: original.categoriaId,
        colecaoId: original.colecaoId,
        imagens: original.imagens.map((im) => ({ ...im, id: proximoId(estado, 'proximoIdImagem', 500000) })),
        variacoes: original.variacoes.map((v) => ({ ...v, id: proximoId(estado, 'proximoIdVariacao', 700000) })),
        criadoEm: agora,
        atualizadoEm: agora,
      };
      estado.produtosCriados = [...(estado.produtosCriados || []), copia];
      gravar(estado);
      return detalheDoPainel(copia);
    }

    if ((m = caminho.match(/^\/admin\/produtos\/(\d+)\/imagens$/)) && metodo === 'POST') {
      const id = Number(m[1]);
      const atual = produtoDoPainelPorId(estado, id);
      if (!atual) throw erro(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado.');
      const entradas = corpo?.imagens || [];
      if (entradas.length === 0) {
        throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', { campos: { imagens: 'Envie ao menos uma imagem.' } });
      }
      for (const im of entradas) {
        if (!String(im?.url || '').toLowerCase().startsWith('https://')) {
          throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', {
            campos: { imagens: 'A URL da imagem precisa começar com https://.' },
          });
        }
      }
      if (atual.imagens.length + entradas.length > 10) {
        const total = atual.imagens.length + entradas.length;
        throw erro(400, 'DADOS_INVALIDOS', `Este produto ficaria com ${total} imagens; o máximo é 10.`, {
          campos: { imagens: `Este produto ficaria com ${total} imagens; o máximo é 10.` },
        });
      }
      const novas = entradas.map((im, i) => ({
        id: proximoId(estado, 'proximoIdImagem', 500000),
        url: String(im.url).trim(),
        alt: im.alt || null,
        ordem: atual.imagens.length + i + 1,
      }));
      const imagens = [...atual.imagens, ...novas];
      aplicarEdicao(estado, id, { imagens, atualizadoEm: new Date().toISOString() });
      gravar(estado);
      return produtoDoPainelPorId(estado, id).imagens;
    }

    if ((m = caminho.match(/^\/admin\/produtos\/(\d+)\/imagens\/ordem$/)) && metodo === 'PATCH') {
      const id = Number(m[1]);
      const atual = produtoDoPainelPorId(estado, id);
      if (!atual) throw erro(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado.');
      const pedidos = corpo?.ids || [];
      const atuais = new Set(atual.imagens.map((i) => i.id));
      const pedidosUnicos = new Set(pedidos);
      const listaCompleta =
        pedidosUnicos.size === pedidos.length &&
        pedidosUnicos.size === atuais.size &&
        [...pedidosUnicos].every((idPedido) => atuais.has(idPedido));
      if (!listaCompleta) {
        throw erro(400, 'DADOS_INVALIDOS', 'A lista precisa trazer todas as imagens deste produto, e só elas.', {
          campos: { ids: 'A lista precisa trazer todas as imagens deste produto, e só elas.' },
        });
      }
      const porId = new Map(atual.imagens.map((i) => [i.id, i]));
      const imagens = pedidos.map((idImagem, i) => ({ ...porId.get(idImagem), ordem: i + 1 }));
      aplicarEdicao(estado, id, { imagens, atualizadoEm: new Date().toISOString() });
      gravar(estado);
      return imagens;
    }

    if ((m = caminho.match(/^\/admin\/imagens\/(\d+)$/)) && metodo === 'DELETE') {
      const imagemId = Number(m[1]);
      const dono = produtosDoPainel(estado).find((p) => p.imagens.some((i) => i.id === imagemId));
      if (!dono) throw erro(404, 'PRODUTO_NAO_ENCONTRADO', 'Imagem não encontrada.');
      const restantes = dono.imagens
        .filter((i) => i.id !== imagemId)
        .map((i, idx) => ({ ...i, ordem: idx + 1 }));
      aplicarEdicao(estado, dono.id, { imagens: restantes, atualizadoEm: new Date().toISOString() });
      gravar(estado);
      return restantes;
    }

    if ((m = caminho.match(/^\/admin\/produtos\/(\d+)\/variacoes$/)) && metodo === 'PATCH') {
      const id = Number(m[1]);
      const atual = produtoDoPainelPorId(estado, id);
      if (!atual) throw erro(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado.');

      const resolvidas = [];
      const vistas = new Set();
      for (const pedida of corpo?.variacoes || []) {
        let valor = String(pedida.valor || '').trim();
        let corId = null;
        if (pedida.tipo === 'cor') {
          if (pedida.corId != null) {
            const cor = coresDoPainel(estado).find((c) => c.id === pedida.corId);
            if (!cor) {
              throw erro(404, 'COR_NAO_ENCONTRADA', `Cor ${pedida.corId} não encontrada.`, { campos: { corId: 'Cor não encontrada.' } });
            }
            valor = cor.nome;
            corId = cor.id;
          } else {
            const slug = slugDeCor(valor);
            let cor = coresDoPainel(estado).find((c) => slugDeCor(c.nome) === slug);
            if (!cor) {
              cor = { id: proximoId(estado, 'proximoIdCor', 900000), nome: valor, slug, ordem: 0, ativa: true, totalProdutos: 0 };
              estado.coresExtras = [...(estado.coresExtras || []), cor];
            }
            valor = cor.nome;
            corId = cor.id;
          }
        } else if (pedida.corId != null) {
          throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', { campos: { variacoes: 'Variação de tamanho não leva cor.' } });
        }
        const chave = `${pedida.tipo}:${valor}`;
        if (vistas.has(chave)) {
          throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.', {
            campos: { variacoes: `'${valor}' aparece duas vezes em ${pedida.tipo}.` },
          });
        }
        vistas.add(chave);
        resolvidas.push({ tipo: pedida.tipo, valor, corId, disponivel: pedida.disponivel ?? true });
      }

      const atuaisPorChave = new Map(atual.variacoes.map((v) => [`${v.tipo}:${v.valor}`, v]));
      const variacoes = resolvidas.map((r) => {
        const existente = atuaisPorChave.get(`${r.tipo}:${r.valor}`);
        return existente ? { ...existente, ...r } : { ...r, id: proximoId(estado, 'proximoIdVariacao', 700000) };
      });
      aplicarEdicao(estado, id, { variacoes, atualizadoEm: new Date().toISOString() });
      gravar(estado);
      return variacoes;
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

// ======================================================================
// Produtos do painel: uma camada por cima do catálogo fixo (`produtos`), para editar, criar,
// duplicar e mexer em imagens/variações sem reescrever catalogoExemplo.js. Mesma ideia de
// `coresExtras`/`coresDoPainel` acima: o catálogo fixo nunca é mutado, as edições vivem no
// `estado` (localStorage) e são aplicadas por cima na leitura.
// ======================================================================

/** Um contador por chave, persistido no estado — evita ids repetidos entre chamadas na mesma sessão. */
function proximoId(estado, chave, base) {
  const atual = estado[chave] || base;
  estado[chave] = atual + 1;
  return atual;
}

/** Três letras da marca + o próximo sequencial livre, como o backend gera (docs/para-o-frontend.md). */
function proximoCodigo(existentes, nomeMarca) {
  const prefixo = (nomeMarca.replace(/[^a-zA-Z]/g, '').slice(0, 3) || 'PRD').toUpperCase();
  let sequencial = 1;
  while (existentes.some((p) => p.codigo === `${prefixo}-${String(sequencial).padStart(4, '0')}`)) sequencial++;
  return `${prefixo}-${String(sequencial).padStart(4, '0')}`;
}

/** A categoria de um produto estático, por slug DA CATEGORIA *e* DA COLEÇÃO — "bolsas" existe nas duas. */
function categoriaDoProdutoEstatico(p) {
  return categorias.find((c) => c.slug === p.categoria.slug && c.colecao === p.colecao.slug);
}

/** Um produto estático como o painel o vê: com os ids que o formulário e os filtros precisam. */
function produtoEstaticoParaPainel(p) {
  const categoria = categoriaDoProdutoEstatico(p);
  return {
    id: p.id,
    codigo: p.codigo,
    nome: p.nome,
    descricao: p.descricao,
    status: p.status,
    destaque: p.destaque,
    destaqueOrdem: null,
    marcaId: marcas.find((m) => m.slug === p.marca.slug).id,
    categoriaId: categoria.id,
    colecaoId: colecoes.find((c) => c.slug === p.colecao.slug).id,
    imagens: p.imagens,
    variacoes: p.variacoes,
    criadoEm: p.criadoEm,
    atualizadoEm: p.criadoEm,
  };
}

/** Todos os produtos do painel: os fixos (com as edições da sessão por cima) + os criados/duplicados nela. */
function produtosDoPainel(estado) {
  const overrides = estado.produtosPainel || {};
  const fixos = produtos.map((p) => ({ ...produtoEstaticoParaPainel(p), ...(overrides[p.id] || {}) }));
  return [...fixos, ...(estado.produtosCriados || [])];
}

function produtoDoPainelPorId(estado, id) {
  return produtosDoPainel(estado).find((p) => p.id === id);
}

/** Muda os campos de um produto do painel: mutação direta se foi criado nesta sessão, ou uma
 * entrada em `produtosPainel[id]` (camada) se é um dos fixos do catálogo. */
function aplicarEdicao(estado, id, campos) {
  const criado = (estado.produtosCriados || []).find((p) => p.id === id);
  if (criado) {
    Object.assign(criado, campos);
  } else {
    estado.produtosPainel = estado.produtosPainel || {};
    estado.produtosPainel[id] = { ...(estado.produtosPainel[id] || {}), ...campos };
  }
}

function marcasBase() {
  return marcas.map((m, i) => ({
    id: m.id,
    nome: m.nome,
    slug: m.slug,
    logoUrl: m.logoUrl,
    ordem: i,
    ativa: true,
    totalProdutos: produtos.filter((p) => p.marca.slug === m.slug).length,
    criadoEm: '2026-01-01T00:00:00.000Z',
    atualizadoEm: '2026-01-01T00:00:00.000Z',
  }));
}

/** As marcas fixas (com as edições da sessão por cima) + as criadas nela. Mesmo padrão de `coresDoPainel`. */
function marcasDoPainel(estado) {
  const extras = estado.marcasExtras || [];
  const base = marcasBase();
  const combinadas = base.map((mm) => ({ ...mm, ...(extras.find((e) => e.id === mm.id) || {}) }));
  const novas = extras.filter((e) => !base.some((mm) => mm.id === e.id));
  return [...combinadas, ...novas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

function categoriasBase(estado) {
  const todos = produtosDoPainel(estado);
  return categorias.map((c) => ({
    id: c.id,
    colecaoId: colecoes.find((x) => x.slug === c.colecao).id,
    colecaoSlug: c.colecao,
    nome: c.nome,
    slug: c.slug,
    imagemUrl: c.imagemUrl,
    destaque: false,
    destaqueOrdem: null,
    ordem: c.id,
    ativa: true,
    totalProdutos: todos.filter((p) => p.categoriaId === c.id).length,
    criadoEm: '2026-01-01T00:00:00.000Z',
    atualizadoEm: '2026-01-01T00:00:00.000Z',
  }));
}

/** As categorias fixas (com as edições da sessão por cima) + as criadas nela. */
function categoriasDoPainel(estado) {
  const extras = estado.categoriasExtras || [];
  const base = categoriasBase(estado);
  const combinadas = base.map((c) => ({ ...c, ...(extras.find((e) => e.id === c.id) || {}) }));
  const novas = extras.filter((e) => !base.some((c) => c.id === e.id));
  return [...combinadas, ...novas];
}

/** Slug único numa lista de slugs já usados: livre entra direto, colisão ganha sufixo -2, -3… */
function slugUnico(usados, base) {
  if (!usados.includes(base)) return base;
  for (let sufixo = 2; ; sufixo++) {
    const candidato = `${base}-${sufixo}`;
    if (!usados.includes(candidato)) return candidato;
  }
}

function refDaMarca(marcaId) {
  const m = marcas.find((x) => x.id === marcaId);
  return { nome: m?.nome || '?', slug: m?.slug || '' };
}

function refDaCategoria(categoriaId) {
  const c = categorias.find((x) => x.id === categoriaId);
  return { nome: c?.nome || '?', slug: c?.slug || '' };
}

function refDaColecao(colecaoId) {
  const c = colecoes.find((x) => x.id === colecaoId);
  return { nome: c?.nome || '?', slug: c?.slug || '' };
}

/** ProdutoAdminDetalhe: o produto do painel com marca/categoria/coleção por extenso. */
function detalheDoPainel(p) {
  return {
    ...p,
    marca: refDaMarca(p.marcaId),
    categoria: refDaCategoria(p.categoriaId),
    colecao: refDaColecao(p.colecaoId),
  };
}

/** ProdutoAdminItem: a linha da listagem. */
function itemDoPainel(p) {
  return {
    id: p.id,
    codigo: p.codigo,
    nome: p.nome,
    status: p.status,
    destaque: p.destaque,
    marca: refDaMarca(p.marcaId),
    categoria: refDaCategoria(p.categoriaId),
    colecao: refDaColecao(p.colecaoId),
    capa: p.imagens[0] ? { url: p.imagens[0].url, alt: p.imagens[0].alt } : null,
    criadoEm: p.criadoEm,
    atualizadoEm: p.atualizadoEm,
  };
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
