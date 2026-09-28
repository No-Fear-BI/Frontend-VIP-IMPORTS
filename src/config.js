// Links de contato GERAL (rodapé, página Contato, CTA "Falar no WhatsApp").
// NÃO é o link de compra: esse vem pronto de POST /selecoes e o número da loja só existe
// no servidor. Vazio = o elemento some. Pendência: docs/pendencias-frontend.md.
export const LINK_WHATSAPP_CONTATO = import.meta.env.VITE_LINK_WHATSAPP_CONTATO || '';
export const LINK_INSTAGRAM = import.meta.env.VITE_LINK_INSTAGRAM || '';

// A API não tem imagem de coleção (GET /colecoes só traz id/nome/slug). Sem imagem
// configurada, o painel da home é tipográfico (verde sobre creme).
export const IMAGEM_COLECAO_FEMININA = import.meta.env.VITE_IMAGEM_COLECAO_FEMININA || '';
export const IMAGEM_COLECAO_MASCULINA = import.meta.env.VITE_IMAGEM_COLECAO_MASCULINA || '';

// Atendimento da loja. Diferente dos links acima, estes NAO vem do ambiente: sao dados
// reais confirmados pela VIP Imports (o cabecalho do Institucional.jsx proibe inventar
// horario e endereco — estes vieram do cliente, nao de suposicao).
export const EMAIL_CONTATO = 'contato@vipimports.com.br';
export const HORARIO_ATENDIMENTO = ['Seg a sex, 10h às 19h', 'Sábado, 10h às 14h'];
