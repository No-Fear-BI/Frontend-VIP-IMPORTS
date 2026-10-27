import { Link } from 'react-router-dom';
import { IconeCopiar, IconeLapis, IconeLixeira, IconeSetaBaixo, IconeSetaCima } from '../../components/Icones.jsx';
import { cn } from '../../lib/cn.js';
import './BotaoIcone.css';

const ICONES = {
  editar: IconeLapis,
  duplicar: IconeCopiar,
  excluir: IconeLixeira,
  subir: IconeSetaCima,
  descer: IconeSetaBaixo,
};

/*
 * Ação de lista do painel só com desenho: lápis = editar, dois quadrados = duplicar, lixeira =
 * excluir, setas = mover para cima/baixo (docs/decisoes-frontend.md, seções 31 e 48). O texto vai
 * em `rotulo`, que vira aria-label (leitor de tela) e title (dica ao parar o mouse) — por isso o
 * rótulo leva o nome do item: "Editar Bolsas", não só "Editar". Com `para`, vira <Link> (editar
 * que abre outra tela).
 */
export default function BotaoIcone({ acao, rotulo, para, className, ...props }) {
  const Icone = ICONES[acao];
  const comum = { className: cn('botao-icone', className), 'aria-label': rotulo, title: rotulo };
  if (para) {
    return (
      <Link to={para} {...comum} {...props}>
        <Icone />
      </Link>
    );
  }
  return (
    <button type="button" {...comum} {...props}>
      <Icone />
    </button>
  );
}
