import { cn } from '../lib/cn.js';
import './SacolaErro.css';

/*
 * A sacola triste do estado de erro da loja (docs/decisoes-frontend.md, seção 35): a sacola vira de
 * cabeça para baixo, a alça vira boca, aparecem os olhos, e ela volta ao lugar. Refeita em SVG a
 * partir do Lottie de referência (lottie.host/67693120-…/HvA383qTyW.json, 150 × 150, 150 quadros a
 * 29,97 fps), com as cores da marca no lugar do vermelho e dos cinzas do original. As coordenadas
 * abaixo são as do JSON; o movimento está em SacolaErro.css. Decorativa: quem explica o erro é o
 * texto ao lado.
 */

// Alça da sacola (o furo da sacola de papel): de cabeça para baixo, é ela que vira a boca.
const ALCA = 'M-11.125 21C-11.125 34.875 11.25 35.625 11.25 21';
// A mesma curva no sentido contrário: a boca se desenha da ponta direita para a esquerda.
const BOCA = 'M11.25 21C11.25 35.625 -11.125 34.875 -11.125 21';

export default function SacolaErro({ className }) {
  return (
    <svg className={cn('sacola-erro', className)} viewBox="0 0 150 150" aria-hidden focusable="false">
      <circle className="sacola-erro__fundo" cx="75.15" cy="74.8" r="69.8" />
      {/* Gira em torno do centro (75, 75); por dentro, o desenho no sistema da sacola. */}
      <g className="sacola-erro__giro">
        <path
          className="sacola-erro__dentro"
          transform="translate(75 41)"
          d="M16.625 10.5L-16.75 10.5L-23.875 15.75L-14.875 36L13.5 35.75L24 15.625Z"
        />
        <g transform="translate(75.094 41)">
          <path
            className="sacola-erro__corpo"
            d="M23.938 15.938L-24.097 15.975C-24.097 15.975 -24.125 50.125 -24.125 53.438C-24.125 56.751 -21.109 57.375 -21.109 57.375L21.25 57.313C21.25 57.313 23.938 57.125 23.938 54.375C23.938 51.625 23.938 15.938 23.938 15.938Z"
          />
          <path className="sacola-erro__alca" d={ALCA} />
          <path className="sacola-erro__rosto sacola-erro__boca" d={BOCA} pathLength="1" />
        </g>
      </g>
      <path className="sacola-erro__rosto sacola-erro__olho-esquerdo" d="M69.375 62.125L69.375 70.75" pathLength="1" />
      <path className="sacola-erro__rosto sacola-erro__olho-direito" d="M79.625 62.125L79.625 70.75" pathLength="1" />
    </svg>
  );
}
