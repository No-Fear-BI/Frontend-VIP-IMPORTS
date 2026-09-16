// Gera as ilustrações do modo "exemplo" (public/exemplo/). Só para avaliar layout
// sem fotos reais — nunca vai para produção. Usa apenas as cores de DESIGN.md.
//   node scripts/gerar-ilustracoes-exemplo.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'exemplo');

// Cores de DESIGN.md › colors
const VERDE = '#28361F';
const VERDE_HOVER = '#414C31';
const FILETE_VERDE = '#4A5337';
const CREME = '#FCEAB3';
const CREME_MUTED = '#C1B88A';

// Paleta "sobre branco" (foto de produto) e "sobre verde" (banner).
const CLARA = { tinta: VERDE, sombra: VERDE_HOVER, detalhe: CREME, metal: CREME_MUTED, chao: CREME };
const ESCURA = { tinta: CREME, sombra: CREME_MUTED, detalhe: VERDE, metal: CREME_MUTED, chao: FILETE_VERDE };

const desenhos = {
  bolsa: (p) => `
    <ellipse cx="400" cy="800" rx="290" ry="16" fill="${p.chao}" opacity="0.7"/>
    <path d="M285 430 C285 230 515 230 515 430" fill="none" stroke="${p.tinta}" stroke-width="22"/>
    <path d="M195 430 H605 L645 790 H155 Z" fill="${p.tinta}"/>
    <path d="M195 430 H605 L595 540 Q400 600 205 540 Z" fill="${p.sombra}"/>
    <rect x="378" y="545" width="44" height="40" fill="${p.detalhe}"/>`,
  'bolsa-corrente': (p) => `
    <ellipse cx="400" cy="760" rx="220" ry="14" fill="${p.chao}" opacity="0.7"/>
    <path d="M250 480 C230 170 570 170 550 480" fill="none" stroke="${p.metal}" stroke-width="12" stroke-dasharray="20 10"/>
    <rect x="220" y="470" width="360" height="280" fill="${p.tinta}"/>
    <g stroke="${p.sombra}" stroke-width="3" opacity="0.9">
      <path d="M220 560 L310 470 M220 650 L400 470 M220 740 L490 470 M290 750 L570 470 M380 750 L580 550 M470 750 L580 640"/>
      <path d="M580 560 L490 470 M580 650 L400 470 M580 740 L310 470 M510 750 L230 470 M420 750 L220 550 M330 750 L220 640"/>
    </g>
    <path d="M220 470 H580 V585 Q400 640 220 585 Z" fill="${p.sombra}"/>
    <circle cx="400" cy="610" r="22" fill="${p.detalhe}"/>`,
  scarpin: (p) => `
    <ellipse cx="410" cy="862" rx="300" ry="12" fill="${p.chao}" opacity="0.7"/>
    <path d="M120 858 Q110 790 215 780 Q350 770 450 700 Q540 630 575 575 Q610 530 680 540 L688 620 Q630 625 590 670 Q500 790 300 852 Z" fill="${p.tinta}"/>
    <path d="M600 575 Q640 555 675 562 L680 600 Q640 600 612 625 Z" fill="${p.detalhe}"/>
    <path d="M630 640 L688 628 L660 858 H645 Z" fill="${p.sombra}"/>`,
  oculos: (p) => `
    <path d="M110 420 L60 330 M690 420 L740 330" stroke="${p.tinta}" stroke-width="14" fill="none"/>
    <ellipse cx="250" cy="500" rx="150" ry="118" fill="${p.tinta}"/>
    <ellipse cx="550" cy="500" rx="150" ry="118" fill="${p.tinta}"/>
    <path d="M385 470 Q400 440 415 470" stroke="${p.tinta}" stroke-width="16" fill="none"/>
    <path d="M165 455 Q195 415 245 410" stroke="${p.metal}" stroke-width="10" fill="none" opacity="0.8"/>
    <path d="M465 455 Q495 415 545 410" stroke="${p.metal}" stroke-width="10" fill="none" opacity="0.8"/>`,
  relogio: (p) => `
    <rect x="335" y="120" width="130" height="760" fill="${p.sombra}"/>
    <circle cx="400" cy="500" r="160" fill="${p.tinta}"/>
    <circle cx="400" cy="500" r="128" fill="${p.detalhe}"/>
    <rect x="555" y="480" width="34" height="40" fill="${p.tinta}"/>
    <path d="M400 500 V405 M400 500 L465 540" stroke="${p.tinta}" stroke-width="10" stroke-linecap="square"/>
    <g fill="${p.tinta}"><rect x="396" y="382" width="8" height="18"/><rect x="396" y="600" width="8" height="18"/><rect x="282" y="496" width="18" height="8"/><rect x="500" y="496" width="18" height="8"/></g>`,
  cinto: (p) => `
    <ellipse cx="400" cy="520" rx="270" ry="200" fill="none" stroke="${p.tinta}" stroke-width="70"/>
    <ellipse cx="400" cy="520" rx="270" ry="200" fill="none" stroke="${p.sombra}" stroke-width="4" stroke-dasharray="14 12"/>
    <rect x="560" y="440" width="120" height="160" fill="none" stroke="${p.metal}" stroke-width="18"/>
    <rect x="600" y="505" width="90" height="30" fill="${p.metal}"/>`,
  carteira: (p) => `
    <ellipse cx="400" cy="700" rx="240" ry="12" fill="${p.chao}" opacity="0.7"/>
    <rect x="180" y="390" width="440" height="300" fill="${p.tinta}"/>
    <path d="M180 390 H620 V520 L400 580 L180 520 Z" fill="${p.sombra}"/>
    <rect x="382" y="555" width="36" height="36" fill="${p.detalhe}"/>`,
  tenis: (p) => `
    <ellipse cx="400" cy="800" rx="320" ry="12" fill="${p.chao}" opacity="0.7"/>
    <path d="M100 760 Q95 650 200 630 L380 520 Q470 480 560 500 L690 540 Q720 560 715 640 L712 760 Z" fill="${p.detalhe}" stroke="${p.tinta}" stroke-width="10"/>
    <rect x="95" y="740" width="625" height="50" fill="${p.tinta}"/>
    <path d="M300 590 L420 640 M340 560 L460 610 M385 530 L500 580" stroke="${p.tinta}" stroke-width="8"/>
    <path d="M560 560 Q620 600 700 600" stroke="${p.sombra}" stroke-width="12" fill="none"/>`,
  camisa: (p) => `
    <path d="M230 300 L330 260 H470 L570 300 L660 480 L580 510 L560 460 V840 H240 V460 L220 510 L140 480 Z" fill="${p.tinta}"/>
    <path d="M330 260 L400 360 L470 260 L440 250 L400 300 L360 250 Z" fill="${p.detalhe}"/>
    <path d="M400 360 V840" stroke="${p.sombra}" stroke-width="4"/>
    <g fill="${p.detalhe}"><circle cx="400" cy="440" r="8"/><circle cx="400" cy="540" r="8"/><circle cx="400" cy="640" r="8"/><circle cx="400" cy="740" r="8"/></g>`,
  lenco: (p) => `
    <rect x="170" y="270" width="460" height="460" fill="${p.detalhe}" transform="rotate(8 400 500)"/>
    <rect x="200" y="300" width="400" height="400" fill="none" stroke="${p.tinta}" stroke-width="12" transform="rotate(8 400 500)"/>
    <g transform="rotate(8 400 500)" fill="${p.tinta}">
      <path d="M400 380 L440 420 L400 460 L360 420 Z"/><path d="M400 540 L440 580 L400 620 L360 580 Z"/>
      <path d="M320 460 L360 500 L320 540 L280 500 Z"/><path d="M480 460 L520 500 L480 540 L440 500 Z"/>
      <circle cx="400" cy="500" r="16"/>
    </g>`,
  perfume: (p) => `
    <ellipse cx="400" cy="800" rx="200" ry="12" fill="${p.chao}" opacity="0.7"/>
    <rect x="345" y="270" width="110" height="120" fill="${p.tinta}"/>
    <rect x="375" y="390" width="50" height="30" fill="${p.sombra}"/>
    <rect x="245" y="420" width="310" height="370" fill="${p.detalhe}" stroke="${p.tinta}" stroke-width="10"/>
    <rect x="250" y="600" width="300" height="185" fill="${p.sombra}" opacity="0.35"/>
    <rect x="310" y="520" width="180" height="70" fill="${p.tinta}"/>`,
  mocassim: (p) => `
    <ellipse cx="400" cy="780" rx="310" ry="12" fill="${p.chao}" opacity="0.7"/>
    <path d="M110 760 Q100 650 230 620 Q380 590 470 540 Q560 500 650 520 Q715 540 712 640 L708 760 Z" fill="${p.tinta}"/>
    <rect x="105" y="745" width="610" height="30" fill="${p.sombra}"/>
    <path d="M300 615 Q380 570 470 548 L500 600 Q400 640 320 660 Z" fill="${p.sombra}"/>
    <rect x="360" y="596" width="90" height="16" fill="${p.detalhe}" transform="rotate(-14 405 604)"/>`,
};

