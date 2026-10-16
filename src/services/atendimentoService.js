/*
 * Chat do atendimento Burnwood na loja (Backend: docs/para-o-frontend.md, "Atendimento Burnwood").
 *
 * A loja nunca fala com a Burnwood direto e nunca vê a key: o backend descobre o canal com a key e
 * devolve só o que é público.
 */

import { requisitar } from '../lib/apiClient.js';

export const atendimentoService = {
  /**
   * GET /atendimento/widget — pública e fora do portão. Os dois `null` = chat desligado.
   * @returns {Promise<{ widgetUrl: string|null, chaveCanal: string|null }>}
   */
  widget: (sinal) => requisitar('GET', '/atendimento/widget', { sinal }),
};
