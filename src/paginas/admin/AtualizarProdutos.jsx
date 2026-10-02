import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import { ErroGeral } from '../../components/ui/Field.jsx';
import { andamentoDaAtualizacao, atualizarProdutos } from '../../services/revisaoService.js';
import './AtualizarProdutos.css';

const INTERVALO_MS = 5000;

const dataCurta = (iso) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : null;

/**
 * Botão "Atualizar produtos" da Revisão: manda o backend puxar os álbuns novos da Yupoo para a fila
 * (`POST /admin/revisao/atualizar`) e acompanha a coleta (`GET /admin/revisao/atualizacao`), que leva
 * vários minutos. O backend não repete álbum (junta pelo id) e só roda uma coleta por vez, então clicar
 * de novo, ou abrir a tela com uma coleta em curso, só passa a mostrar o andamento dela.
 * `aoConcluir` recarrega a fila quando uma coleta termina enquanto esta tela está aberta.
 */
export default function AtualizarProdutos({ aoConcluir }) {
  const [andamento, setAndamento] = useState(null);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  // Só avisa "concluída" e recarrega a fila quando a coleta terminou ENQUANTO a tela estava aberta;
  // abrir a tela e ver uma coleta velha concluída não deve disparar nada.
  const viuRodando = useRef(false);
  // Em ref: um `aoConcluir` novo a cada render não pode refazer a consulta nem reiniciar o relógio.
  const aoConcluirRef = useRef(aoConcluir);
  aoConcluirRef.current = aoConcluir;

  const aplicar = useCallback((novo) => {
    setAndamento(novo);
    if (novo.estado === 'rodando') viuRodando.current = true;
    else if (viuRodando.current) {
      viuRodando.current = false;
      if (novo.estado === 'concluido') aoConcluirRef.current?.();
    }
  }, []);

  const consultar = useCallback(async () => {
    try {
      aplicar(await andamentoDaAtualizacao());
      setErro(null);
    } catch (falha) {
      setErro(falha);
    }
  }, [aplicar]);

  useEffect(() => { consultar(); }, [consultar]);

  const rodando = andamento?.estado === 'rodando';
  useEffect(() => {
    if (!rodando) return undefined;
    const relogio = setInterval(consultar, INTERVALO_MS);
    return () => clearInterval(relogio);
  }, [rodando, consultar]);

  const iniciar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      aplicar(await atualizarProdutos());
    } catch (falha) {
      setErro(falha);
    } finally {
      setEnviando(false);
    }
  };

  const ocupado = enviando || rodando;
  return (
    <div className="atualizar-produtos">
      <Button variante="secundaria" onClick={iniciar} disabled={ocupado}>
        {ocupado ? 'Atualizando…' : andamento?.estado === 'falhou' ? 'Tentar de novo' : 'Atualizar produtos'}
      </Button>
      <div className="atualizar-produtos__texto t-body-sm" role="status" aria-live="polite">
        {rodando && <p>Buscando álbuns novos na Yupoo. Pode levar vários minutos; você pode continuar revisando.</p>}
        {!rodando && andamento?.estado === 'concluido' && (
          <p>
            {andamento.adicionados > 0
              ? `Atualização concluída: ${andamento.adicionados.toLocaleString('pt-BR')} ${andamento.adicionados === 1 ? 'álbum novo entrou' : 'álbuns novos entraram'} na fila.`
              : 'Atualização concluída: nada novo, a fila já estava em dia.'}
          </p>
        )}
        {!rodando && andamento?.estado === 'ocioso' && andamento.concluidoEm && (
          <p className="t-muted">Última atualização: {dataCurta(andamento.concluidoEm)}.</p>
        )}
      </div>
      {!rodando && andamento?.estado === 'falhou' && <ErroGeral>{andamento.erro || 'A atualização falhou.'}</ErroGeral>}
      {erro && <ErroGeral>{erro.mensagem}</ErroGeral>}
    </div>
  );
}
