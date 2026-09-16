import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Busca dado e expõe os três estados que TODA tela precisa mostrar (CLAUDE.md):
 * carregando → esqueleto, vazio → saída sugerida, erro → botão "Tentar de novo".
 *
 * @param {(sinal: AbortSignal) => Promise<any>} buscar  deve usar o `sinal` na chamada de API
 * @param {any[]} dependencias  refaz a busca quando mudam
 */
export function useRequisicao(buscar, dependencias) {
  const [estado, setEstado] = useState({ dados: null, erro: null, carregando: true });
  const [tentativa, setTentativa] = useState(0);
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  useEffect(() => {
    const controle = new AbortController();
    setEstado((anterior) => ({ dados: anterior.dados, erro: null, carregando: true }));
    buscarRef
      .current(controle.signal)
      .then((dados) => setEstado({ dados, erro: null, carregando: false }))
      .catch((erro) => {
        if (erro.name === 'AbortError') return;
        setEstado({ dados: null, erro, carregando: false });
      });
    return () => controle.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, tentativa]);

  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);

  return { ...estado, recarregar };
}
