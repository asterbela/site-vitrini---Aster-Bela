# Painel de administração — mudou de lugar

A plataforma passou a usar o **Supabase**. O painel agora é uma aplicação
separada, numa pasta própria:

> ## 📂 `Desktop/painel-aster-bela/`
>
> Toda a documentação de instalação, uso e publicação está no
> **README.md** de lá.

---

## O que mudou

| | Antes | Agora |
|---|---|---|
| Banco de dados | SQLite num arquivo | Supabase (Postgres) |
| Login | servidor FastAPI próprio | Supabase Auth |
| Fotos | pasta no disco | Supabase Storage |
| Servidor | precisava ficar rodando | **nenhum** |
| Segurança | verificada no código Python | políticas **RLS** dentro do banco |

A vantagem prática: não há mais servidor para manter, e a autorização passou a
ser feita pelo próprio banco — mesmo que alguém adultere o JavaScript do painel,
o Postgres recusa o que não é permitido.

---

## Como o site se conecta

O arquivo **`config.js`** desta pasta guarda o endereço do Supabase:

```js
window.ASTER_CONFIG = {
  SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
  SUPABASE_ANON_KEY: "COLE-AQUI-A-CHAVE-ANON",
  BUCKET: "fotos",
};
```

Pegue os dois valores em **Supabase → Project Settings → API** e use sempre a
chave **anon / public** (nunca a `service_role`).

> Enquanto não preencher, o site funciona normalmente com o conteúdo que já
> está no HTML. Nada quebra.

---

## Por que o painel fica em outra pasta

Justamente para que **não exista caminho** do site público até ele. Publique os
dois em endereços diferentes (ex.: `asterbela.com.br` e
`painel.asterbela.com.br`) — é essa separação que fecha a porta para quem não
foi convidado.
