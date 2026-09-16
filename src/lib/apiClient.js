/*
 * Cliente HTTP único da loja. Toda chamada de API passa por `requisitar`.
 *
 * Regras do backend que este arquivo absorve (docs/para-o-frontend.md no Backend-VIP-IMPORTS):
 * - Nenhuma rota devolve 204: sucesso sem corpo vem como 200 {"ok": true}. Sempre há JSON.
 * - Erro vem em { erro: { codigo, mensagem, campos?, detalhes? } } e vira `ErroApi`.
 * - `campos` é texto para mostrar embaixo de cada input; `detalhes` é dado para a tela ler.
 * - Em 500, o identificador para achar a exceção no log vem no cabeçalho X-Rastreio.
 * - Sessão é cookie httpOnly (`vip_sessao_cliente`): a requisição só precisa de credentials.
 *
 * Nunca trate erro na mão com fetch em outro lugar — capture `ErroApi` e leia os campos.
 */

const BASE = import.meta.env.VITE_API_URL || '/api/v1';
const MODO_EXEMPLO = import.meta.env.VITE_API_EXEMPLO === '1';

export class ErroApi extends Error {
  constructor({ status, codigo, mensagem, campos, detalhes, rastreio }) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
    this.codigo = codigo;
    this.mensagem = mensagem;
    this.campos = campos || {};
    this.detalhes = detalhes || {};
    this.rastreio = rastreio || null;
  }
}

function montarUrl(caminho, query) {
  const url = new URL(BASE + caminho, window.location.origin);
  if (query) {
    for (const [chave, valor] of Object.entries(query)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        url.searchParams.set(chave, String(valor));
      }
    }
  }
  return url;
}

/**
 * @param {'GET'|'POST'|'PATCH'|'DELETE'} metodo
 * @param {string} caminho  ex: '/produtos/X030'
 * @param {{ corpo?: object, query?: object, sinal?: AbortSignal }} [opcoes]
 */
export async function requisitar(metodo, caminho, { corpo, query, sinal } = {}) {
  const url = montarUrl(caminho, query);

  if (MODO_EXEMPLO) {
    // Import dinâmico: o catálogo de exemplo não entra no pacote de produção.
    const { responderExemplo } = await import('./exemplo/servidorExemplo.js');
    return responderExemplo(metodo, url, corpo, sinal);
  }

  let resposta;
  try {
    resposta = await fetch(url, {
      method: metodo,
      credentials: 'include',
      headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: sinal,
    });
  } catch (falha) {
    if (falha.name === 'AbortError') throw falha;
    throw new ErroApi({
      status: 0,
      codigo: 'SEM_CONEXAO',
      mensagem: 'Não foi possível falar com a loja agora. Confira sua internet e tente de novo.',
    });
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  if (!resposta.ok) {
    const erro = dados && dados.erro ? dados.erro : {};
    throw new ErroApi({
      status: resposta.status,
      codigo: erro.codigo || 'ERRO_INTERNO',
      mensagem: erro.mensagem || 'Algo deu errado do nosso lado. Tente de novo em instantes.',
      campos: erro.campos,
      detalhes: erro.detalhes,
      rastreio: resposta.headers.get('X-Rastreio'),
    });
  }

  return dados;
}

export const ehNaoIdentificado = (erro) =>
  erro instanceof ErroApi && erro.status === 401 && erro.codigo === 'NAO_IDENTIFICADO';
