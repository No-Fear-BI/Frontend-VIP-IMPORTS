import { useEffect } from 'react';
import { atendimentoService } from '../services/atendimentoService.js';

/*
 * Chat do atendimento Burnwood: carrega o widget.js da Burnwood uma vez por página. O próprio
 * widget desenha o botão flutuante e a janela do chat (iframe da Burnwood), fora do nosso CSS.
 *
 * Mora em <Estrutura>, só na loja liberada (nunca no portão): o agente consulta o catálogo, e o
 * backend só devolve o canal a quem passou pelo portão (decisão de 15/10/2026).
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
        // Cabeçalho do chat no verde oficial (o widget só aceita #rrggbb).
        const verde = getComputedStyle(document.documentElement)
          .getPropertyValue('--cor-primaria')
          .trim();
        if (/^#[0-9a-f]{6}$/i.test(verde)) script.dataset.burnwoodColor = verde;
        // O botão é claro (creme sobre verde da marca); o widget fixa o ícone em branco, então
        // o estilo entra no shadow root dele (aberto) para trocar fundo, ícone e borda.
        script.onload = () => {
          const raiz = document.querySelector('[data-burnwood-widget]')?.shadowRoot;
          if (!raiz) return;
          const estilo = document.createElement('style');
          estilo.textContent =
            '.launcher{background:var(--cor-secundaria);color:var(--cor-sobre-secundaria);' +
            'border:var(--borda-fina) solid var(--cor-borda);box-shadow:none}' +
            '.launcher:hover{background:var(--cor-superficie)}';
          raiz.appendChild(estilo);
        };
        document.body.appendChild(script);
      })
      // Chat é extra: falha aqui nunca vira erro na loja.
      .catch(() => {});
    return () => controle.abort();
  }, []);

  return null;
}
