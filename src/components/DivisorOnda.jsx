import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../lib/cn.js';
import './DivisorOnda.css';

/*
 * Onda que divide seções: na home e na página do produto, acima de "Você Também Pode Gostar"
 * (docs/decisoes-frontend.md, seção 32).
 *
 * Três faixas de SVG (névoa, faixa e fio) em degradê creme → verde, desfocadas nas bordas.
 * Cada SVG tem o dobro da largura da tela e um desenho que se repete a cada metade, então a
 * animação só desliza o SVG inteiro (translateX de 0 a −50%): o navegador pinta a onda uma vez
 * e o resto é composição, sem recalcular caminho nem desfoque a cada quadro. Fora da tela a
 * animação pausa; com prefers-reduced-motion a onda fica parada (DivisorOnda.css).
 *
 * A onda aparece sempre inteira: não depende da rolagem (seção 49).
 */

// Unidades do viewBox. O SVG estica para 200% da largura e --altura-onda de altura
// (preserveAspectRatio="none"), então PERIODO vale sempre uma largura de tela.
const PERIODO = 1200;
const LARGURA = 2 * PERIODO;
const ALTURA = 160;
const PASSO = 12;

// Cada camada: curva (amplitude + uma harmônica para não ficar senoide de livro), espessura que
// engorda e afina ao longo do caminho, desfoque "x y" e as paradas do degradê [posição, cor, opacidade].
// Toda função aqui tem período PERIODO (ou divisor dele): é isso que fecha o loop sem emenda.
const CAMADAS = [
  {
    nome: 'nevoa',
    curva: { amplitude: 20, fase: 0.4, harmonica: 5, faseHarmonica: 1.1 },
    espessura: { base: 46, variacao: 16, fase: 2.2 },
    desfoque: '14 10',
    // Só creme: verde desfocado sobre o papel vira cinza e lê como sombra.
    degrade: [
      [0, 'luz', 1],
      [0.5, 'luz', 0.45],
      [1, 'luz', 1],
    ],
  },
  {
    nome: 'faixa',
    curva: { amplitude: 30, fase: 0, harmonica: 6, faseHarmonica: 2.6 },
    espessura: { base: 26, variacao: 16, fase: 1.4 },
    desfoque: '3 4',
    degrade: [
      [0, 'luz', 1],
      [0.22, 'luz', 1],
      [0.55, 'corpo', 0.88],
      [0.78, 'corpo', 0.7],
      [1, 'luz', 1],
    ],
  },
  {
    nome: 'fio',
    curva: { amplitude: 32, fase: 0.7, harmonica: 4, faseHarmonica: 0.3 },
    espessura: { base: 2.4, variacao: 0.9, fase: 0 },
    desfoque: '0.6 0.8',
    degrade: [
      [0, 'corpo', 0.85],
      [0.5, 'luz', 1],
      [1, 'corpo', 0.85],
    ],
  },
].map((camada) => ({ ...camada, caminho: caminhoFaixa(camada) }));

// Faixa fechada: borda de cima da esquerda para a direita, de baixo de volta. Passa um pouco das
// bordas do viewBox para o desfoque não "cortar" a ponta.
function caminhoFaixa({ curva, espessura }) {
  const cima = [];
  const baixo = [];
  for (let x = -8 * PASSO; x <= LARGURA + 8 * PASSO; x += PASSO) {
    const angulo = (2 * Math.PI * x) / PERIODO;
    const centro =
      ALTURA / 2 +
      curva.amplitude * Math.sin(angulo + curva.fase) +
      curva.harmonica * Math.sin(2 * angulo + curva.faseHarmonica);
    const meia = (espessura.base + espessura.variacao * Math.sin(angulo + espessura.fase)) / 2;
    cima.push(`${x} ${(centro - meia).toFixed(2)}`);
    baixo.push(`${x} ${(centro + meia).toFixed(2)}`);
  }
  return `M${cima.join('L')}L${baixo.reverse().join('L')}Z`;
}

/**
 * `espelhada` inverte o desenho e o sentido (para duas ondas seguidas não parecerem cópia);
 * `fase` (0, 1, 2…) adianta o ciclo de cada onda pelo mesmo motivo.
 */
export default function DivisorOnda({ espelhada = false, fase = 0 }) {
  const id = useId().replace(/[^\w-]/g, '');
  const ref = useRef(null);
  const [naTela, setNaTela] = useState(true);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento || typeof IntersectionObserver === 'undefined') return undefined;
    const observador = new IntersectionObserver(([entrada]) => setNaTela(entrada.isIntersecting));
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn('onda', espelhada && 'onda--espelhada', !naTela && 'onda--parada')}
      style={{ '--onda-fase': fase }}
      aria-hidden
    >
      {CAMADAS.map((camada) => {
        const degrade = `${id}-${camada.nome}-degrade`;
        const desfoque = `${id}-${camada.nome}-desfoque`;
        return (
          <svg
            key={camada.nome}
            className={`onda__camada onda__camada--${camada.nome}`}
            viewBox={`0 0 ${LARGURA} ${ALTURA}`}
            preserveAspectRatio="none"
            focusable="false"
          >
            <defs>
              <linearGradient
                id={degrade}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2={PERIODO}
                y2="0"
                spreadMethod="repeat"
              >
                {camada.degrade.map(([posicao, cor, opacidade]) => (
                  <stop key={posicao} offset={posicao} className={`onda__cor--${cor}`} stopOpacity={opacidade} />
                ))}
              </linearGradient>
              <filter id={desfoque} x="-5%" y="-100%" width="110%" height="300%">
                <feGaussianBlur stdDeviation={camada.desfoque} />
              </filter>
            </defs>
            <path d={camada.caminho} fill={`url(#${degrade})`} filter={`url(#${desfoque})`} />
          </svg>
        );
      })}
    </div>
  );
}
