/**
 * Junta classes CSS, ignorando valores falsos.
 * cn('botao', largo && 'botao--largo', { 'botao--ativo': ativo }) → 'botao botao--largo botao--ativo'
 */
export function cn(...partes) {
  const classes = [];
  for (const parte of partes) {
    if (!parte) continue;
    if (typeof parte === 'string') classes.push(parte);
    else if (Array.isArray(parte)) classes.push(cn(...parte));
    else if (typeof parte === 'object') {
      for (const [classe, ligada] of Object.entries(parte)) if (ligada) classes.push(classe);
    }
  }
  return classes.filter(Boolean).join(' ');
}
