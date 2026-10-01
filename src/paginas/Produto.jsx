import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { catalogoService } from '../services/catalogoService.js';
import CabecalhoSecao from '../components/CabecalhoSecao.jsx';
import { ErroGeral } from '../components/ui/Field.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Esqueleto, EsqueletoGrade, EstadoErro } from '../components/Estados.jsx';
import FormIdentificacao from '../components/FormIdentificacao.jsx';
import { IconeCoracao, IconeWhatsApp } from '../components/Icones.jsx';
import { CartaoProduto, Etiqueta, FotoProduto, rotuloCompra } from '../components/Produto.jsx';
import SeletorVariacoes from '../components/SeletorVariacoes.jsx';
import { useCompra } from '../contexto/CompraWhatsApp.jsx';
import { useSessaoCliente } from '../contexto/SessaoCliente.jsx';
import { useRequisicao } from '../hooks/useRequisicao.js';
import { acompanharMouse } from '../lib/lupa.js';
import Button from '../components/ui/Button.jsx';
import './Produto.css';

const PAR_VAZIO = { variacaoTamanhoId: null, variacaoCorId: null };

export default function Produto() {
  const { codigo } = useParams();
  const { dados: produto, erro, carregando, recarregar } = useRequisicao(
    (sinal) => catalogoService.produto(codigo, sinal),
    [codigo],
  );

  useEffect(() => {
    if (produto) document.title = `Código ${produto.codigo} · ${produto.marca.nome} — VIP Imports`;
    return () => {
      document.title = 'VIP Imports — Roupas e acessórios de grife';
    };
  }, [produto]);

  if (carregando) return <ProdutoEsqueleto />;
  if (erro) {
    return (
      <div className="container">
        <EstadoErro erro={erro} onTentar={recarregar} titulo="Não conseguimos abrir esta peça." />
      </div>
    );
  }

  return (
    <>
      <DetalheProduto key={produto.id} produto={produto} />
      <Relacionados codigo={produto.codigo} />
    </>
  );
}

