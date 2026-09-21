/*
 * Sessão do CLIENTE da loja (cookie `vip_sessao_cliente`), seleção (carrinho) e favoritos.
 * Não confundir com a sessão do painel (`vip_sessao_admin`): são independentes, e o
 * painel não deve ler nada daqui.
 *
 * Decisão de produto (docs/decisoes-frontend.md): não existe carrinho anônimo. O único
 * caminho para um item entrar na seleção é "Consultar valores no WhatsApp", que identifica o
 * cliente antes. Por isso POST /carrinho/migrar não é usado na loja.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ehNaoIdentificado } from '../lib/apiClient.js';
import { carrinhoService } from '../services/carrinhoService.js';
import { clienteService } from '../services/clienteService.js';
import { favoritosService } from '../services/favoritosService.js';

const Contexto = createContext(null);

export function ProvedorSessaoCliente({ children }) {
  const [cliente, setCliente] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [itens, setItens] = useState([]);
  const [favoritos, setFavoritos] = useState(() => new Set());
  const [aviso, setAviso] = useState(null);

  const avisar = useCallback((texto) => {
    setAviso({ texto, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(null), 5000);
    return () => clearTimeout(t);
  }, [aviso]);

  const recarregarSelecao = useCallback(async () => {
    try {
      const lista = await carrinhoService.obter();
      setItens(lista);
      return lista;
    } catch (erro) {
      if (ehNaoIdentificado(erro)) {
        setCliente(null);
        setItens([]);
        return [];
      }
      throw erro;
    }
  }, []);

  const carregarDadosDoCliente = useCallback(async () => {
    const [lista, favs] = await Promise.allSettled([carrinhoService.obter(), favoritosService.listar()]);
    if (lista.status === 'fulfilled') setItens(lista.value);
    if (favs.status === 'fulfilled') setFavoritos(new Set(favs.value.map((p) => p.id)));
  }, []);

  useEffect(() => {
    clienteService.eu()
      .then((dados) => {
        setCliente(dados);
        return carregarDadosDoCliente();
      })
      .catch(() => setCliente(null))
      .finally(() => setVerificando(false));
  }, [carregarDadosDoCliente]);

  /** Sempre 200 no backend, conta nova ou existente: a tela segue igual nos dois casos. */
  const identificar = useCallback(
    async (email) => {
      const dados = await clienteService.identificar(email);
      setCliente(dados);
      await carregarDadosDoCliente();
      return dados;
    },
    [carregarDadosDoCliente],
  );

  const sair = useCallback(async () => {
    await clienteService.sair();
    setCliente(null);
    setItens([]);
    setFavoritos(new Set());
  }, []);

  const alternarFavorito = useCallback(
    async (produtoId) => {
      const jaEra = favoritos.has(produtoId);
      const proximo = new Set(favoritos);
      if (jaEra) proximo.delete(produtoId);
      else proximo.add(produtoId);
      setFavoritos(proximo);
      try {
        if (jaEra) await favoritosService.remover(produtoId);
        else await favoritosService.adicionar(produtoId);
      } catch (erro) {
        setFavoritos(favoritos);
        throw erro;
      }
    },
    [favoritos],
  );

  const valor = useMemo(
    () => ({
      cliente,
      setCliente,
      verificando,
      identificar,
      sair,
      itens,
      recarregarSelecao,
      favoritos,
      alternarFavorito,
      aviso,
      avisar,
      fecharAviso: () => setAviso(null),
    }),
    [cliente, verificando, identificar, sair, itens, recarregarSelecao, favoritos, alternarFavorito, aviso, avisar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessaoCliente() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useSessaoCliente precisa estar dentro de <ProvedorSessaoCliente>.');
  return valor;
}
