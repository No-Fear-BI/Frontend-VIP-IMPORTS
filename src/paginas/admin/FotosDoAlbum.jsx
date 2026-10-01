// Escolha das fotos do álbum que entram no produto, e de qual delas é a capa.
// A seleção é uma lista ordenada de URLs originais: a primeira é a capa (é o que o backend espera
// em `fotos`). Sem mexer aqui, `valor` fica indefinido e entra só a foto do álbum que já aparece no
// cartão, como antes.
import { useState } from 'react';
import { listarFotos } from '../../services/revisaoService.js';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { EstadoErro } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import { cn } from '../../lib/cn.js';
import './FotosDoAlbum.css';

const MAXIMO = 20;
const viaProxy = (url, origem) => `/api/v1/admin/revisao/imagem?url=${encodeURIComponent(url)}&source=${encodeURIComponent(origem)}`;

export default function FotosDoAlbum({ produtoId, origem, valor, onMudar, disabled }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="fotos-album">
      <Button variante="secundaria" largo type="button" aria-expanded={aberto} onClick={() => setAberto((v) => !v)}>
        {aberto ? 'Fechar fotos' : valor ? `Fotos: ${valor.length} escolhidas` : 'Escolher fotos'}
      </Button>
      {aberto && <Grade produtoId={produtoId} origem={origem} valor={valor} onMudar={onMudar} disabled={disabled} />}
    </div>
  );
}

function Grade({ produtoId, origem, valor, onMudar, disabled }) {
  const { dados, erro, carregando, recarregar } = useRequisicao((sinal) => listarFotos(produtoId, sinal), [produtoId]);
  if (carregando) return <p role="status" className="t-body-sm t-muted">Abrindo o álbum no fornecedor…</p>;
  if (erro) return <EstadoErro erro={erro} onTentar={recarregar} />;
  const fotos = dados?.fotos || [];
  if (fotos.length === 0) return <p className="t-body-sm t-muted">O álbum não tem fotos disponíveis.</p>;

  // Enquanto ninguém mexeu, vale a primeira foto do álbum (a capa de sempre).
  const escolhidas = valor || [fotos[0].url];
  const alternar = (url) => {
    if (escolhidas.includes(url)) {
      if (escolhidas.length > 1) onMudar(escolhidas.filter((u) => u !== url));
    } else if (escolhidas.length < MAXIMO) {
      onMudar([...escolhidas, url]);
    }
  };
  const tornarCapa = (url) => onMudar([url, ...escolhidas.filter((u) => u !== url)]);

  return (
    <div>
      <p className="t-body-sm t-muted">
        Toque nas fotos que entram no produto. A primeira da seleção é a capa: use “Tornar capa” para trocar.
        {' '}{escolhidas.length} de {fotos.length} escolhidas (máximo {MAXIMO}).
      </p>
      <ul className="fotos-album__grade">
        {fotos.map((foto, i) => {
          const posicao = escolhidas.indexOf(foto.url);
          const marcada = posicao >= 0;
          return (
            <li key={foto.url} className={cn('fotos-album__item', marcada && 'fotos-album__item--marcada')}>
              <button
                type="button"
                className="fotos-album__foto"
                disabled={disabled || (!marcada && escolhidas.length >= MAXIMO)}
                aria-pressed={marcada}
                aria-label={`Foto ${i + 1}${marcada ? `, escolhida em ${posicao + 1}º` : ''}`}
                onClick={() => alternar(foto.url)}
              >
                <img src={viaProxy(foto.miniatura, origem)} alt="" loading="lazy" />
                {marcada && <span className="fotos-album__ordem">{posicao === 0 ? 'Capa' : posicao + 1}</span>}
              </button>
              {marcada && posicao > 0 && (
                <Button variante="texto" type="button" disabled={disabled} onClick={() => tornarCapa(foto.url)}>Tornar capa</Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
