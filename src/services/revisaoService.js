import { requisitarAdmin } from '../lib/apiAdmin.js';

export const listarPendentes = (filtros, sinal) => requisitarAdmin('GET', '/admin/revisao/pendentes', { query: filtros, sinal });
export const decidirProduto = (corpo) => requisitarAdmin('POST', '/admin/revisao', { corpo });
// Botão "Atualizar produtos": puxa os álbuns novos da Yupoo (o backend não repete álbum e roda uma coleta por vez).
export const atualizarProdutos = () => requisitarAdmin('POST', '/admin/revisao/atualizar');
export const andamentoDaAtualizacao = (sinal) => requisitarAdmin('GET', '/admin/revisao/atualizacao', { sinal });
export const listarFotos = (produtoId, sinal) => requisitarAdmin('GET', '/admin/revisao/fotos', { query: { produtoId }, sinal });
