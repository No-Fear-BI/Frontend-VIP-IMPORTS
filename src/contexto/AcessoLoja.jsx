/*
 * Estado do PORTÃO da loja (GET /acesso/estado): se o visitante pode navegar e, se não, qual tela
 * de bloqueio mostrar. Fica DENTRO do ProvedorSessaoCliente porque depende dele: reconsulta quando
 * o cliente se identifica ou sai. Também reconsulta quando qualquer chamada volta 403
 * ACESSO_PENDENTE / ACESSO_RECUSADO (o acesso mudou no meio da navegação) e, no ACESSO_EM_ESPERA,
 * grava direto a data de liberação que veio no erro.
 *
 * Quem barra é o <Estrutura> da loja. As rotas /admin/* ficam fora dele de propósito: a equipe
 * entra no painel sem sessão de cliente, e é de lá que se desliga o portão.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { aoBarrarPeloPortao } from '../lib/apiClient.js';
import { acessoService } from '../services/acessoService.js';
import { useSessaoCliente } from './SessaoCliente.jsx';

const Contexto = createContext(null);

// setTimeout estoura acima de ~24,8 dias; a espera é de dias, mas não custa proteger.
const ATRASO_MAXIMO = 2 ** 31 - 1;

export function ProvedorAcesso({ children }) {
  const { cliente, verificando } = useSessaoCliente();
  const [estado, setEstado] = useState(null);
  const [erro, setErro] = useState(null);
  const ultimaConsulta = useRef(0);

  /** Só a resposta da consulta mais recente vale; a anterior, atrasada, é descartada. */
  const reconsultar = useCallback(async () => {
    const numero = ++ultimaConsulta.current;
    try {
      const dados = await acessoService.estado();
      if (numero !== ultimaConsulta.current) return null;
      setEstado(dados);
      setErro(null);
      return dados;
    } catch (falha) {
      if (numero !== ultimaConsulta.current) return null;
      setErro(falha);
      return null;
    }
  }, []);

  // Primeira consulta (depois de saber se há sessão) e a cada mudança de quem está identificado.
  const idDoCliente = cliente?.id ?? null;
  useEffect(() => {
    if (verificando) return;
    reconsultar();
  }, [verificando, idDoCliente, reconsultar]);

  useEffect(
    () =>
      aoBarrarPeloPortao((falha) => {
        if (falha.codigo === 'ACESSO_EM_ESPERA' && falha.detalhes?.bloqueadoAte) {
          ultimaConsulta.current += 1; // uma consulta em voo, mais velha que este erro, não sobrescreve
          setEstado((atual) =>
            atual
              ? {
                  ...atual,
                  podeNavegar: false,
                  situacao: 'recusado',
                  solicitacaoPendente: false,
                  podeSolicitar: false,
                  bloqueadoAte: falha.detalhes.bloqueadoAte,
                }
              : atual,
          );
          return;
        }
        reconsultar();
      }),
    [reconsultar],
  );

  // Trancado: ao voltar para a aba, confere de novo (a equipe pode ter aprovado nesse meio tempo).
  const trancado = Boolean(estado) && !estado.podeNavegar;
  useEffect(() => {
    if (!trancado) return undefined;
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') reconsultar();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => document.removeEventListener('visibilitychange', aoVoltar);
  }, [trancado, reconsultar]);

  // Na espera: reconsulta no instante em que ela vence, para o botão de pedir aparecer sem F5.
  const bloqueadoAte = estado?.bloqueadoAte ?? null;
  useEffect(() => {
    if (!bloqueadoAte) return undefined;
    const falta = new Date(bloqueadoAte).getTime() - Date.now();
    if (falta <= 0) {
      reconsultar();
      return undefined;
    }
    const t = setTimeout(reconsultar, Math.min(falta + 1000, ATRASO_MAXIMO));
    return () => clearTimeout(t);
  }, [bloqueadoAte, reconsultar]);

  const valor = useMemo(
    () => ({ estado, erro, carregando: !estado && !erro, reconsultar, aplicarEstado: setEstado }),
    [estado, erro, reconsultar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAcesso() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useAcesso precisa estar dentro de <ProvedorAcesso>.');
  return valor;
}
