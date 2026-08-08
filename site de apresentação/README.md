# Aster Bela — Site de Apresentação

Landing page institucional (página única) da marca de moda feminina **Aster Bela** —
conceito *Elegância Tropical*. Estática, sem build, pronta para hospedar em qualquer lugar.

---

## Como ver o site

**Modo fácil:** dê dois cliques em **`abrir-site.bat`**. Ele sobe o servidor e abre o
navegador sozinho. Para encerrar, feche a janela preta.

**Pelo terminal:**

```bash
python -m http.server 5500
```

Depois abra <http://localhost:5500/>.

> Abrir o `index.html` direto (`file://`) funciona, mas um servidor local evita
> problemas de cache e garante o carregamento correto das fontes.

---

## Estrutura

```
site de apresentação/
├── index.html            # marcação de todas as seções
├── config.js             # ← endereço do Supabase (veja PAINEL.md)
├── abrir-site.bat        # atalho: sobe o servidor e abre o navegador
├── README.md · PAINEL.md
├── .gitignore
└── assets/
    ├── css/
    │   ├── tokens.css    # design tokens — MEXA AQUI para mudar cores/fontes
    │   └── main.css      # estilos, numerados por seção
    ├── js/
    │   ├── main.js       # nav, menu, reveal, parallax, mosaico, lightbox
    │   └── content.js    # busca o conteúdo no Supabase e envia depoimentos
    └── img/
        └── logo.svg      # PLACEHOLDER — trocar pela logo oficial
```

> O painel de administração é uma aplicação separada, em
> `Desktop/painel-aster-bela/`. Mantê-lo fora desta pasta é o que impede
> alguém de chegar ao painel navegando pela loja.

## Conteúdo dinâmico

Textos, fotos, contatos e depoimentos vêm do **Supabase** e são editados pelo
painel. Preencha `config.js` para conectar — enquanto isso, o site exibe o
conteúdo que já está no HTML. Detalhes em [PAINEL.md](PAINEL.md).

### Carrossel do Lookbook (Google Drive)

As fotos do mosaico infinito podem vir de uma **pasta no Google Drive**.
Somente imagens dessa pasta aparecem no carrossel — sem limite de quantidade.
A automação roda no Drive via Apps Script; instruções em
[automacao-google-drive/README.md](automacao-google-drive/README.md).

---

## Seções da página

| # | Seção | O que faz |
|---|-------|-----------|
| — | **Hero** | Foto em tela cheia, parallax suave, título editorial |
| — | **Ticker** | Faixa coral com os valores da marca deslizando |
| 01 | **A marca** | Manifesto tipográfico |
| 02 | **Lookbook** | Mosaico infinito — 2 faixas em sentidos opostos, clique amplia |
| 03 | **Nossa história** | Foto do ateliê, diferenciais, assinatura da fundadora |
| — | **Depoimentos** | Prova social sobre fundo ameixa |
| — | **CTA** | Cupom CHEGUEI + WhatsApp e Instagram |
| — | **Rodapé** | Navegação, social, contato |

---

## Personalização rápida

### Cores e fontes
Tudo em `assets/css/tokens.css`. A cor principal da marca é `--brand` (coral-rosé,
extraído da logo). Mudou ali, mudou no site inteiro.

### Textos, fotos e links
Tudo em `index.html`. Para trocar contatos, procure por:
- `wa.me/5571936181742` (WhatsApp)
- `instagram.com/asterbela`
- `contato@asterbela.com.br`

### Trocar as fotos do mosaico
No `index.html`, procure `look__cell` — cada `<figure>` é uma foto. Troque o `src`
e **atualize o `alt`** (descrição para acessibilidade e SEO).

> ⚠️ **Cache:** ao editar `main.css` ou `main.js`, incremente o `?v=2` nos links do
> `index.html` (para `?v=3`, etc.). Isso força o navegador a pegar a versão nova.

---

## Logo oficial

O site usa um **wordmark tipográfico adaptativo** na navegação — ele muda de cor
sozinho sobre a foto e sobre o fundo claro. Para usar o arquivo oficial:

1. Salve a imagem em `assets/img/logo.png`.
2. Substitua o `<span class="brand__name">` do `index.html` por
   `<img src="assets/img/logo.png" alt="Aster Bela" class="brand__img">`.

---

## Fotos

As imagens atuais são **temporárias** (Unsplash), escolhidas uma a uma para combinar
com o clima da marca. Substitua pelas fotos reais da coleção — é o que mais vai
diferenciar o site.

---

## Acessibilidade e performance

- Contraste conforme WCAG AA; foco visível em todos os interativos.
- Mosaico navegável por teclado (Tab + Enter); `Esc` fecha menu e lightbox.
- Respeita `prefers-reduced-motion` (desliga animações e o mosaico vira rolagem manual).
- Imagens com `loading="lazy"`; hero com `fetchpriority="high"`.
- Apenas 4 camadas de composição (`will-change`) — animações fluidas sem travar.

---

## Publicar na internet

Por ser 100% estática, publique em segundos arrastando esta pasta para
**Netlify Drop**, **Vercel**, **Cloudflare Pages** ou **GitHub Pages**.
