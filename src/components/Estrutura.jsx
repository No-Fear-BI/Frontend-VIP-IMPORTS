import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAcesso } from '../contexto/AcessoLoja.jsx';
import { useSessaoCliente } from '../contexto/SessaoCliente.jsx';
import Cabecalho from './Cabecalho.jsx';
import PortaoAcesso, { PortaoCarregando } from './PortaoAcesso.jsx';
import Rodape from './Rodape.jsx';
import './Estrutura.css';

/*
 * Estrutura da LOJA e, por isso, o portão do modo aprovação: enquanto `podeNavegar` for false,
 * tudo isto (cabeçalho, rodapé, páginas) é trocado pela tela de bloqueio. As rotas /admin/* não
 * passam por aqui (ver App.jsx) — a equipe precisa do painel para desligar o portão.
 */
export default function Estrutura() {
  const { pathname } = useLocation();
  const { estado, carregando } = useAcesso();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (carregando) return <PortaoCarregando />;
  // Falha ABERTA, igual ao backend: sem resposta válida do /acesso/estado, a loja
  // renderiza. Bloquear por erro de rede trancaria a loja por acidente, e trancar
  // a loja é decisão do painel. Se o modo estiver em aprovação, a primeira chamada
  // de catálogo volta 403 do portão, o provedor atualiza o estado e o portão
  // aparece — esse caminho já está implementado e cobre o caso real.
  if (estado && !estado.podeNavegar) return <PortaoAcesso />;

  return (
    <>
      <a href="#conteudo" className="pular-para-conteudo t-label-caps">
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo" className="conteudo">
        <Outlet />
      </main>
      <Rodape />
      <Aviso />
    </>
  );
}

/** Mensagem temporária no pé da tela. */
function Aviso() {
  const { aviso, fecharAviso } = useSessaoCliente();
  return (
    <div className="aviso-regiao" role="status" aria-live="polite">
      {aviso && (
        <div key={aviso.id} className="aviso t-body-sm">
          <span>{aviso.texto}</span>
          <button type="button" className="link-caps" onClick={fecharAviso}>
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
