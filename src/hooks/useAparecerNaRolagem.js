import { useEffect, useRef } from 'react';

// Vale para o cartão de produto (components/Produto.jsx) e o de categoria (CartaoCategoria em
// paginas/Home.jsx). CSS em global.css, seção "Aparecer na rolagem".

// Quantos cartões, no máximo, entram em cascata de uma vez (o resto entra junto com o último).
const LIMITE_CASCATA = 4;

// Um observador só para todos os cartões da página, em vez de um por cartão.
let observador = null;

function observar(elemento) {
  if (!observador) {
    observador = new IntersectionObserver(
      (entradas) => {
        // As entradas chegam na ordem em que os cartões montaram (a da grade): a fileira que
        // entra junta aparece da esquerda para a direita.
        let ordem = 0;
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          entrada.target.style.setProperty('--ordem-aparece', Math.min(ordem++, LIMITE_CASCATA));
          entrada.target.dataset.aparece = 'visivel';
          observador.unobserve(entrada.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
  }
  observador.observe(elemento);
}

/**
 * Cartão que monta abaixo da dobra espera escondido e aparece (sobe e ganha opacidade) na
 * primeira vez que a rolagem o traz para a tela; não anima de novo ao rolar de volta. O que já
 * está na tela quando monta fica como está, então nada pisca e a entrada da página não se repete
 * cartão por cartão. Sem IntersectionObserver ou com prefers-reduced-motion, não faz nada.
 * O estado vai em `data-aparece`, direto no DOM, sem re-render.
 */
export function useAparecerNaRolagem() {
  const ref = useRef(null);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento || typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (elemento.getBoundingClientRect().top < window.innerHeight) return undefined;
    elemento.dataset.aparece = 'espera';
    observar(elemento);
    return () => observador.unobserve(elemento);
  }, []);

  return ref;
}
