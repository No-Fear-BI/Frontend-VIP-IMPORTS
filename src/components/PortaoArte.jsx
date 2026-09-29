/*
 * Coluna da arte da tela de bloqueio (lado esquerdo), fiel ao design "Vitrine reservada":
 * cinco blocos de cor entrando em cascata, uma etiqueta creme ("X030 · Vitrine reservada") e o
 * nome da loja no pé. É só composição em CSS (PortaoAcesso.css) — nenhuma imagem, nenhum dado da
 * API. Some no celular. Se a arte final chegar como imagem, este é o único arquivo a trocar.
 * A logo oficial fica no painel da direita (PortaoAcesso › Moldura), não aqui.
 */
export default function PortaoArte() {
  return (
    <aside className="portao__arte" aria-hidden="true">
      <div className="arte__bloco arte__bloco--1" />
      <div className="arte__bloco arte__bloco--2">
        <div className="arte__etiqueta-topo">
          <span className="t-codigo">X030</span>
          <span className="arte__ilhos" />
        </div>
        <p className="arte__etiqueta-titulo">Vitrine reservada</p>
      </div>
      <div className="arte__bloco arte__bloco--3" />
      <div className="arte__bloco arte__bloco--4" />
      <div className="arte__bloco arte__bloco--5">
        <p className="arte__marca">VIP Imports</p>
      </div>
    </aside>
  );
}
