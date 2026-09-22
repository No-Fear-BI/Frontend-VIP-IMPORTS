/*
 * Sessão do PAINEL (cookie `vip_sessao_admin`). Montado só em /admin/* (App.jsx), e não lê
 * nada de SessaoCliente: as duas sessões são independentes no backend e aqui também.
 *
 * `situacao`:
 *   'verificando'  GET /admin/eu em andamento (ao abrir o painel)
 *   'dentro'       sessão de admin válida → `admin` preenchido
 *   'fora'         401: sem sessão, ou a de 12h acabou → rota protegida manda para o login
 *   'cliente'      403: identificado como CLIENTE da loja → mensagem própria, SEM mandar ao login
 *   'erro'         a verificação falhou por outro motivo (rede, 500) → "Tentar de novo"
 *
 * Qualquer chamada do painel que volte 401/403 depois de entrar (src/lib/apiAdmin.js) derruba
 * a situação aqui, e a rota protegida reage — nenhuma tela trata sessão vencida na mão.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { aoPerderAcessoAdmin, ehSessaoAdminVencida, ehSessaoDeCliente } from '../lib/apiAdmin.js';
import { adminService } from '../services/adminService.js';

const Contexto = createContext(null);

export function ProvedorSessaoAdmin({ children }) {
  const [admin, setAdmin] = useState(null);
  const [situacao, setSituacao] = useState('verificando');
  const [erro, setErro] = useState(null);
  // Frase para a tela de login quando a sessão caiu no meio do uso (não na primeira visita).
  const [avisoLogin, setAvisoLogin] = useState(null);

  const verificar = useCallback(async (sinal) => {
    setSituacao('verificando');
    setErro(null);
    try {
      const dados = await adminService.eu(sinal);
      setAdmin(dados);
      setSituacao('dentro');
    } catch (falha) {
      if (falha.name === 'AbortError') return;
      setAdmin(null);
      setErro(falha);
      if (ehSessaoAdminVencida(falha)) setSituacao('fora');
      else if (ehSessaoDeCliente(falha)) setSituacao('cliente');
      else setSituacao('erro');
    }
  }, []);

  useEffect(() => {
    const controle = new AbortController();
    verificar(controle.signal);
    return () => controle.abort();
  }, [verificar]);

  const situacaoAtual = useRef(situacao);
  useEffect(() => {
    situacaoAtual.current = situacao;
  }, [situacao]);

  useEffect(
    () =>
      aoPerderAcessoAdmin((falha) => {
        if (situacaoAtual.current === 'dentro' && ehSessaoAdminVencida(falha)) setAvisoLogin(falha.mensagem);
        setSituacao(ehSessaoDeCliente(falha) ? 'cliente' : 'fora');
        setAdmin(null);
        setErro(falha);
      }),
    [],
  );

  const entrar = useCallback(async (email, senha) => {
    const dados = await adminService.entrar(email, senha);
    setAdmin(dados);
    setErro(null);
    setAvisoLogin(null);
    setSituacao('dentro');
    return dados;
  }, []);

  /** Só marca como fora se o backend confirmou: se o DELETE falhar, o cookie ainda vale. */
  const sair = useCallback(async () => {
    await adminService.sair();
    setAdmin(null);
    setErro(null);
    setAvisoLogin(null);
    setSituacao('fora');
  }, []);

  const valor = useMemo(
    () => ({ admin, situacao, erro, avisoLogin, entrar, sair, verificar: () => verificar() }),
    [admin, situacao, erro, avisoLogin, entrar, sair, verificar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessaoAdmin() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useSessaoAdmin precisa estar dentro de <ProvedorSessaoAdmin>.');
  return contexto;
}
