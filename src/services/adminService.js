/*
 * Sessão do PAINEL (docs/para-o-frontend.md, "Painel administrativo — acesso"). Cookie
 * `vip_sessao_admin`, independente do `vip_sessao_cliente`: um não abre nem fecha o outro.
 * Resposta do administrador: { id, nome, email, ultimoLoginEm, criadoEm }.
 * `ultimoLoginEm` é o instante DESTE login (não o anterior) — serve para "sessão iniciada em".
 *
 * Os services do painel usam `requisitarAdmin` (src/lib/apiAdmin.js), menos o login.
 */

import { requisitar } from '../lib/apiClient.js';
import { requisitarAdmin } from '../lib/apiAdmin.js';

export const adminService = {
  /**
   * POST /admin/sessao — entrar (rotas/admin_sessao.py). Falha: 401 CREDENCIAIS_INVALIDAS, a MESMA
   * resposta para e-mail inexistente, senha errada e conta desativada; 429 EXCESSO_TENTATIVAS
   * (5 por minuto por IP). Não passa por `requisitarAdmin`: esse 401 é do formulário.
   */
  entrar: (email, senha) => requisitar('POST', '/admin/sessao', { corpo: { email, senha } }),

  /**
   * GET /admin/eu — eu (rotas/admin_painel.py). Fora do contrato v1.0; existe no backend.
   * 401 NAO_IDENTIFICADO = sem sessão ou sessão vencida; 403 SEM_PERMISSAO = sessão de cliente.
   */
  eu: (sinal) => requisitarAdmin('GET', '/admin/eu', { sinal }),

  /** DELETE /admin/sessao — sair. 200 {"ok": true}, revoga no banco e limpa o cookie, mesmo expirada. */
  sair: () => requisitar('DELETE', '/admin/sessao'),
};
