import { requisitar } from '../lib/apiClient.js';

export const listarPendentes = (filtros, sinal) => requisitar('GET', '/admin/revisao/pendentes', { query: filtros, sinal });
export const decidirProduto = (corpo) => requisitar('POST', '/admin/revisao', { corpo });
export const desfazerDecisao = (produtoId) => requisitar('DELETE', '/admin/revisao', { query: { produtoId } });