function DetalheProduto({ produto }) {
  const { comprar } = useCompra();
  const { cliente, favoritos, alternarFavorito, avisar } = useSessaoCliente();
  const [par, setPar] = useState(PAR_VAZIO);
  const [fotoAtual, setFotoAtual] = useState(0);
  const [pedindoEmail, setPedindoEmail] = useState(false);
  const [erroFavorito, setErroFavorito] = useState(null);

  const ehFavorito = favoritos.has(produto.id);
  const imagens = produto.imagens;
  const foto = imagens[fotoAtual];

  async function favoritar() {
    setErroFavorito(null);
    if (!cliente) {
      setPedindoEmail(true);
      return;
    }
    try {
      await alternarFavorito(produto.id);
      avisar(ehFavorito ? 'Peça tirada dos favoritos.' : 'Peça salva nos favoritos.');
    } catch (falha) {
      setErroFavorito(falha.mensagem || 'Não foi possível salvar agora.');
    }
  }

  return (
    <article className="container produto">
      <nav className="trilha t-label-caps-sm produto__trilha entra" aria-label="Você está em">
        <Link to="/">Início</Link>
        <span aria-hidden>/</span>
        <Link to={`/${produto.colecao.slug}`}>{produto.colecao.nome}</Link>
        <span aria-hidden>/</span>
        <Link to={`/produtos?colecao=${produto.colecao.slug}&categoria=${produto.categoria.slug}`}>
          {produto.categoria.nome}
        </Link>
      </nav>

      <div className="produto__grade">
        <div className="produto__galeria entra" style={{ '--ordem': 1 }}>
          <div className="produto__foto-principal" onMouseMove={acompanharMouse}>
            <FotoProduto url={foto?.url} alt={foto?.alt || produto.nome} carregamento="eager" />
            {produto.status === 'esgotado' && <span className="selo-esgotado t-label-caps-sm">Esgotado</span>}
          </div>
          {imagens.length > 1 && (
            <ul className="produto__miniaturas" aria-label="Fotos da peça">
              {imagens.map((imagem, i) => (
                <li key={imagem.id}>
                  <button
                    type="button"
                    className={`produto__miniatura ${i === fotoAtual ? 'produto__miniatura--ativa' : ''}`}
                    onClick={() => setFotoAtual(i)}
                    aria-label={`Ver foto ${i + 1} de ${imagens.length}`}
                    aria-current={i === fotoAtual}
                  >
                    <FotoProduto url={imagem.url} alt="" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="produto__info entra" style={{ '--ordem': 2 }}>
          <p className="t-label-caps t-muted">{produto.marca.nome}</p>
          <Etiqueta>Código {produto.codigo}</Etiqueta>
          <h1 className="t-headline-lg">{produto.nome}</h1>
          <p className="t-body-sm t-muted">
            {produto.categoria.nome} · Coleção {produto.colecao.nome}
          </p>

          <hr className="filete" />

          <p className="t-body-lg">Valor confirmado pelo atendimento.</p>
          {produto.status === 'esgotado' && (
            <p className="t-body-sm produto__esgotado">
              Esta peça está esgotada no momento. Chame o atendimento para saber se ela volta ou se há outra parecida.
            </p>
          )}

          <SeletorVariacoes variacoes={produto.variacoes} valor={par} onMudar={setPar} idBase="produto" />

          <div className="produto__acoes">
            <Button variante="primaria" largo
              onClick={() => comprar({ produto, par })}
            >
              <IconeWhatsApp />
              {rotuloCompra(produto.status)}
            </Button>
            <Button variante="secundaria" largo onClick={favoritar} aria-pressed={ehFavorito}>
              <IconeCoracao preenchido={ehFavorito} />
              {ehFavorito ? 'Salva nos favoritos' : 'Salvar nos favoritos'}
            </Button>
            {erroFavorito && <ErroGeral>{erroFavorito}</ErroGeral>}
          </div>

          {produto.descricao && (
            <>
              <hr className="filete" />
              <div className="produto__descricao">
                <h2 className="t-label-caps">Sobre a peça</h2>
                <p className="medida">{produto.descricao}</p>
              </div>
            </>
          )}

          <hr className="filete" />
          <div className="produto__como">
            <h2 className="t-label-caps">Como funciona a compra</h2>
            <ol className="t-body-sm">
              <li>
                <span className="t-codigo">01</span> Toque em Consultar valores no WhatsApp. Tamanho e cor são
                opcionais.
              </li>
              <li>
                <span className="t-codigo">02</span> Na primeira vez, informe seu e-mail. Não tem senha.
              </li>
              <li>
                <span className="t-codigo">03</span> O WhatsApp abre com a mensagem pronta, e o atendimento confirma
                valor, tamanho e entrega.
              </li>
            </ol>
          </div>
        </div>
      </div>

      <Modal aberto={pedindoEmail} onFechar={() => setPedindoEmail(false)} titulo="Salvar nos favoritos">
        <div className="compra__etapa">
          <h2 className="t-headline-md">Para salvar, seu e-mail</h2>
          <p className="t-body-sm t-muted">Sem senha. Seus favoritos ficam guardados para a próxima visita.</p>
          <FormIdentificacao
            idBase="favorito"
            rotuloBotao="Salvar nos favoritos"
            onIdentificado={async () => {
              setPedindoEmail(false);
              try {
                await alternarFavorito(produto.id);
                avisar('Peça salva nos favoritos.');
              } catch (falha) {
                setErroFavorito(falha.mensagem || 'Não foi possível salvar agora.');
              }
            }}
          />
        </div>
      </Modal>
    </article>
  );
}

function Relacionados({ codigo }) {
  const { dados, erro, carregando, recarregar } = useRequisicao(
    (sinal) => catalogoService.relacionados(codigo, sinal),
    [codigo],
  );

  // Vazio aqui não é um beco sem saída: a seção simplesmente não aparece.
  if (!carregando && !erro && dados.length === 0) return null;

  return (
    <section className="container secao" aria-labelledby="titulo-relacionados">
      <CabecalhoSecao id="titulo-relacionados" rotulo="Continue olhando" titulo="Peças da mesma linha" />
      {carregando ? (
        <EsqueletoGrade quantidade={4} />
      ) : erro ? (
        <EstadoErro erro={erro} onTentar={recarregar} titulo="Não conseguimos carregar as sugestões." />
      ) : (
        <div className="grade-produtos">
          {dados.slice(0, 4).map((produto) => (
            <CartaoProduto key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProdutoEsqueleto() {
  return (
    <div className="container produto" aria-busy="true" aria-label="Carregando peça">
      <Esqueleto className="esqueleto--linha" style={{ width: '25%', marginBlock: 'var(--espaco-10) var(--espaco-6)' }} />
      <div className="produto__grade">
        <Esqueleto className="esqueleto--foto" />
        <div className="produto__info">
          <Esqueleto className="esqueleto--linha esqueleto--curta" />
          <Esqueleto className="esqueleto--titulo" style={{ width: '40%' }} />
          <Esqueleto className="esqueleto--controle-compacto" style={{ width: '85%' }} />
          <Esqueleto className="esqueleto--linha" style={{ width: '40%' }} />
          <Esqueleto className="esqueleto--controle" style={{ marginTop: 'var(--espaco-10)' }} />
          <Esqueleto className="esqueleto--controle" />
        </div>
      </div>
    </div>
  );
}
