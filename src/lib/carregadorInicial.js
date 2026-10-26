/**
 * O carregador do index.html (#carregador-inicial) cobre a tela enquanto o JavaScript baixa e
 * continua por cima enquanto a loja verifica o acesso, sem recomeçar a animação no meio. Sai quando
 * a primeira tela de verdade monta: a loja liberada ou o portão (Estrutura.jsx) ou o painel
 * (SessaoAdmin.jsx). Chamar de novo não faz nada.
 */
export function tirarCarregadorInicial() {
  document.getElementById('carregador-inicial')?.remove();
}
