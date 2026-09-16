import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSessaoCliente } from '../contexto/SessaoCliente.jsx';
import Cabecalho from './Cabecalho.jsx';
import Rodape from './Rodape.jsx';
import './Estrutura.css';

export default function Estrutura() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
