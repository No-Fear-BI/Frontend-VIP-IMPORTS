import { requisitarAdmin } from '../lib/apiAdmin.js';

export const listarPendentes = (filtros, sinal) => requisitarAdmin('GET', '/admin/revisao/pendentes', { query: filtros, sinal });
export const decidirProduto = (corpo) => requisitarAdmin('POST', '/admin/revisao', { corpo });
export const desfazerDecisao = (produtoId) => requisitarAdmin('DELETE', '/admin/revisao', { query: { produtoId } });

export const listarAprovados = (sinal) => requisitarAdmin('GET', '/admin/revisao/publicados', { sinal });
export const tentarImagens = (produtoId) => requisitarAdmin('POST', '/admin/revisao/tentar-imagens', { query: { produtoId } });
