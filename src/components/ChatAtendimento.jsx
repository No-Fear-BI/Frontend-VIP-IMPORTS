import { useEffect } from 'react';
import { atendimentoService } from '../services/atendimentoService.js';

/*
 * Chat do atendimento Burnwood: carrega o widget.js da Burnwood uma vez por página. O próprio
 * widget desenha o botão flutuante e a janela do chat (iframe da Burnwood), fora do nosso CSS.
 *
 * Mora em <Estrutura>, ANTES do portão: quem espera aprovação também fala com o atendimento.
 * Chat desligado (backend sem key, Burnwood fora do ar) = nada carrega e nada aparece.
 *
 * A `chaveCanal` (wk_…) é pública por desenho. A key da Burnwood nunca chega aqui.
 */

let carregado = false;

export default function ChatAtendimento() {
  useEffect(() => {
    if (carregado) return undefined;
    const controle = new AbortController();
    atendimentoService
      .widget(controle.signal)
      .then(({ widgetUrl, chaveCanal }) => {
        if (!widgetUrl || !chaveCanal || carregado) return;
        carregado = true;
        const script = document.createElement('script');
        script.src = `${widgetUrl}/widget.js`;
        script.async = true;
        script.dataset.burnwoodChannel = chaveCanal;
        document.body.appendChild(script);
      })
      // Chat é extra: falha aqui nunca vira erro na loja.
      .catch(() => {});
    return () => controle.abort();
  }, []);

  return null;
}
