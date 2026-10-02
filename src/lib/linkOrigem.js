// O Yupoo responde 404 a um álbum aberto sem `uid=1` na URL, e os links salvos (fila e produto) vêm sem ele.
export function linkDaOrigem(url) {
  try {
    const link = new URL(url);
    if (!link.searchParams.has('uid')) link.searchParams.set('uid', '1');
    return link.toString();
  } catch {
    return url;
  }
}
