import { useEffect, useRef } from 'react';
import './IlustracaoSobre.css';

/*
 * Ilustração animada da página Sobre (docs/decisoes-frontend.md, seção 36): quatro pessoas que
 * piscam, mexem as sobrancelhas e acenam. É um Lottie (lottie.host/c9e55681-…/L891TyIje4.json,
 * guardado sem mudança em assets/animacoes/sobre-equipe.json), com 51 camadas — complexo demais
 * para refazer em CSS como o carregador e a sacola —, então toca com o lottie-web (versão leve,
 * só SVG). Biblioteca e JSON são importados aqui dentro, sob demanda: só quem abre o Sobre baixa.
 *
 * Cores: o JSON tem 24 cores (pele, cabelo, roupa…). Cada uma vira um tom da rampa da marca
 * (--cor-ilustracao-escura → -clara → -luz) pela claridade dela, então o que era escuro continua
 * escuro e o que era claro continua claro, mas tudo em verde, creme e branco.
 */

// Claridade (L*, de 0 a 100) que cai em cada ponta da rampa. Abaixo da primeira, tudo é o tom
// escuro; entre as duas, mistura do escuro com o claro; acima da segunda, do claro com a luz.
const CLARIDADE_ESCURA = 20;
const CLARIDADE_CLARA = 80;

// O quadro original tem 1920 × 1080, mas o desenho, somando todos os quadros, vai de x 147 (a mão
// da moça da esquerda acenando, no quadro 71) a 1658 e de y −9 a 1089 — passa um pouco do quadro em
// cima e embaixo. O recorte pega isso com folga dos quatro lados. A proporção da caixa é
// --proporcao-ilustracao-sobre (LARGURA / ALTURA): mudou o recorte, mude o token.
const RECORTE = { x: 120, y: -15, largura: 1570, altura: 1110 };

export default function IlustracaoSobre() {
  const ref = useRef(null);

  useEffect(() => {
    let cancelado = false;
    let animacao = null;
    let observador = null;

    Promise.all([import('lottie-web/build/player/lottie_light'), import('../assets/animacoes/sobre-equipe.json')])
      .then(([{ default: lottie }, { default: dados }]) => {
        if (cancelado || !ref.current) return;
        const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        animacao = lottie.loadAnimation({
          container: ref.current,
          renderer: 'svg',
          loop: true,
          autoplay: false,
          // Cópia: o lottie-web altera o objeto que recebe, e o módulo do JSON é o mesmo a cada visita.
          animationData: recortar(recolorir(structuredClone(dados))),
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
        });
        // Movimento reduzido: fica parada no primeiro quadro, todo mundo de rosto para a frente.
        if (reduzido) {
          animacao.goToAndStop(0, true);
          return;
        }
        // Fora da tela não anima: o lottie-web desenha cada quadro na thread principal.
        observador = new IntersectionObserver(([entrada]) => {
          if (entrada.isIntersecting) animacao.play();
          else animacao.pause();
        });
        observador.observe(ref.current);
      })
      // Sem a ilustração, a página continua inteira: o texto é o conteúdo.
      .catch(() => {});

    return () => {
      cancelado = true;
      observador?.disconnect();
      animacao?.destroy();
    };
  }, []);

  return <div ref={ref} className="ilustracao-sobre" aria-hidden />;
}

// Troca o tamanho do quadro e move a camada de cima (o grupo das quatro pessoas) junto.
function recortar(dados) {
  dados.w = RECORTE.largura;
  dados.h = RECORTE.altura;
  dados.layers[0].ks.p.k[0] -= RECORTE.x;
  dados.layers[0].ks.p.k[1] -= RECORTE.y;
  return dados;
}

// Troca toda cor sólida (preenchimento e traço) pelo tom da marca de mesma claridade.
function recolorir(dados) {
  const estilo = getComputedStyle(document.documentElement);
  const rampa = ['--cor-ilustracao-escura', '--cor-ilustracao-clara', '--cor-ilustracao-luz'].map((nome) =>
    hexParaRgb(estilo.getPropertyValue(nome)),
  );

  const formas = (itens) => {
    for (const item of itens) {
      if (item.ty === 'gr') formas(item.it);
      else if ((item.ty === 'fl' || item.ty === 'st') && item.c?.a === 0) {
        const [r, g, b, a = 1] = item.c.k;
        item.c.k = [...tomDaMarca([r, g, b], rampa), a];
      }
    }
  };
  const camadas = (lista = []) => lista.forEach((camada) => formas(camada.shapes || []));
  camadas(dados.layers);
  (dados.assets || []).forEach((asset) => camadas(asset.layers));
  return dados;
}

function tomDaMarca(cor, [escura, clara, luz]) {
  const l = claridade(cor);
  if (l >= CLARIDADE_CLARA) return misturar(clara, luz, (l - CLARIDADE_CLARA) / (100 - CLARIDADE_CLARA));
  return misturar(escura, clara, (l - CLARIDADE_ESCURA) / (CLARIDADE_CLARA - CLARIDADE_ESCURA));
}

function claridade([r, g, b]) {
  const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const y = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
  return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y;
}

function misturar(a, b, t) {
  const p = Math.min(1, Math.max(0, t));
  return a.map((v, i) => v + (b[i] - v) * p);
}

function hexParaRgb(hex) {
  const n = parseInt(hex.trim().slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}
