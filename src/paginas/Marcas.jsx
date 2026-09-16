import { catalogoService } from '../services/catalogoService.js';
import { Esqueleto, EstadoErro, EstadoVazio } from '../components/Estados.jsx';
import { useRequisicao } from '../hooks/useRequisicao.js';
import { GradeMarcas } from './Home.jsx';

export default function Marcas() {
  const { dados, erro, carregando, recarregar } = useRequisicao((sinal) => catalogoService.marcas(sinal), []);
  const ordenadas = dados ? [...dados].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')) : [];

  return (
    <div className="container">
      <header className="topo-pagina">
        <p className="t-label-caps t-muted">Casas representadas</p>
        <h1 className="t-headline-lg">Marcas</h1>
      </header>
      <section className="secao secao--proxima" aria-label="Lista de marcas">
        {carregando ? (
          <div className="grade-marcas">
            {Array.from({ length: 12 }, (_, i) => (
              <Esqueleto key={i} className="esqueleto--bloco" />
            ))}
          </div>
        ) : erro ? (
          <EstadoErro erro={erro} onTentar={recarregar} titulo="Não conseguimos carregar as marcas." />
        ) : ordenadas.length === 0 ? (
          <EstadoVazio titulo="Nenhuma marca cadastrada ainda." acao={{ rotulo: 'Ver novidades', para: '/novidades' }} />
        ) : (
          <GradeMarcas marcas={ordenadas} />
        )}
      </section>
    </div>
  );
}
