import { useRef, useState } from 'react';

// Gesto de arrastar (toque ou mouse) para um carrossel que desliza. Só o eixo horizontal vale:
// se o movimento inicial for mais vertical, o gesto é abandonado e a página rola normalmente
// (o CSS do trilho precisa de `touch-action: pan-y`).
const LIMIAR_DIRECAO_PX = 8; // movimento mínimo para decidir o eixo
const FRACAO_PARA_TROCAR = 0.2; // fração da largura que confirma a troca
const VELOCIDADE_PARA_TROCAR = 0.4; // px/ms
const JANELA_VELOCIDADE_MS = 100;
const VALIDADE_SUPRESSAO_MS = 400;

/**
 * @param {{ habilitado: boolean, aoTrocar: (delta: 1 | -1) => void }} opcoes
 *   `delta` = +1 (próximo) ou -1 (anterior).
 * @returns {{ arrasto: number, arrastando: boolean, propsTrilho: object }}
 *   `arrasto` em px (vai para a variável CSS --arrasto); `propsTrilho` espalha-se no elemento do trilho.
 */
export function useArrastoCarrossel({ habilitado, aoTrocar }) {
  const [arrasto, setArrasto] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const gesto = useRef(null);
  const suprimirClique = useRef(false);
  const temporizador = useRef(null);

  function encerrar(elemento, id) {
    if (elemento?.hasPointerCapture?.(id)) elemento.releasePointerCapture(id);
    gesto.current = null;
    setArrasto(0);
    setArrastando(false);
  }

  function aoPressionar(e) {
    if (!habilitado || gesto.current) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    gesto.current = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      largura: e.currentTarget.clientWidth || 1,
      confirmado: false,
      amostras: [{ x: e.clientX, t: e.timeStamp }],
    };
  }

  function aoMover(e) {
    const g = gesto.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x0;
    const dy = e.clientY - g.y0;

    if (!g.confirmado) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < LIMIAR_DIRECAO_PX) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        gesto.current = null; // gesto vertical: a página rola
        return;
      }
      g.confirmado = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setArrastando(true);
    }

    g.amostras.push({ x: e.clientX, t: e.timeStamp });
    while (g.amostras.length > 2 && e.timeStamp - g.amostras[0].t > JANELA_VELOCIDADE_MS) g.amostras.shift();
    setArrasto(dx);
  }

  function aoSoltar(e) {
    const g = gesto.current;
    if (!g || g.id !== e.pointerId) return;
    if (!g.confirmado) {
      gesto.current = null;
      return;
    }
    const dx = e.clientX - g.x0;
    const primeira = g.amostras[0];
    const dt = e.timeStamp - primeira.t;
    const velocidade = dt > 0 ? (e.clientX - primeira.x) / dt : 0;
    const passouDistancia = Math.abs(dx) > g.largura * FRACAO_PARA_TROCAR;
    const passouVelocidade = Math.abs(velocidade) > VELOCIDADE_PARA_TROCAR && Math.sign(velocidade) === Math.sign(dx);

    // O clique que o navegador dispara logo após o arrasto não pode abrir o link do banner.
    suprimirClique.current = true;
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => {
      suprimirClique.current = false;
    }, VALIDADE_SUPRESSAO_MS);

    encerrar(e.currentTarget, e.pointerId);
    if (dx !== 0 && (passouDistancia || passouVelocidade)) aoTrocar(dx < 0 ? 1 : -1);
  }

  function aoCancelar(e) {
    const g = gesto.current;
    if (!g || g.id !== e.pointerId) return;
    encerrar(e.currentTarget, e.pointerId);
  }

  const propsTrilho = {
    onPointerDown: aoPressionar,
    onPointerMove: aoMover,
    onPointerUp: aoSoltar,
    onPointerCancel: aoCancelar,
    onClickCapture(e) {
      if (!suprimirClique.current) return;
      suprimirClique.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
    onDragStart(e) {
      e.preventDefault(); // impede o "arrastar imagem" nativo do mouse
    },
  };

  return { arrasto, arrastando, propsTrilho };
}
