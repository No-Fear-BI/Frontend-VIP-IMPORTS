#!/usr/bin/env node
// Confere que todo var(--token) usado em src/**/*.css existe em src/styles/tokens.css.
// Não valida uso de hex/px soltos (isso é revisão humana); só a integridade do contrato de nomes.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const TOKENS_CSS = join(RAIZ, 'src/styles/tokens.css');
const SRC = join(RAIZ, 'src');

function listarArquivosCss(dir) {
  const resultado = [];
  for (const entrada of readdirSync(dir)) {
    const caminho = join(dir, entrada);
    const info = statSync(caminho);
    if (info.isDirectory()) resultado.push(...listarArquivosCss(caminho));
    else if (extname(caminho) === '.css') resultado.push(caminho);
  }
  return resultado;
}

// Apaga o texto do comentário mas preserva quebras de linha, para os números de linha
// reportados continuarem batendo com o arquivo original.
function semComentarios(cssTexto) {
  return cssTexto.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

function extrairDefinicoes(cssTexto) {
  const definidos = new Set();
  for (const m of cssTexto.matchAll(/(^|[\s{;])(--[a-z0-9-]+)\s*:/gi)) {
    definidos.add(m[2]);
  }
  return definidos;
}

function extrairUsos(cssTexto, arquivo) {
  const usos = [];
  for (const m of cssTexto.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
    const linha = cssTexto.slice(0, m.index).split('\n').length;
    usos.push({ token: m[1], arquivo, linha });
  }
  return usos;
}

const tokensCss = semComentarios(readFileSync(TOKENS_CSS, 'utf8'));
const definidos = extrairDefinicoes(tokensCss);

const arquivos = listarArquivosCss(SRC);
const usos = arquivos.flatMap((arquivo) =>
  extrairUsos(semComentarios(readFileSync(arquivo, 'utf8')), arquivo),
);

const pendurados = usos.filter((u) => !definidos.has(u.token));

console.log(`${definidos.size} tokens definidos em tokens.css`);
console.log(`${usos.length} usos de var(--token) em ${arquivos.length} arquivos .css`);

if (pendurados.length === 0) {
  console.log('Nenhuma referência pendurada.');
  process.exit(0);
}

console.log(`\n${pendurados.length} referência(s) pendurada(s):`);
for (const p of pendurados) {
  console.log(`  ${p.token}  ->  ${p.arquivo.replace(RAIZ, '')}:${p.linha}`);
}
process.exit(1);
