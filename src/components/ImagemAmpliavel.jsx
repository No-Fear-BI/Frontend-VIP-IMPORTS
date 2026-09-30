// Foto com zoom que acompanha o mouse e clique que amplia.
// Passar o mouse mostra a foto ampliada (FATOR_ZOOM) com o ponto sob o cursor:
// mouse na gola, a gola vem para a frente; na manga, a manga. O zoom usa
// background-position em % — o navegador alinha sozinho o ponto do cursor,
// sem matemática de pixel no JS além da própria posição do mouse.
// O clique continua abrindo a foto grande no Modal (item 11): Esc, clique fora
// e devolução de foco já são do <dialog> nativo do Modal.
// Sem url, devolve os children como estão — "Foto em breve" é do FotoProduto.
import { useRef, useState } from 'react';
import Modal from './ui/Modal.jsx';
import './ImagemAmpliavel.css';

const FATOR_ZOOM = 2.5;

export default function ImagemAmpliavel({ url, alt = '', children, className = '' }) {
  const [ampliada, setAmpliada] = useState(false);
  const [posicao, setPosicao] = useState(null);
  const gatilho = useRef(null);

  if (!url) return children || null;

  function aoMover(evento) {
    const caixa = gatilho.current?.getBoundingClientRect();
    if (!caixa) return;
    const travar = (valor) => Math.min(100, Math.max(0, valor));
    setPosicao({
      x: travar(((evento.clientX - caixa.left) / caixa.width) * 100),
      y: travar(((evento.clientY - caixa.top) / caixa.height) * 100),
    });
  }

  return (
    <>
      <button
        ref={gatilho}
        type="button"
        className={`imagem-ampliavel__gatilho ${className}`}
        onClick={() => setAmpliada(true)}
        onMouseMove={aoMover}
        onMouseLeave={() => setPosicao(null)}
        aria-label="Ampliar foto"
      >
        {children || <img src={url} alt={alt} loading="lazy" />}
        {posicao && (
          <span
            className="imagem-ampliavel__zoom"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${url})`,
              backgroundSize: `${FATOR_ZOOM * 100}% ${FATOR_ZOOM * 100}%`,
              backgroundPosition: `${posicao.x}% ${posicao.y}%`,
            }}
          />
        )}
      </button>

      <Modal aberto={ampliada} onFechar={() => setAmpliada(false)} titulo={alt || 'Foto ampliada'}>
        <img src={url} alt={alt} className="imagem-ampliavel__grande" />
      </Modal>
    </>
  );
}