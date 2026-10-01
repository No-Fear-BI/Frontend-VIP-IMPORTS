import { requisitarAdmin } from '../lib/apiAdmin.js';

export const listarPendentes = (filtros, sinal) => requisitarAdmin('GET', '/admin/revisao/pendentes', { query: filtros, sinal });
export const decidirProduto = (corpo) => requisitarAdmin('POST', '/admin/revisao', { corpo });
export const listarFotos = (produtoId, sinal) => requisitarAdmin('GET', '/admin/revisao/fotos', { query: { produtoId }, sinal });
