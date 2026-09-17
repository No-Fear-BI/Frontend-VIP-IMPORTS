// Fontes da direção editorial (--fonte-titulo / --fonte-texto em tokens.css), servidas pelo
// próprio site via fontsource — vêm antes do CSS global para já estar disponíveis no primeiro parse.
import '@fontsource-variable/bodoni-moda/opsz.css';
import '@fontsource-variable/bodoni-moda/opsz-italic.css';
import '@fontsource-variable/jost/wght.css';

// Estilos globais PRIMEIRO (global.css já importa tokens.css): o CSS de cada componente vem
// depois e pode refinar .botao/.link-caps.
import './styles/global.css';
import './styles/paginas.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ProvedorCompraWhatsApp } from './contexto/CompraWhatsApp.jsx';
import { ProvedorSessaoCliente } from './contexto/SessaoCliente.jsx';

createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <BrowserRouter>
      <ProvedorSessaoCliente>
        <ProvedorCompraWhatsApp>
          <App />
        </ProvedorCompraWhatsApp>
      </ProvedorSessaoCliente>
    </BrowserRouter>
  </StrictMode>,
);
