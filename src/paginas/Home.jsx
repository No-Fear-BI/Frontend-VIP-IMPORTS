import { useState } from 'react';
import { Link } from 'react-router-dom';
import { catalogoService } from '../services/catalogoService.js';
import CabecalhoSecao from '../components/CabecalhoSecao.jsx';
import { Esqueleto, EsqueletoGrade, EstadoErro, EstadoVazio } from '../components/Estados.jsx';
import { IconeSeta, IconeSetaEsquerda, IconeWhatsApp } from '../components/Icones.jsx';
import { CartaoProduto, FotoProduto } from '../components/Produto.jsx';
import { IMAGEM_COLECAO_FEMININA, IMAGEM_COLECAO_MASCULINA, LINK_WHATSAPP_CONTATO } from '../config.js';
import { useRequisicao } from '../hooks/useRequisicao.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import './Home.css';

export default function Home() {
  const { dados, erro, carregando, recarregar } = useRequisicao((sinal) => catalogoService.home(sinal), []);
  const aprovados = useRequisicao((sinal) => catalogoService.produtosAprovados(sinal), []);
  const destaques = [...(dados?.destaques || []), ...(aprovados.dados || [])];

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
            nome="Feminina"
            rotulo="Coleção"
            para="/feminino"
            imagem={IMAGEM_COLECAO_FEMININA}
          />
          <PainelColecao
            nome="Masculina"
            rotulo="Coleção"
            para="/masculino"
            imagem={IMAGEM_COLECAO_MASCULINA}
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
                <CartaoCategoria categoria={categoria} colecao={categoria.colecao} />
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
            Escolha no site, toque em Comprar no WhatsApp e o atendimento confirma valor, tamanho e entrega com você.
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

  if (total === 0) return <HeroSemBanner />;

  const ir = (n) => setAtual((n + total) % total);
  // O slide avança quando a linha de progresso termina (7s, --duracao-carrossel). Pausar a linha
  // (hover/foco) pausa o carrossel junto, sem timer paralelo para dessincronizar.
  const autoplay = total > 1 && !reduzido;

  return (
    <section
      className={`hero faixa-primaria ${pausado ? 'hero--pausado' : ''}`}
      aria-roledescription="carrossel"
      aria-label="Destaques da loja"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
    >
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`hero__slide ${i === atual ? 'hero__slide--ativo' : ''}`}
          aria-roledescription="slide"
          aria-label={`${i + 1} de ${total}`}
          aria-hidden={i !== atual}
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

function PainelColecao({ nome, rotulo, para, imagem }) {
  return (
    <Link to={para} className={`painel-colecao ${imagem ? 'painel-colecao--foto' : ''}`}>
      {imagem && <img src={imagem} alt="" className="painel-colecao__imagem" loading="lazy" />}
      {imagem && <span className="painel-colecao__degrade" aria-hidden />}
      <span className="painel-colecao__texto">
        <span className="t-label-caps painel-colecao__rotulo">{rotulo}</span>
        <span className="t-headline-lg">{nome}</span>
        <span className="link-caps">
          Ver coleção {nome.toLowerCase()} <IconeSeta />
        </span>
      </span>
    </Link>
  );
}

export function CartaoCategoria({ categoria, colecao }) {
  const para = `/produtos?colecao=${colecao.slug}&categoria=${categoria.slug}`;
  return (
    <Link to={para} className="cartao-categoria">
      <FotoProduto url={categoria.imagemUrl} alt="" className="cartao-categoria__foto" />
      <span className="t-headline-sm">{categoria.nome}</span>
      <span className="t-label-caps-sm t-muted">
        {colecao.nome}
        {typeof categoria.totalProdutos === 'number' && ` · ${categoria.totalProdutos} ${categoria.totalProdutos === 1 ? 'peça' : 'peças'}`}
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
