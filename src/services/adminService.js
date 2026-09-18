import { requisitar } from '../lib/apiClient.js';

export const entrarAdmin = (email, senha) => requisitar('POST', '/admin/sessao', { corpo: { email, senha } });
export const obterAdminAtual = () => requisitar('GET', '/admin/eu');
export const sairAdmin = () => requisitar('DELETE', '/admin/sessao');
