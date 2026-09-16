import { useEffect, useRef, useState } from 'react';

/**
 * Vira `true` na primeira vez que o elemento entra na tela e não volta mais a `false`.
 * Serve só para movimento disparado pelo scroll que acontece uma vez (hoje: o filete do
 * cabeçalho de seção se desenhando). Não use para fade-up de cartão ou texto.
 */
export function useVisivelUmaVez({ margem = '0px 0px -10% 0px' } = {}) {
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento || visivel) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setVisivel(true);
      return undefined;
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true);
          observador.disconnect();
        }
      },
      { rootMargin: margem },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [margem, visivel]);

  return [ref, visivel];
}
