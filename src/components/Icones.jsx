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

export const IconeFiltro = (props) => (
  <svg {...base} {...props}>
    <path d="M3.5 7h17M7 12h10M10 17h4" />
  </svg>
);

// Marca oficial do WhatsApp, monocromática. Só aparece ao lado do texto "WhatsApp".
export const IconeWhatsApp = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable={false} {...props}>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.02c0-5.2 4.24-9.43 9.45-9.43a9.4 9.4 0 0 1 6.68 2.77 9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.45 9.43zm8.04-17.47A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.58 23.7l6.1-1.6a11.33 11.33 0 0 0 5.37 1.37h.01c6.26 0 11.36-5.1 11.37-11.37 0-3.03-1.18-5.89-3.34-8.03z" />
  </svg>
);
