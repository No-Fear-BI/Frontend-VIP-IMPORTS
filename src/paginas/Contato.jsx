import { useState } from 'react';
import { IconeSeta, IconeWhatsApp } from '../components/Icones.jsx';
import {
  EMAIL_CONTATO,
  HORARIO_ATENDIMENTO,
  LINK_INSTAGRAM,
  LINK_WHATSAPP_CONTATO,
} from '../config.js';
import Field, { ErroGeral } from '../components/ui/Field.jsx';
import Button from '../components/ui/Button.jsx';
import './Contato.css';

/**
 * A mensagem NÃO vai para a API: não existe rota de contato no backend. Um formulário que
 * só limpasse os campos faria a pessoa achar que alguém recebeu — então ele monta o texto e
 * abre o WhatsApp, o mesmo canal onde a loja fecha venda. Sem link configurado, a coluna do
 * formulário não aparece: melhor não ter formulário do que ter um que não entrega.
 */

/** Entrada da página em cascata (.entra, em global.css): `ordem` multiplica o --atraso-cascata-pagina. */
function entra(ordem) {
  return { style: { '--ordem': ordem } };
}

/** Acrescenta ?text= (ou &text=) sem quebrar um link que já tenha query. */
function linkComTexto(base, texto) {
  return `${base}${base.includes('?') ? '&' : '?'}text=${encodeURIComponent(texto)}`;
}

/** @vipimports a partir da URL. Link sem caminho (só o domínio) não vira arroba nenhuma. */
function arrobaInstagram(url) {
  try {
    const caminho = new URL(url).pathname.replace(/^\/+|\/+$/g, '');
    return caminho ? `@${caminho}` : '';
  } catch {
    return '';
  }
}

export default function Contato() {
  const arroba = LINK_INSTAGRAM ? arrobaInstagram(LINK_INSTAGRAM) : '';

  return (
    <div className="container contato">
      <div className="contato__grade">
        <section className="contato__atendimento">
          <header>
            <p className="t-label-caps t-muted entra" {...entra(0)}>
              Contato
            </p>
            <h1 className="t-headline-lg entra" {...entra(1)}>
              Fale com o atendimento
            </h1>
          </header>
          <p className="t-body-lg entra" {...entra(2)}>
            O jeito mais rápido é pelo WhatsApp.
          </p>

          {LINK_WHATSAPP_CONTATO && (
            <Button
              variante="primaria"
              href={LINK_WHATSAPP_CONTATO}
              target="_blank"
              rel="noopener noreferrer"
              className="entra"
              {...entra(3)}
            >
              <IconeWhatsApp />
              Chamar no WhatsApp
            </Button>
          )}

          {LINK_INSTAGRAM && (
            <a
              href={LINK_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="link-caps entra"
              {...entra(4)}
            >
              Instagram {arroba} <IconeSeta />
            </a>
          )}

          <hr className="filete" />

          <div className="contato__bloco entra" {...entra(5)}>
            <p className="t-label-caps t-muted">Horário</p>
            {HORARIO_ATENDIMENTO.map((linha) => (
              <p key={linha} className="t-body-sm">
                {linha}
              </p>
            ))}
          </div>

          <div className="contato__bloco entra" {...entra(6)}>
            <p className="t-label-caps t-muted">E-mail</p>
            <p className="t-body-sm">
              <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>
            </p>
          </div>
        </section>

        {LINK_WHATSAPP_CONTATO && <FormMensagem />}
      </div>
    </div>
  );
}

function FormMensagem() {
  const [form, setForm] = useState({ nome: '', whatsapp: '', mensagem: '' });
  const [erro, setErro] = useState(null);

  function enviar(evento) {
    evento.preventDefault();
    const nome = form.nome.trim();
    const mensagem = form.mensagem.trim();
    if (!nome || !mensagem) {
      setErro('Preencha seu nome e a mensagem para continuar.');
      return;
    }
    setErro(null);
    const whatsapp = form.whatsapp.trim();
    const texto = [
      `Olá! Aqui é ${nome}.`,
      mensagem,
      whatsapp && `Meu WhatsApp: ${whatsapp}`,
    ]
      .filter(Boolean)
      .join('\n\n');
    window.open(linkComTexto(LINK_WHATSAPP_CONTATO, texto), '_blank', 'noopener,noreferrer');
  }

  return (
    <section className="contato__mensagem entra" aria-labelledby="titulo-mensagem" {...entra(3)}>
      <h2 id="titulo-mensagem" className="t-headline-md">
        Ou deixe uma mensagem
      </h2>
      <form className="contato__form" onSubmit={enviar} noValidate>
        <Field
          id="contato-nome"
          rotulo="Nome"
          name="name"
          autoComplete="name"
          required
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
        <Field
          id="contato-whatsapp"
          rotulo="WhatsApp (opcional)"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
        />
        <div className="campo">
          <label htmlFor="contato-texto" className="t-label-caps">
            Mensagem
          </label>
          <textarea
            id="contato-texto"
            className="campo__input contato__textarea"
            rows={5}
            required
            value={form.mensagem}
            onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
          />
        </div>
        {erro && (
          <div className="contato__erro">
            <ErroGeral>{erro}</ErroGeral>
          </div>
        )}
        <div>
          <Button variante="secundaria" type="submit">
            Enviar mensagem
          </Button>
        </div>
      </form>
    </section>
  );
}
