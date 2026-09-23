import { Navigate, Outlet, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import Estrutura from './components/Estrutura.jsx';
import { ProvedorSessaoAdmin } from './contexto/SessaoAdmin.jsx';
import RotaAdminProtegida from './paginas/admin/Acesso.jsx';
import AdminBanners from './paginas/admin/Banners.jsx';
import AdminCategorias from './paginas/admin/Categorias.jsx';
import AdminClientes from './paginas/admin/Clientes.jsx';
import AdminCores from './paginas/admin/Cores.jsx';
import AdminDestaques from './paginas/admin/Destaques.jsx';
import EstruturaAdmin from './paginas/admin/EstruturaAdmin.jsx';
import AdminLogin from './paginas/admin/Login.jsx';
import AdminMarcas from './paginas/admin/Marcas.jsx';
import AdminProduto, { AdminProdutoNovo } from './paginas/admin/Produto.jsx';
import AdminProdutos from './paginas/admin/Produtos.jsx';
import AdminResumo from './paginas/admin/Resumo.jsx';
import AdminSelecaoDetalhe from './paginas/admin/Selecao.jsx';
import AdminSelecoes from './paginas/admin/Selecoes.jsx';
import AdminRevisao from './paginas/admin/Revisao.jsx';
import Categorias from './paginas/Categorias.jsx';
import Conta from './paginas/Conta.jsx';
import Home from './paginas/Home.jsx';
import { Contato, NaoEncontrada, Sobre } from './paginas/Institucional.jsx';
import Listagem from './paginas/Listagem.jsx';
import Marcas from './paginas/Marcas.jsx';
import Produto from './paginas/Produto.jsx';
import Selecao from './paginas/Selecao.jsx';

/*
 * Mapa de rotas.
 * - Loja: dentro de <Estrutura> (cabeçalho, rodapé, sessão do CLIENTE).
 * - Painel: /admin/*, FORA da estrutura da loja, dentro de <ProvedorSessaoAdmin> (cookie
 *   vip_sessao_admin, não lê nada de SessaoCliente). /admin/login fica aberto; todo o resto passa
 *   por <RotaAdminProtegida> antes de chegar à <EstruturaAdmin>. Página nova do painel entra
 *   DENTRO do grupo protegido — fora dele, abre sem login.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Estrutura />}>
        <Route index element={<Home />} />
        <Route path="feminino" element={<Listagem key="feminino" modo="colecao" colecaoFixa="feminino" />} />
        <Route path="masculino" element={<Listagem key="masculino" modo="colecao" colecaoFixa="masculino" />} />
        <Route path="colecoes/:slug" element={<ListagemDaColecao />} />
        <Route path="todos" element={<Listagem key="todos" modo="todos" />} />
        <Route path="novidades" element={<Listagem key="novidades" modo="novidades" />} />
        <Route path="produtos" element={<Listagem key="busca" modo="busca" />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="categorias/:categoria" element={<CategoriaRedireciona />} />
        <Route path="marcas" element={<Marcas />} />
        <Route path="marcas/:slug" element={<Listagem key="marca" modo="marca" />} />
        <Route path="produto/:codigo" element={<Produto />} />
        <Route path="selecao" element={<Selecao />} />
        {/* Na tela o carrinho se chama "seleção"; /carrinho existe para quem usar o nome técnico. */}
        <Route path="carrinho" element={<Navigate to="/selecao" replace />} />
        {/* Os favoritos moram na página da conta, junto com as seleções enviadas. */}
        <Route path="favoritos" element={<Navigate to="/conta" replace />} />
        <Route path="conta" element={<Conta />} />
        <Route path="sobre" element={<Sobre />} />
        <Route path="contato" element={<Contato />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Route>

      <Route path="admin" element={<PainelComSessao />}>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<RotaAdminProtegida />}>
          <Route element={<EstruturaAdmin />}>
            <Route index element={<Navigate to="resumo" replace />} />
            <Route path="resumo" element={<AdminResumo />} />
            <Route path="produtos" element={<AdminProdutos />} />
            <Route path="produtos/novo" element={<AdminProdutoNovo />} />
            <Route path="produtos/:id" element={<AdminProduto />} />
            <Route path="marcas" element={<AdminMarcas />} />
            <Route path="cores" element={<AdminCores />} />
            <Route path="categorias" element={<AdminCategorias />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="destaques" element={<AdminDestaques />} />
            <Route path="selecoes" element={<AdminSelecoes />} />
            <Route path="selecoes/:id" element={<AdminSelecaoDetalhe />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="revisao" element={<AdminRevisao />} />
            <Route path="*" element={<Navigate to="resumo" replace />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

/** A sessão do painel só existe dentro de /admin/*: a loja nunca chama GET /admin/eu. */
function PainelComSessao() {
  return (
    <ProvedorSessaoAdmin>
      <Outlet />
    </ProvedorSessaoAdmin>
  );
}

function ListagemDaColecao() {
  const { slug } = useParams();
  return <Listagem key={`colecao-${slug}`} modo="colecao" colecaoFixa={slug} />;
}

/*
 * O slug de categoria só é único DENTRO de uma coleção (GET /produtos exige `colecao` junto com
 * `categoria`). Por isso /categorias/:categoria precisa de ?colecao=… e vira a listagem da coleção
 * filtrada. Sem coleção, volta para /categorias, que mostra as categorias de cada coleção.
 */
function CategoriaRedireciona() {
  const { categoria } = useParams();
  const [params] = useSearchParams();
  const colecao = params.get('colecao');
  if (!colecao) return <Navigate to="/categorias" replace />;
  return (
    <Navigate to={`/colecoes/${encodeURIComponent(colecao)}?categoria=${encodeURIComponent(categoria)}`} replace />
  );
}
