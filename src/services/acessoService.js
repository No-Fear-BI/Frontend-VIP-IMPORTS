/*
 * Portão da loja (backend, seção 05 — controle de entrada). Lado do visitante; o lado do painel
 * está em `acessoAdminService`. Nenhuma das duas rotas é barrada pelo portão.
 */

import { requisitar } from '../lib/apiClient.js';

export const acessoService = {
  /**
   * GET /acesso/estado — nunca 401. Sem sessão: `identificado: false`. Traz `modo`, `podeNavegar`,
   * `situacao`, `solicitacaoPendente`, `mensagemBloqueio`, `podeSolicitar` e `bloqueadoAte` (ISO
   * 8601, só na espera das 3 recusas seguidas).
   */
  estado: (sinal) => requisitar('GET', '/acesso/estado', { sinal }),

  /**
   * POST /acesso/solicitar — exige sessão de cliente. Corpo opcional `{nome, telefone}`. Responde
   * 200 com o mesmo formato de `estado`; idempotente. Durante a espera: 403 ACESSO_EM_ESPERA com
   * `detalhes.bloqueadoAte`.
   */
  solicitar: (corpo) => requisitar('POST', '/acesso/solicitar', { corpo: corpo || {} }),
};
