// Ícones desenhados à mão: traço 1,25px, currentColor.
// Tamanho vem do CSS de quem usa (20px no cabeçalho, 16px dentro de botão).

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'square',
  'aria-hidden': true,
  focusable: false,
};

export const IconeBusca = (props) => (
  <svg {...base} {...props}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 20 20" />
  </svg>
);

export const IconeSacola = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 8h15l-1 12.5h-13z" />
    <path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" />
  </svg>
);

export const IconePessoa = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="8" r="3.75" />
    <path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" />
  </svg>
);

export const IconeCoracao = ({ preenchido, ...props }) => (
  <svg {...base} fill={preenchido ? 'currentColor' : 'none'} {...props}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z" />
  </svg>
);

export const IconeAlerta = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3.5 21.5 20h-19z" />
    <path d="M12 10v4.5M12 17v.5" />
  </svg>
);

export const IconeMenu = (props) => (
  <svg {...base} {...props}>
    <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
  </svg>
);

export const IconeFechar = (props) => (
  <svg {...base} {...props}>
    <path d="m5.5 5.5 13 13M18.5 5.5l-13 13" />
  </svg>
);

export const IconeSeta = (props) => (
  <svg {...base} {...props}>
    <path d="M4 12h15M14 7l5 5-5 5" />
  </svg>
);

export const IconeSetaEsquerda = (props) => (
  <svg {...base} {...props}>
    <path d="M20 12H5M10 7l-5 5 5 5" />
  </svg>
);

// Só a ponta da seta, para o botão redondo de passar fotos do produto.
export const IconeChevronDireita = (props) => (
  <svg {...base} {...props}>
    <path d="m9.5 6 6 6-6 6" />
  </svg>
);

export const IconeChevronEsquerda = (props) => (
  <svg {...base} {...props}>
    <path d="m14.5 6-6 6 6 6" />
  </svg>
);

export const IconeSetaCima = (props) => (
  <svg {...base} {...props}>
    <path d="M12 20V5M7 10l5-5 5 5" />
  </svg>
);

export const IconeSetaBaixo = (props) => (
  <svg {...base} {...props}>
    <path d="M12 4v15M7 14l5 5 5-5" />
  </svg>
);

export const IconeLapis = (props) => (
  <svg {...base} {...props}>
    <path d="M15.5 4.5l4 4-11 11h-4v-4z" />
    <path d="M13 7l4 4" />
  </svg>
);

export const IconeLixeira = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 6.5h15M9.5 6.5V4h5v2.5" />
    <path d="M6.5 6.5l1 14h9l1-14" />
    <path d="M10.5 10.5v6M13.5 10.5v6" />
  </svg>
);

// Duplicar (painel): dois quadrados sobrepostos, a cópia na frente.
export const IconeCopiar = (props) => (
  <svg {...base} {...props}>
    <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="1.5" />
    <path d="M15.5 8.5v-3A1.5 1.5 0 0 0 14 4H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5h3" />
  </svg>
);

export const IconeFiltro = (props) => (
  <svg {...base} {...props}>
    <path d="M3.5 7h17M7 12h10M10 17h4" />
  </svg>
);

// ---- Menu do painel (paginas/admin/EstruturaAdmin.jsx): um desenho por opção. ----

export const IconePulso = (props) => (
  <svg {...base} {...props}>
    <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
  </svg>
);

export const IconeGrade = (props) => (
  <svg {...base} {...props}>
    <rect x="4" y="4" width="6.5" height="6.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" />
  </svg>
);

export const IconePrancheta = (props) => (
  <svg {...base} {...props}>
    <path d="M8.5 5H6v15.5h12V5h-2.5" />
    <rect x="8.5" y="3.5" width="7" height="3" />
    <path d="m9 13.5 2 2 4-4" />
  </svg>
);

export const IconeBalao = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3z" />
  </svg>
);

export const IconeRecibo = (props) => (
  <svg {...base} {...props}>
    <path d="M6 3.5h12v17l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5z" />
    <path d="M9 8.5h6M9 12h6M9 15.5h3" />
  </svg>
);

export const IconePessoas = (props) => (
  <svg {...base} {...props}>
    <circle cx="9" cy="8.5" r="3.25" />
    <path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
    <path d="M15 5.5a3.25 3.25 0 0 1 0 6M17 14.8c1.9.5 3.1 2.1 3.5 4.7" />
  </svg>
);

export const IconePasta = (props) => (
  <svg {...base} {...props}>
    <path d="M3.5 6h6l2 2.5h9v10h-17z" />
  </svg>
);

export const IconeCaixa = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3.5 20 7.5v9l-8 4-8-4v-9z" />
    <path d="m4 7.5 8 4 8-4M12 11.5v9" />
  </svg>
);

export const IconeEtiqueta = (props) => (
  <svg {...base} {...props}>
    <path d="M4 4h7l9 9-7 7-9-9z" />
    <circle cx="8" cy="8" r="1.25" />
  </svg>
);

export const IconeGota = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3.5c3 4 6 7.2 6 10.5a6 6 0 0 1-12 0c0-3.3 3-6.5 6-10.5z" />
  </svg>
);

export const IconeCamadas = (props) => (
  <svg {...base} {...props}>
    <path d="M12 4 20.5 8.5 12 13 3.5 8.5z" />
    <path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" />
  </svg>
);

export const IconeImagem = (props) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="5" width="17" height="14" />
    <circle cx="9" cy="10" r="1.75" />
    <path d="m3.5 17 5-5 4 4 2.5-2.5 5.5 5.5" />
  </svg>
);

export const IconeBrilho = (props) => (
  <svg {...base} {...props}>
    <path d="M11 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5z" />
    <path d="M18.5 15v5M16 17.5h5" />
  </svg>
);

export const IconeCadeado = (props) => (
  <svg {...base} {...props}>
    <rect x="5" y="10.5" width="14" height="10" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
);

export const IconeAjustes = (props) => (
  <svg {...base} {...props}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </svg>
);

export const IconeCartao = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="6" width="18" height="12" />
    <path d="M3 10h18M6.5 14.5h3" />
  </svg>
);

// Marca oficial do WhatsApp, monocromática. Só aparece ao lado do texto "WhatsApp".
export const IconeWhatsApp = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable={false} {...props}>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.02c0-5.2 4.24-9.43 9.45-9.43a9.4 9.4 0 0 1 6.68 2.77 9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.45 9.43zm8.04-17.47A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.58 23.7l6.1-1.6a11.33 11.33 0 0 0 5.37 1.37h.01c6.26 0 11.36-5.1 11.37-11.37 0-3.03-1.18-5.89-3.34-8.03z" />
  </svg>
);
