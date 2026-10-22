import { useRef, useState } from 'react';
import { IconeAlerta } from '../../components/Icones.jsx';
import Button from '../../components/ui/Button.jsx';
import { MarcaObrigatorio } from '../../components/ui/Field.jsx';
import { bannersService } from '../../services/bannersService.js';
import './CampoImagem.css';

/*
 * Imagem no painel entra só por arquivo: não existe campo de endereço (URL) em formulário
 * nenhum (docs/decisoes-frontend.md, seção 30). `BotaoArquivo` é o botão "Envie um arquivo";
 * `CampoImagem` é o campo completo de Banners e Categorias (rótulo, botão, prévia, remover).
 */

/**
 * Botão "Envie um arquivo". É um <button> de verdade (teclado e leitor de tela) que abre o
 * <input type="file"> escondido e entrega o arquivo escolhido em `onEscolher`.
 * `capture` só nas fotos de produto, como já era (abre a câmera no celular).
 */
export function BotaoArquivo({ onEscolher, enviando = false, disabled = false, capture, ...props }) {
  const entrada = useRef(null);

  function escolher(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ''; // deixa escolher o mesmo arquivo de novo
    if (arquivo) onEscolher(arquivo);
  }

  return (
    <>
      <Button variante="secundaria" disabled={disabled || enviando} onClick={() => entrada.current?.click()} {...props}>
        {enviando ? 'Enviando…' : 'Envie um arquivo'}
      </Button>
      <input ref={entrada} type="file" accept="image/*" capture={capture} hidden onChange={escolher} />
    </>
  );
}

/** "Proporção recomendada: …" — a mesma linha em todo campo de imagem do painel. A prévia de
 * cada campo usa essa mesma proporção, para a pessoa ver o enquadramento que o site vai usar. */
export function ProporcaoRecomendada({ id, children }) {
  return (
    <p id={id} className="t-body-sm">
      <strong>Proporção recomendada:</strong> {children}
    </p>
  );
}

/**
 * Campo de imagem de formulário: sobe o arquivo (`POST /banners/upload`, o mesmo para o card de
 * categoria) e devolve a URL pronta em `onMudar` — o resto do formulário segue mandando URL ao
 * backend, como sempre. Sem `capture`: no celular deixa escolher entre câmera e galeria.
 * Campo opcional ganha "Remover imagem" (antes era apagar o endereço).
 */
export default function CampoImagem({
  id,
  rotulo,
  proporcao,
  ajuda,
  obrigatorio = false,
  valor,
  onMudar,
  alt = '',
  erro,
  classePrevia = '',
}) {
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState(null);
  const idRotulo = `${id}-rotulo`;
  const idProporcao = `${id}-proporcao`;
  const idAjuda = `${id}-ajuda`;

  async function enviar(arquivo) {
    setEnviando(true);
    setErroEnvio(null);
    try {
      const enviada = await bannersService.uploadImagem(arquivo, alt.trim() || undefined);
      onMudar(enviada.url);
    } catch (falha) {
      setErroEnvio(falha);
    } finally {
      setEnviando(false);
    }
  }

  const mensagemErro = erroEnvio ? erroEnvio.campos?.arquivo || erroEnvio.mensagem : erro;

  return (
    <div className="campo-imagem" role="group" aria-labelledby={idRotulo}>
      <p id={idRotulo} className="t-label-caps">
        {rotulo}
        {obrigatorio && <MarcaObrigatorio />}
      </p>
      {proporcao && <ProporcaoRecomendada id={idProporcao}>{proporcao}</ProporcaoRecomendada>}
      {ajuda && (
        <p id={idAjuda} className="t-body-sm t-muted">
          {ajuda}
        </p>
      )}
      <div className="campo-imagem__acoes">
        <BotaoArquivo
          id={id}
          enviando={enviando}
          onEscolher={enviar}
          aria-describedby={[proporcao && idProporcao, ajuda && idAjuda].filter(Boolean).join(' ') || undefined}
        />
        {!obrigatorio && valor && (
          <button type="button" className="link-caps" disabled={enviando} onClick={() => onMudar('')}>
            Remover imagem
          </button>
        )}
      </div>
      {mensagemErro && (
        <p className="campo__erro t-body-sm" role="alert">
          <IconeAlerta />
          {mensagemErro}
        </p>
      )}
      <PreviaImagem url={valor} alt={alt} className={classePrevia} />
    </div>
  );
}

/** A mesma ideia de `FotoProduto`, mas para a imagem de um formulário: sem imagem ainda, ou
 * imagem quebrada, mostra um aviso em vez de um ícone de erro do navegador. */
export function PreviaImagem({ url, alt, className = '' }) {
  // Guarda QUAL url falhou: um arquivo novo enviado depois volta a mostrar a prévia.
  const [urlQueFalhou, setUrlQueFalhou] = useState(null);
  const semImagem = !url || urlQueFalhou === url;
  return (
    <div className={`previa-imagem ${className}`}>
      {semImagem ? (
        <span className="previa-imagem__vazia t-label-caps-sm">
          {url ? 'Prévia indisponível' : 'Sem imagem'}
        </span>
      ) : (
        <img src={url} alt={alt || ''} onError={() => setUrlQueFalhou(url)} />
      )}
    </div>
  );
}
