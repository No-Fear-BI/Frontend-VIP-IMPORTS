/*
 * Requisição das rotas do PAINEL (/admin/*). Todo service do painel usa `requisitarAdmin`,
 * nunca `requisitar` direto — é aqui que a sessão vencida vira "volte para o login" em
 * qualquer tela, sem cada uma tratar isso na mão.
 *
 * Regras do backend (docs/para-o-frontend.md, "Painel administrativo — acesso"):
 * - A sessão do painel (cookie `vip_sessao_admin`) dura 12h e NÃO renova com o uso. Passado
 *   o prazo, qualquer rota volta 401 NAO_IDENTIFICADO: é "a sessão acabou", não erro da tela.
 * - 403 SEM_PERMISSAO: quem bate está identificado como CLIENTE da loja (tem o cookie do
 *   cliente e não tem o do admin). Mandar para o login não resolve — essa conta não tem senha.
 *
 * O login (POST /admin/sessao) NÃO passa por aqui: o 401 dele é CREDENCIAIS_INVALIDAS, que
 * é erro do formulário, não sessão vencida.
 */

import { ErroApi, requisitar } from './apiClient.js';

const ouvintes = new Set();

/**
 * Registra quem reage à perda de acesso (o ProvedorSessaoAdmin). Devolve a função que
 * cancela o registro. O ouvinte recebe o `ErroApi` (401 ou 403).
 */
export function aoPerderAcessoAdmin(ouvinte) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export const ehSessaoAdminVencida = (erro) =>
  erro instanceof ErroApi && erro.status === 401 && erro.codigo === 'NAO_IDENTIFICADO';

export const ehSessaoDeCliente = (erro) =>
  erro instanceof ErroApi && erro.status === 403 && erro.codigo === 'SEM_PERMISSAO';

/** Mesma assinatura de `requisitar`. O erro continua sendo lançado para a tela. */
export async function requisitarAdmin(metodo, caminho, opcoes) {
  try {
    return await requisitar(metodo, caminho, opcoes);
  } catch (erro) {
    if (ehSessaoAdminVencida(erro) || ehSessaoDeCliente(erro)) {
      ouvintes.forEach((ouvinte) => ouvinte(erro));
    }
    throw erro;
  }
}
