import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalogoService } from '../services/catalogoService.js';
import CabecalhoSecao from '../components/CabecalhoSecao.jsx';
import { Esqueleto, EsqueletoGrade, EstadoErro, EstadoVazio } from '../components/Estados.jsx';
import { IconeSeta, IconeSetaEsquerda, IconeWhatsApp } from '../components/Icones.jsx';
import { CartaoProduto, FotoProduto } from '../components/Produto.jsx';
import { IMAGEM_COLECAO_FEMININA, IMAGEM_COLECAO_MASCULINA, LINK_WHATSAPP_CONTATO } from '../config.js';
import { useArrastoCarrossel } from '../hooks/useArrastoCarrossel.js';
import { useRequisicao } from '../hooks/useRequisicao.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import './Home.css';

export default function Home() {
  const { dados, erro, carregando, recarregar } = useRequisicao((sinal) => catalogoService.home(sinal), []);
  const destaques = dados?.destaques || [];

  if (erro) {
    return (
      <div className="container">
        <EstadoErro erro={erro} onTentar={recarregar} titulo="Não conseguimos abrir a vitrine agora." />
      </div>
    );
  }

  return (
    <>
      {carregando ? <HeroEsqueleto /> : <Hero banners={dados.banners} />}

      <section className="container secao" aria-labelledby="titulo-destaques">
        <CabecalhoSecao
          id="titulo-destaques"
          rotulo="Escolhidas pela casa"
          titulo="Destaques"
          link={{ rotulo: 'Ver novidades', para: '/novidades' }}
        />
        {carregando ? (
          <EsqueletoGrade quantidade={8} />
        ) : destaques.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum destaque no momento."
            texto="As peças novas continuam chegando na página de novidades."
            acao={{ rotulo: 'Ver novidades', para: '/novidades' }}
          />
        ) : (
          <div className="grade-produtos">
            {destaques.slice(0, 12).map((produto, i) => (
              <CartaoProduto key={produto.id} produto={produto} carregamento={i < 4 ? 'eager' : 'lazy'} />
            ))}
          </div>
        )}
      </section>

      <section className="container secao secao--proxima" aria-label="Coleções">
        <div className="colecoes">
          <PainelColecao
            {...painelDoLado(dados?.cardsColecao, 'esquerda', {
              nome: 'Feminina',
              para: '/feminino',
              imagem: IMAGEM_COLECAO_FEMININA,
            })}
          />
          <PainelColecao
            {...painelDoLado(dados?.cardsColecao, 'direita', {
              nome: 'Masculina',
              para: '/masculino',
              imagem: IMAGEM_COLECAO_MASCULINA,
            })}
          />
        </div>
      </section>

      <section className="container secao" aria-labelledby="titulo-categorias">
        <CabecalhoSecao
          id="titulo-categorias"
          rotulo="Por tipo de peça"
          titulo="Categorias"
          link={{ rotulo: 'Todas as categorias', para: '/categorias' }}
        />
        {carregando ? (
          <div className="grade-categorias">
            {Array.from({ length: 4 }, (_, i) => (
              <Esqueleto key={i} className="esqueleto--quadrado" />
            ))}
          </div>
        ) : dados.categoriasDestaque.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma categoria em destaque."
            acao={{ rotulo: 'Ver todas as categorias', para: '/categorias' }}
          />
        ) : (
          <ul className="grade-categorias">
            {dados.categoriasDestaque.map((categoria) => (
              <li key={categoria.id}>
                <CartaoCategoria categoria={categoria} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="container secao" aria-labelledby="titulo-marcas">
        <CabecalhoSecao
          id="titulo-marcas"
          rotulo="Casas representadas"
          titulo="Marcas"
          link={{ rotulo: 'Todas as marcas', para: '/marcas' }}
        />
        {carregando ? (
          <div className="grade-marcas">
            {Array.from({ length: 8 }, (_, i) => (
              <Esqueleto key={i} className="esqueleto--bloco" />
            ))}
          </div>
        ) : dados.marcas.length === 0 ? (
          <EstadoVazio titulo="Nenhuma marca cadastrada ainda." acao={{ rotulo: 'Ver novidades', para: '/novidades' }} />
        ) : (
          <GradeMarcas marcas={dados.marcas.slice(0, 12)} />
        )}
      </section>

      <section className="faixa-primaria cta-final" aria-labelledby="titulo-cta">
        <div className="container cta-final__conteudo">
          <p className="t-label-caps t-muted">Atendimento individual</p>
          <h2 id="titulo-cta" className="t-headline-lg cta-final__titulo">
            Viu uma peça? A conversa começa <em>com um toque.</em>
          </h2>
          <p className="t-body-lg t-muted cta-final__texto">
            Escolha no site, toque em Consultar valores no WhatsApp e o atendimento confirma valor, tamanho e entrega
            com você.
          </p>
          <div className="cta-final__botoes">
            <Button variante="sobre-primaria" para="/novidades">
              Ver novidades
            </Button>
            {LINK_WHATSAPP_CONTATO && (
              <Button
                variante="contorno-sobre-primaria"
                href={LINK_WHATSAPP_CONTATO}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconeWhatsApp />
                Falar no WhatsApp
              </Button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ---- Hero em carrossel (até 4 banners ativos; GET /home já traz na ordem) ----

function Hero({ banners }) {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [reduzido] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const total = banners.length;
  const ir = (n) => setAtual((n + total) % total);
  const { arrasto, arrastando, propsTrilho } = useArrastoCarrossel({
    habilitado: total > 1,
    aoTrocar: (delta) => ir(atual + delta),
  });
  const posicoesAnteriores = useRef(null);

  // Posição de cada slide relativa ao atual, pelo caminho mais curto do círculo (−1 anterior, 1 próximo).
  const posicoes = banners.map((_, i) => {
    let d = (((i - atual) % total) + total) % total;
    if (d > total / 2) d -= total;
    return d;
  });
  // O slide que "dá a volta" pula mais de 1 posição: sem transição, para não cruzar a tela animando.
  const anteriores = posicoesAnteriores.current;
  const deuVolta = posicoes.map((p, i) => anteriores?.length === total && Math.abs(p - anteriores[i]) > 1);
  useEffect(() => {
    posicoesAnteriores.current = posicoes;
  });

  if (total === 0) return <HeroSemBanner />;

  // O slide avança quando a linha de progresso termina (7s, --duracao-carrossel). Pausar a linha
  // (hover/foco/arrasto) pausa o carrossel junto, sem timer paralelo para dessincronizar.
  const autoplay = total > 1 && !reduzido;

  function aoTeclar(e) {
    if (total < 2) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      ir(atual - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      ir(atual + 1);
    }
  }

  return (
    <section
      className={`hero faixa-primaria ${pausado || arrastando ? 'hero--pausado' : ''}`}
      aria-roledescription="carrossel"
      aria-label="Destaques da loja"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
      onKeyDown={aoTeclar}
    >
      <div
        className={`hero__trilho ${arrastando ? 'hero__trilho--arrastando' : ''}`}
        style={{ '--arrasto': `${arrasto}px` }}
        {...(total > 1 ? propsTrilho : {})}
      >
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`hero__slide ${i === atual ? 'hero__slide--ativo' : ''} ${deuVolta[i] ? 'hero__slide--sem-transicao' : ''}`}
          style={{ '--posicao': posicoes[i] }}
          aria-roledescription="slide"
          aria-label={`${i + 1} de ${total}`}
          aria-hidden={Math.abs(posicoes[i]) > 1 || i !== atual}
        >
          <picture>
            {banner.imagemUrlMobile && <source media="(max-width: 767px)" srcSet={banner.imagemUrlMobile} />}
            <img
              src={banner.imagemUrl}
              alt={banner.alt || ''}
              className="hero__imagem"
              loading={i === 0 ? 'eager' : 'lazy'}
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden';
              }}
            />
          </picture>
          <div className="hero__degrade" aria-hidden />
          <div className="container hero__texto">
            {banner.subtitulo && <p className="t-label-caps t-muted">{banner.subtitulo}</p>}
            {banner.titulo && <h1 className="t-display hero__titulo">{banner.titulo}</h1>}
            {banner.linkUrl && (
              <LinkBanner href={banner.linkUrl} tabIndex={i === atual ? 0 : -1}>
                Ver peças
              </LinkBanner>
            )}
          </div>
        </div>
      ))}
      </div>

      {total > 1 && (
        <div className="container hero__controles">
          <span className="t-codigo hero__contador" aria-live="polite">
            {String(atual + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          {autoplay && (
            <span className="hero__progresso" aria-hidden>
              <span key={atual} className="hero__progresso-barra" onAnimationEnd={() => ir(atual + 1)} />
            </span>
          )}
          <button type="button" className="hero__seta" onClick={() => ir(atual - 1)} aria-label="Banner anterior">
            <IconeSetaEsquerda />
          </button>
          <button type="button" className="hero__seta" onClick={() => ir(atual + 1)} aria-label="Próximo banner">
            <IconeSeta />
          </button>
        </div>
      )}
    </section>
  );
}

function LinkBanner({ href, children, ...props }) {
  const interno = href.startsWith('/');
  if (interno) {
    return (
      <Link to={href} className="link-caps" {...props}>
        {children} <IconeSeta />
      </Link>
    );
  }
  return (
    <a href={href} className="link-caps" target="_blank" rel="noopener noreferrer" {...props}>
      {children} <IconeSeta />
    </a>
  );
}

function HeroSemBanner() {
  return (
    <section className="hero hero--sem-banner faixa-primaria">
      <div className="container hero__texto">
        <p className="t-label-caps t-muted">VIP Imports</p>
        <h1 className="t-display hero__titulo">
          Roupas e acessórios de grife, <em>importados.</em>
        </h1>
        <Link to="/novidades" className="link-caps">
          Ver novidades <IconeSeta />
        </Link>
      </div>
    </section>
  );
}

function HeroEsqueleto() {
  return (
    <section className="hero faixa-primaria" aria-busy="true" aria-label="Carregando destaques">
      <div className="container hero__texto">
        <span className="hero__esqueleto hero__esqueleto--rotulo" />
        <span className="hero__esqueleto hero__esqueleto--titulo" />
        <span className="hero__esqueleto hero__esqueleto--titulo hero__esqueleto--curto" />
      </div>
    </section>
  );
}

// ---- Coleções, categorias e marcas ----

/* Os dois cards de coleção. O dono pode pôr uma categoria no lugar de cada um (Card Esquerda =
 * Feminina, Card Direita = Masculina, em /admin/categorias): `cardsColecao` traz quem ocupa o
 * lado e a imagem que ele escolheu. Sem categoria no lado, vale a coleção de sempre. */
function painelDoLado(cards, lado, padrao) {
  const card = cards?.find((c) => c.lado === lado);
  if (card) {
    return {
      nome: card.nome,
      rotulo: 'Categoria',
      para: `/produtos?categoria=${card.slug}`,
      imagem: card.imagemUrl || '',
      textoLink: `Ver ${card.nome.toLowerCase()}`,
    };
  }
  return { ...padrao, rotulo: 'Coleção', textoLink: `Ver coleção ${padrao.nome.toLowerCase()}` };
}

function PainelColecao({ nome, rotulo, para, imagem, textoLink }) {
  return (
    <Link to={para} className={`painel-colecao ${imagem ? 'painel-colecao--foto' : ''}`}>
      {imagem && <img src={imagem} alt="" className="painel-colecao__imagem" loading="lazy" />}
      {imagem && <span className="painel-colecao__degrade" aria-hidden />}
      <span className="painel-colecao__texto">
        <span className="t-label-caps painel-colecao__rotulo">{rotulo}</span>
        <span className="t-headline-lg">{nome}</span>
        <span className="link-caps">
          {textoLink} <IconeSeta />
        </span>
      </span>
    </Link>
  );
}

// Desde a migração 0015 a categoria não tem coleção e o slug é único: o link é só `?categoria=`.
// `colecao` ainda pode vir (página de categorias por público) e, se vier, estreita a listagem.
export function CartaoCategoria({ categoria, colecao }) {
  const para = colecao
    ? `/produtos?colecao=${colecao.slug}&categoria=${categoria.slug}`
    : `/produtos?categoria=${categoria.slug}`;
  return (
    <Link to={para} className="cartao-categoria">
      <FotoProduto url={categoria.imagemUrl} alt="" className="cartao-categoria__foto" />
      <span className="t-headline-sm">{categoria.nome}</span>
      <span className="t-label-caps-sm t-muted">
        {colecao?.nome}
        {typeof categoria.totalProdutos === 'number' &&
          `${colecao ? ' · ' : ''}${categoria.totalProdutos} ${categoria.totalProdutos === 1 ? 'peça' : 'peças'}`}
      </span>
    </Link>
  );
}

export function GradeMarcas({ marcas }) {
  return (
    <ul className="grade-marcas">
      {marcas.map((marca) => (
        <li key={marca.id}>
          <Card como={Link} to={`/marcas/${marca.slug}`} borda className="cartao-marca">
            <span className="t-headline-sm">{marca.nome}</span>
            <span className="t-label-caps-sm t-muted">
              {marca.totalProdutos} {marca.totalProdutos === 1 ? 'peça' : 'peças'}
            </span>
          </Card>
        </li>
      ))}
    </ul>
  );
}