function svg(largura, altura, conteudo, fundo) {
  const chao = fundo ? `<rect width="${largura}" height="${altura}" fill="${fundo}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${altura}" width="${largura}" height="${altura}">${chao}${conteudo}</svg>\n`;
}

function gravar(caminho, conteudo) {
  const destino = join(RAIZ, caminho);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, conteudo);
}

// Produto: 800x1000 (4:5), fundo transparente — a vitrine branca fica atrás.
for (const [nome, desenhar] of Object.entries(desenhos)) {
  gravar(`produtos/${nome}.svg`, svg(800, 1000, desenhar(CLARA)));
  gravar(`produtos/${nome}-2.svg`, svg(800, 1000, `<g transform="translate(800 0) scale(-1 1)">${desenhar(CLARA)}</g>`));
}

// Categoria: quadrada, fundo creme.
const categorias = {
  bolsas: 'bolsa', calcados: 'scarpin', acessorios: 'oculos', relogios: 'relogio',
  camisas: 'camisa', cintos: 'cinto', perfumes: 'perfume', carteiras: 'carteira',
};
for (const [slug, desenho] of Object.entries(categorias)) {
  gravar(`categorias/${slug}.svg`, svg(800, 1000, `<g transform="translate(0 -100)">${desenhos[desenho](CLARA)}</g>`, CREME).replace('viewBox="0 0 800 1000" width="800" height="1000"', 'viewBox="0 0 800 800" width="800" height="800"'));
}

