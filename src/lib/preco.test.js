import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatarCentavos, formatarReais, lerPreco } from './preco.js';

const centavos = (texto) => lerPreco(texto).centavos;

test('vazio é válido e significa sem preço', () => {
  assert.deepEqual(lerPreco(''), { centavos: null, erro: null });
  assert.deepEqual(lerPreco('   '), { centavos: null, erro: null });
  assert.deepEqual(lerPreco(undefined), { centavos: null, erro: null });
});

test('aceita vírgula, milhar e R$', () => {
  assert.equal(centavos('1.234,50'), 123450);
  assert.equal(centavos('1234,5'), 123450);
  assert.equal(centavos('1234,50'), 123450);
  assert.equal(centavos('R$ 1.234,50'), 123450);
  assert.equal(centavos('99.999,99'), 9999999);
  assert.equal(centavos('0,10'), 10);
  assert.equal(centavos('0'), 0);
});

test('sem vírgula: ponto de milhar ou decimal', () => {
  assert.equal(centavos('1234'), 123400);
  assert.equal(centavos('1.234'), 123400);
  assert.equal(centavos('1234.50'), 123450);
  assert.equal(centavos('12.5'), 1250);
});

test('não usa float: 0,10 + 19,99 caem exatos', () => {
  assert.equal(centavos('19,99'), 1999);
  assert.equal(centavos('1.005,05'), 100505);
});

test('negativo e lixo dão mensagem clara', () => {
  assert.match(lerPreco('-10').erro, /negativo/);
  assert.match(lerPreco('-0,01').erro, /negativo/);
  for (const ruim of ['abc', '1,234,5', '12,345', '1.2.3', '1,', ',50', '10 reais']) {
    assert.match(lerPreco(ruim).erro, /inválido/, ruim);
    assert.equal(lerPreco(ruim).centavos, null);
  }
});

test('teto de R$ 100.000,00', () => {
  assert.equal(centavos('100.000,00'), 10_000_000);
  assert.match(lerPreco('100.000,01').erro, /máximo/);
  assert.match(lerPreco('9999999').erro, /máximo/);
});

test('formata em reais', () => {
  assert.equal(formatarCentavos(123450), '1.234,50');
  assert.equal(formatarCentavos(5), '0,05');
  assert.equal(formatarReais(10_000_000), 'R$ 100.000,00');
});
