// Peças de produto: foto na vitrine, etiqueta do código e cartão da grade.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompra } from '../contexto/CompraWhatsApp.jsx';
import { IconeSeta, IconeWhatsApp } from './Icones.jsx';
import Button from './ui/Button.jsx';
import Card from './ui/Card.jsx';
import './Produto.css';

/**
 * Foto 4:5 com object-fit: contain sobre a vitrine branca. `capa: null` (ou URL quebrada)
 * mostra a vitrine vazia com "Foto em breve" — sem imagem genérica.
 */
export function FotoProduto({ url, alt, className = '', carregamento = 'lazy' }) {
  const [falhou, setFalhou] = useState(false);
  const semFoto = !url || falhou;
  return (
    <div className={`vitrine-foto ${className}`}>
      {semFoto ? (
        <span className="vitrine-foto__vazia t-label-caps-sm">Foto em breve</span>
      ) : (
        <img src={url} alt={alt || ''} loading={carregamento} onError={() => setFalhou(true)} />
      )}
    </div>
  );
}

export function Etiqueta({ children }) {
  return (
    <span className="etiqueta t-codigo">
      <span className="etiqueta__ilhos" aria-hidden />
      {children}
    </span>
  );
}

export function rotuloCompra(status) {
  return status === 'esgotado' ? 'Consultar disponibilidade' : 'Comprar no WhatsApp';
}

export function CartaoProduto({ produto, carregamento }) {
  const { comprar } = useCompra();
  const destino = `/produto/${encodeURIComponent(produto.codigo)}`;
  return (
    <Card como="article" className="cartao-produto">
      <Link to={destino} className="cartao-produto__link">
        <div className="cartao-produto__foto">
          <FotoProduto url={produto.capa?.url} alt={produto.capa?.alt || produto.nome} carregamento={carregamento} />
          {produto.status === 'esgotado' && <span className="selo-esgotado t-label-caps-sm">Esgotado</span>}
        </div>
        <p className="t-label-caps-sm t-muted cartao-produto__marca">{produto.marca.nome}</p>
        <h3 className="t-headline-sm">Código {produto.codigo}</h3>
        <p className="t-body-sm t-muted">{produto.categoria.nome}</p>
        <p className="t-body-sm t-muted">Valor confirmado pelo atendimento.</p>
      </Link>
      <div className="cartao-produto__acoes">
        <Link to={destino} className="link-caps">
          Ver detalhes <IconeSeta />
        </Link>
        <Button variante="texto" onClick={() => comprar({ produto })}>
          <IconeWhatsApp />
          <span>{rotuloCompra(produto.status)}</span>
        </Button>
      </div>
    </Card>
  );
}