// Coleções: retrato, fundo verde, desenhos em creme.
gravar('colecoes/feminino.svg', svg(900, 1100,
  `<g transform="translate(-40 40) scale(0.9)">${desenhos.bolsa(ESCURA)}</g><g transform="translate(330 420) scale(0.7)">${desenhos.scarpin(ESCURA)}</g>`, VERDE_HOVER));
gravar('colecoes/masculino.svg', svg(900, 1100,
  `<g transform="translate(-20 20) scale(0.9)">${desenhos.camisa(ESCURA)}</g><g transform="translate(400 400) scale(0.65)">${desenhos.relogio(ESCURA)}</g>`, FILETE_VERDE));

// Banners: 1600x900 no desktop, 900x1200 no celular. Desenho à direita, espaço para texto à esquerda.
const banners = [
  ['bolsa', 'bolsa-corrente'],
  ['oculos', 'relogio'],
  ['mocassim', 'camisa'],
];
banners.forEach(([a, b], i) => {
  const n = i + 1;
  gravar(`banners/banner-${n}.svg`, svg(1600, 900,
    `<circle cx="1180" cy="430" r="360" fill="${VERDE_HOVER}"/>
     <g transform="translate(760 -40) scale(0.95)">${desenhos[a](ESCURA)}</g>
     <g transform="translate(1110 260) scale(0.6)">${desenhos[b](ESCURA)}</g>`, VERDE));
  gravar(`banners/banner-${n}-mobile.svg`, svg(900, 1200,
    `<circle cx="450" cy="420" r="340" fill="${VERDE_HOVER}"/>
     <g transform="translate(60 -40) scale(0.9)">${desenhos[a](ESCURA)}</g>`, VERDE));
});

// Favicon: "V" creme sobre verde (combinação oficial do manual).
writeFileSync(join(RAIZ, '..', 'favicon.svg'), svg(64, 64,
  `<text x="32" y="47" text-anchor="middle" font-family="Didot, 'Bodoni 72', Georgia, serif" font-size="44" fill="${CREME}">V</text>`, VERDE));

console.log('Ilustrações de exemplo geradas em', RAIZ);
