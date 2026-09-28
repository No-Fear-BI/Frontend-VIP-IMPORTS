/*
 * Banners do carrossel da home (/admin/banners). CRUD + reordenar, mesmo padrão de Cores.jsx.
 *
 * O que o backend impõe (docs/para-o-frontend.md, "Painel administrativo — marcas, categorias e
 * banners"):
 * 1. `imagemUrl` é obrigatória e só https; `imagemUrlMobile`, quando vier, também.
 * 2. No máximo 4 banners ATIVOS — é o carrossel contratado. A quinta ativação (criar já ativo ou
 *    ativar um existente) é 400 com `erro.campos.ativo` — a tela mostra a mensagem sob o
 *    checkbox, sem travar: o formulário continua aberto, só o toggle falhou.
 * 3. A ordem é 1..N contígua para TODOS (ativos e inativos juntos); só os ativos entram no
 *    carrossel da home, nessa ordem. Reordenar manda a lista COMPLETA de ids.
 */

import { useState } from 'react';
import { EstadoErro, EstadoVazio, Esqueleto } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral } from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { bannersService } from '../../services/bannersService.js';
import './Banners.css';

export default function AdminBanners() {
  const { dados: banners, erro, carregando, recarregar } = useRequisicao(
    (sinal) => bannersService.listar(sinal),
    [],
  );
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  const [movendo, setMovendo] = useState(null);
  const [erroMover, setErroMover] = useState(null);

  async function mover(indice, direcao) {
    const alvo = indice + direcao;
    if (!banners || alvo < 0 || alvo >= banners.length) return;
    const reordenados = [...banners];
    [reordenados[indice], reordenados[alvo]] = [reordenados[alvo], reordenados[indice]];
    setMovendo(banners[indice].id);
    setErroMover(null);
    try {
      await bannersService.reordenar(reordenados.map((b) => b.id));
      recarregar();
    } catch (falha) {
      setErroMover(falha);
    } finally {
      setMovendo(null);
    }
  }

  return (
    <section className="admin__pagina">
      <header className="admin-banners__topo">
        <div>
          <p className="t-label-caps-sm t-muted">/admin/banners</p>
          <h1 className="t-headline-lg">Banners</h1>
          <p className="t-body-sm t-muted admin-banners__ajuda">
            O carrossel da home. No máximo 4 ativos por vez — o resto fica como rascunho.
          </p>
        </div>
        <Button variante="primaria" onClick={() => setCriando(true)}>
          Novo banner
        </Button>
      </header>

      {carregando ? (
        <div className="estado-carregando" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Esqueleto key={i} className="esqueleto--linha" />
          ))}
        </div>
      ) : erro ? (
        <EstadoErro erro={erro} onTentar={recarregar} titulo="Não conseguimos carregar os banners." />
      ) : banners.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum banner cadastrado ainda."
          texto="Cadastre a primeira imagem do carrossel da home."
          acao={{ rotulo: 'Novo banner', onClick: () => setCriando(true) }}
        />
      ) : (
        <>
          {erroMover && <ErroGeral>{erroMover.mensagem}</ErroGeral>}
          <table className="admin-tabela admin-banners__tabela">
            <thead>
              <tr>
                <th scope="col"><span className="visualmente-oculto">Prévia</span></th>
                <th scope="col" className="t-label-caps-sm">Banner</th>
                <th scope="col" className="t-label-caps-sm">Status</th>
                <th scope="col"><span className="visualmente-oculto">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner, i) => (
                <tr key={banner.id}>
                  <td>
                    <PreviaImagem url={banner.imagemUrl} alt={banner.alt} className="admin-banners__miniatura" />
                  </td>
                  <td className="t-body-sm">
                    {banner.titulo || <span className="t-muted">Sem título</span>}
                    {banner.subtitulo && <p className="t-body-sm t-muted">{banner.subtitulo}</p>}
                  </td>
                  <td className="t-body-sm">
                    {banner.ativo ? 'Ativo' : <span className="t-muted">Inativo</span>}
                  </td>
                  <td>
                    <div className="admin-tabela__acoes">
                      {i > 0 && (
                        <button
                          type="button"
                          className="link-caps"
                          disabled={Boolean(movendo)}
                          onClick={() => mover(i, -1)}
                        >
                          Mover para cima
                        </button>
                      )}
                      <button
                        type="button"
                        className="link-caps"
                        disabled={i === banners.length - 1 || Boolean(movendo)}
                        onClick={() => mover(i, 1)}
                      >
                        Mover para baixo
                      </button>
                      <button type="button" className="link-caps" onClick={() => setEditando(banner)}>
                        Editar
                      </button>
                      <button type="button" className="link-caps" onClick={() => setExcluindo(banner)}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <Modal aberto={criando} onFechar={() => setCriando(false)} titulo="Novo banner">
        <FormBanner
          onPronto={() => {
            setCriando(false);
            recarregar();
          }}
        />
      </Modal>

      <Modal aberto={Boolean(editando)} onFechar={() => setEditando(null)} titulo="Editar banner">
        {editando && (
          <FormBanner
            banner={editando}
            onPronto={() => {
              setEditando(null);
              recarregar();
            }}
          />
        )}
      </Modal>

      <Modal aberto={Boolean(excluindo)} onFechar={() => setExcluindo(null)} titulo="Excluir banner">
        {excluindo && (
          <ConfirmarExclusao
            banner={excluindo}
            onPronto={() => {
              setExcluindo(null);
              recarregar();
            }}
          />
        )}
      </Modal>
    </section>
  );
}

