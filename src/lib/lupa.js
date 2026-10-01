// Lupa de foto: guarda a posição do mouse (em %) em --zoom-x/--zoom-y para o CSS
// usar como origem do zoom. Usado na página do produto e na fila de revisão.
export function acompanharMouse(evento) {
  const caixa = evento.currentTarget.getBoundingClientRect();
  const x = ((evento.clientX - caixa.left) / caixa.width) * 100;
  const y = ((evento.clientY - caixa.top) / caixa.height) * 100;
  evento.currentTarget.style.setProperty('--zoom-x', `${x}%`);
  evento.currentTarget.style.setProperty('--zoom-y', `${y}%`);
}
