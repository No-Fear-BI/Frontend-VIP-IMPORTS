import { Link } from 'react-router-dom';
import { useVisivelUmaVez } from '../hooks/useVisivelUmaVez.js';
import { IconeSeta } from './Icones.jsx';

/**
 * Cabeçalho de seção assimétrico: rótulo + título à esquerda, link à direita.
 * O filete de baixo se desenha na primeira vez que a seção aparece.
 */
export default function CabecalhoSecao({ rotulo, titulo, link, nivel = 2, id }) {
  const Titulo = `h${nivel}`;
  const [ref, visivel] = useVisivelUmaVez();
  return (
    <div ref={ref} className={`cabecalho-secao ${visivel ? 'cabecalho-secao--visivel' : ''}`}>
      <div className="cabecalho-secao__textos">
        {rotulo && <p className="t-label-caps t-muted">{rotulo}</p>}
        <Titulo className="t-headline-lg" id={id}>
          {titulo}
        </Titulo>
      </div>
      {link && (
        <Link to={link.para} className="link-caps">
          {link.rotulo} <IconeSeta />
        </Link>
      )}
      <span className="cabecalho-secao__filete" aria-hidden />
    </div>
  );
}