/** A mesma ideia de `FotoProduto`, mas para uma URL solta de formulário: sem imagem ainda, ou
 * imagem quebrada, mostra um aviso em vez de um ícone de erro do navegador. */
function PreviaImagem({ url, alt, className = '' }) {
  const [falhou, setFalhou] = useState(false);
  const semImagem = !url || falhou;
  return (
    <div className={`previa-imagem ${className}`}>
      {semImagem ? (
        <span className="previa-imagem__vazia t-label-caps-sm">
          {url ? 'Prévia indisponível' : 'Sem imagem'}
        </span>
      ) : (
        <img src={url} alt={alt || ''} onError={() => setFalhou(true)} />
      )}
    </div>
  );
}

/**
 * "ou envie um arquivo" ao lado de um campo de URL: sobe o arquivo (`POST /banners/upload`) e
 * devolve a URL pronta em `onEnviado`, que preenche o campo — o resto do formulário não muda.
 * Sem `capture`: no celular deixa escolher entre câmera e galeria.
 */
function EnvioArquivo({ id, alt, onEnviado }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function enviar(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ''; // deixa escolher o mesmo arquivo de novo
    if (!arquivo) return;
    setEnviando(true);
    setErro(null);
    try {
      const enviada = await bannersService.uploadImagem(arquivo, alt.trim() || undefined);
      onEnviado(enviada.url);
    } catch (falha) {
      setErro(falha);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="admin-banners__envio">
      <label className="link-caps admin-banners__upload">
        {enviando ? 'Enviando…' : 'ou envie um arquivo'}
        <input id={id} type="file" accept="image/*" hidden disabled={enviando} onChange={enviar} />
      </label>
      {erro && <ErroGeral>{erro.campos?.arquivo || erro.mensagem}</ErroGeral>}
    </div>
  );
}

function FormBanner({ banner, onPronto }) {
  const edicao = Boolean(banner);
  const [imagemUrl, setImagemUrl] = useState(banner?.imagemUrl || '');
  const [imagemUrlMobile, setImagemUrlMobile] = useState(banner?.imagemUrlMobile || '');
  const [titulo, setTitulo] = useState(banner?.titulo || '');
  const [subtitulo, setSubtitulo] = useState(banner?.subtitulo || '');
  const [alt, setAlt] = useState(banner?.alt || '');
  const [linkUrl, setLinkUrl] = useState(banner?.linkUrl || '');
  const [ativo, setAtivo] = useState(banner?.ativo || false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      if (edicao) {
        const dados = {};
        if (imagemUrl.trim() !== banner.imagemUrl) dados.imagemUrl = imagemUrl.trim();
        if (imagemUrlMobile.trim() !== (banner.imagemUrlMobile || '')) {
          dados.imagemUrlMobile = imagemUrlMobile.trim() || null;
        }
        if (titulo.trim() !== (banner.titulo || '')) dados.titulo = titulo.trim() || null;
        if (subtitulo.trim() !== (banner.subtitulo || '')) dados.subtitulo = subtitulo.trim() || null;
        if (alt.trim() !== (banner.alt || '')) dados.alt = alt.trim() || null;
        if (linkUrl.trim() !== (banner.linkUrl || '')) dados.linkUrl = linkUrl.trim() || null;
        if (ativo !== banner.ativo) dados.ativo = ativo;
        await bannersService.editar(banner.id, dados);
      } else {
        await bannersService.criar({
          imagemUrl: imagemUrl.trim(),
          ...(imagemUrlMobile.trim() ? { imagemUrlMobile: imagemUrlMobile.trim() } : {}),
          ...(titulo.trim() ? { titulo: titulo.trim() } : {}),
          ...(subtitulo.trim() ? { subtitulo: subtitulo.trim() } : {}),
          ...(alt.trim() ? { alt: alt.trim() } : {}),
          ...(linkUrl.trim() ? { linkUrl: linkUrl.trim() } : {}),
          ativo,
        });
      }
      onPronto();
    } catch (falha) {
      setErro(falha);
      setSalvando(false);
    }
  }

  return (
    <form className="admin-banners__form" onSubmit={salvar}>
      <Field
        id="banner-imagem-url"
        rotulo="Imagem (desktop)"
        ajuda="Só https. Ocupa a largura toda do topo da home e é cortada nas bordas para preencher: use foto em paisagem e deixe o assunto no centro."
        value={imagemUrl}
        onChange={(e) => setImagemUrl(e.target.value)}
        erro={erro?.campos?.imagemUrl}
        placeholder="https://…"
        required
      />
      <EnvioArquivo id="banner-arquivo-desktop" alt={alt} onEnviado={setImagemUrl} />
      <PreviaImagem url={imagemUrl} alt={alt} className="admin-banners__previa-form" />
      <Field
        id="banner-imagem-url-mobile"
        rotulo="Imagem (celular)"
        ajuda="Opcional. Só https. No celular o topo é estreito e alto, então uma foto em retrato aproveita melhor o espaço."
        value={imagemUrlMobile}
        onChange={(e) => setImagemUrlMobile(e.target.value)}
        erro={erro?.campos?.imagemUrlMobile}
        placeholder="https://…"
      />
      <EnvioArquivo id="banner-arquivo-mobile" alt={alt} onEnviado={setImagemUrlMobile} />
      <Field
        id="banner-titulo"
        rotulo="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        erro={erro?.campos?.titulo}
        maxLength={120}
      />
      <Field
        id="banner-subtitulo"
        rotulo="Subtítulo"
        value={subtitulo}
        onChange={(e) => setSubtitulo(e.target.value)}
        erro={erro?.campos?.subtitulo}
        maxLength={200}
      />
      <Field
        id="banner-alt"
        rotulo="Texto alternativo"
        ajuda="Descreve a imagem para quem usa leitor de tela."
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        erro={erro?.campos?.alt}
        maxLength={200}
      />
      <Field
        id="banner-link-url"
        rotulo="Link ao clicar"
        ajuda="Opcional. Ex.: /novidades"
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        erro={erro?.campos?.linkUrl}
      />
      <label className="admin-banners__checkbox">
        <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
        <span className="t-body-sm">Ativo no carrossel da home</span>
      </label>
      {erro?.campos?.ativo && (
        <p className="t-body-sm admin-banners__aviso" role="alert">
          {erro.campos.ativo}
        </p>
      )}
      {erro && !erro.campos && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <Button variante="primaria" largo type="submit" disabled={salvando || !imagemUrl.trim()}>
        {salvando ? 'Salvando…' : edicao ? 'Salvar' : 'Criar banner'}
      </Button>
    </form>
  );
}

function ConfirmarExclusao({ banner, onPronto }) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState(null);

  async function excluir() {
    setExcluindo(true);
    setErro(null);
    try {
      await bannersService.excluir(banner.id);
      onPronto();
    } catch (falha) {
      setErro(falha);
      setExcluindo(false);
    }
  }

  return (
    <div className="admin-banners__form">
      <p className="t-body-lg">Excluir o banner {banner.titulo || `#${banner.id}`}?</p>
      {erro && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <Button variante="primaria" largo onClick={excluir} disabled={excluindo}>
        {excluindo ? 'Excluindo…' : 'Excluir'}
      </Button>
    </div>
  );
}
