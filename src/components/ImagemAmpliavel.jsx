// Foto que amplia: a miniatura vira botão e abre a mesma foto grande dentro do
// Modal existente. Esc, clique fora e devolução de foco já são resolvidos pelo
// <dialog> nativo do Modal (a única camada flutuante do site), então aqui não
// existe listener de teclado nem controle de foco: seria duplicar o que o Modal faz.
//
// Recebe só url e alt (e, opcionalmente, a miniatura como children). Serve igual
// para a capa na listagem de Produtos do painel, para a foto pendente da fila de
// revisão (URL do proxy) e para a galeria futura, porque não sabe de onde vem a URL.
//
// Sem url, devolve os children como estão: "Foto em breve" continua sendo
// trabalho do FotoProduto, não deste componente.
import { useState } from 'react';
import { acompanharMouse } from '../lib/lupa.js';
import Modal from './ui/Modal.jsx';
import './ImagemAmpliavel.css';

// `lupa`: na foto grande do modal (e só nela), o hover amplia e segue o mouse.
export default function ImagemAmpliavel({ url, alt = '', children, className = '', lupa = false }) {
  const [ampliada, setAmpliada] = useState(false);

  if (!url) return children || null;

  return (
    <>
      <button
        type="button"
        className={`imagem-ampliavel__gatilho ${className}`}
        onClick={() => setAmpliada(true)}
        aria-label="Ampliar foto"
      >
        {children || <img src={url} alt={alt} loading="lazy" />}
      </button>

      <Modal aberto={ampliada} onFechar={() => setAmpliada(false)} titulo={alt || 'Foto ampliada'}>
        {lupa ? (
          <div className="imagem-ampliavel__moldura" onMouseMove={acompanharMouse}>
            <img src={url} alt={alt} className="imagem-ampliavel__grande" />
          </div>
        ) : (
          <img src={url} alt={alt} className="imagem-ampliavel__grande" />
        )}
      </Modal>
    </>
  );
}