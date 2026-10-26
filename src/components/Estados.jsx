// Os três estados obrigatórios de toda tela que busca dado (CLAUDE.md):
// carregando, vazio (com saída) e erro (com "Tentar de novo"). Carregando na loja é o
// <Carregando> (Carregando.jsx); os esqueletos daqui são do painel.
// As classes (.estado, .estado--vazio, .estado--erro, .estado-carregando, .esqueleto*) moram em src/styles/global.css.

import { IconeAlerta } from './Icones.jsx';
import SacolaErro from './SacolaErro.jsx';
import Button from './ui/Button.jsx';

export function EstadoVazio({ titulo, texto, acao }) {
  return (
    <div className="estado estado--vazio" role="status">
      <h2 className="t-headline-md">{titulo}</h2>
      {texto && <p className="estado__texto">{texto}</p>}
      {acao && <AcaoDoEstado {...acao} />}
    </div>
  );
}

// `sacola`: a sacola triste animada no lugar do ícone de alerta. A loja passa; o painel fica com o ícone.
export function EstadoErro({ erro, onTentar, titulo = 'Não conseguimos carregar esta parte.', sacola = false }) {
  const naoEncontrado = erro?.status === 404;
  return (
    <div className="estado estado--erro" role="alert">
      {sacola ? <SacolaErro /> : <IconeAlerta className="estado__icone" />}
      <h2 className="t-headline-md">{naoEncontrado ? 'Não encontramos o que você procura.' : titulo}</h2>
      <p className="estado__texto">
        {erro?.mensagem || 'Algo deu errado do nosso lado. Tente de novo em instantes.'}
      </p>
      {naoEncontrado ? (
        <AcaoDoEstado rotulo="Ver todas as peças" para="/todos" />
      ) : (
        onTentar && <AcaoDoEstado rotulo="Tentar de novo" onClick={onTentar} />
      )}
      {erro?.rastreio && <p className="t-label-caps-sm t-muted">Código do erro: {erro.rastreio}</p>}
    </div>
  );
}

function AcaoDoEstado({ rotulo, para, onClick }) {
  if (para) {
    return (
      <Button variante="secundaria" para={para}>
        {rotulo}
      </Button>
    );
  }
  return (
    <Button variante="secundaria" onClick={onClick}>
      {rotulo}
    </Button>
  );
}

export function Esqueleto({ className = '', style }) {
  return <span className={`esqueleto ${className}`} style={style} aria-hidden />;
}

export function EsqueletoCartao() {
  return (
    <div className="esqueleto-cartao" aria-hidden>
      <Esqueleto className="esqueleto--foto" />
      <Esqueleto className="esqueleto--linha esqueleto--curta" />
      <Esqueleto className="esqueleto--titulo" />
      <Esqueleto className="esqueleto--linha" />
    </div>
  );
}

export function EsqueletoGrade({ quantidade = 8, className = 'grade-produtos' }) {
  return (
    <div className={className} aria-busy="true" aria-label="Carregando produtos">
      {Array.from({ length: quantidade }, (_, i) => (
        <EsqueletoCartao key={i} />
      ))}
    </div>
  );
}
