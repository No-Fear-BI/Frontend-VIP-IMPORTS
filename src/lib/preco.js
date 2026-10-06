/*
 * Preço INTERNO do produto (só do painel, nunca da loja). O backend guarda centavos inteiros
 * (`precoCentavos`, de 0 a 10.000.000); a tela digita e mostra reais ("1.234,50"). Conta só com
 * inteiros: nada de float, para R$ 0,10 nunca virar 9 centavos.
 */

export const PRECO_MAXIMO_CENTAVOS = 10_000_000;

const FORMATADOR = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 123450 → "1.234,50" (sem o "R$": o rótulo do campo já diz). */
export function formatarCentavos(centavos) {
  return FORMATADOR.format(centavos / 100);
}

/** 123450 → "R$ 1.234,50". Espaço sem quebra: o "R$" nunca fica sozinho no fim da linha. */
export function formatarReais(centavos) {
  return `R$\u00A0${formatarCentavos(centavos)}`;
}

/**
 * Texto digitado → `{ centavos, erro }`. Vazio é válido (`centavos: null`: produto sem preço).
 * Aceita "1.234,50", "1234,5", "1234.50", "1234", "R$ 1.234,50". Com vírgula, o ponto só pode
 * ser separador de milhar; sem vírgula, "1.234" é milhar e "12.5" é decimal.
 */
export function lerPreco(texto) {
  const bruto = String(texto ?? '').replace(/R\$/gi, '').replace(/\s/g, '');
  if (!bruto) return { centavos: null, erro: null };
  if (bruto.startsWith('-')) return { centavos: null, erro: 'O preço não pode ser negativo.' };

  let inteiro;
  let fracao = '';
  if (bruto.includes(',')) {
    const partes = bruto.split(',');
    if (partes.length !== 2 || !/^\d{1,2}$/.test(partes[1] || '') || !/^(\d+|\d{1,3}(\.\d{3})+)$/.test(partes[0])) {
      return { centavos: null, erro: 'Preço inválido. Use o formato 1.234,50.' };
    }
    inteiro = partes[0].replace(/\./g, '');
    fracao = partes[1];
  } else if (/^\d{1,3}(\.\d{3})+$/.test(bruto)) {
    inteiro = bruto.replace(/\./g, '');
  } else if (/^\d+(\.\d{1,2})?$/.test(bruto)) {
    [inteiro, fracao = ''] = bruto.split('.');
  } else {
    return { centavos: null, erro: 'Preço inválido. Use o formato 1.234,50.' };
  }

  const centavos = Number(inteiro) * 100 + Number(fracao.padEnd(2, '0'));
  if (centavos > PRECO_MAXIMO_CENTAVOS) {
    return { centavos: null, erro: `O preço máximo é ${formatarReais(PRECO_MAXIMO_CENTAVOS)}.` };
  }
  return { centavos, erro: null };
}
