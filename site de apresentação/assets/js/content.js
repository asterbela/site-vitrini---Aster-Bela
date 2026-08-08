/* ============================================================
   Aster Bela — ponte entre o site e o Supabase

   Fala direto com a API REST do Supabase (PostgREST). Não carrega
   biblioteca alguma: o site continua leve.

   Regra de ouro: se o Supabase não responder, o site segue no ar com o
   conteúdo que já está no HTML. Nunca fica em branco.
   ============================================================ */
(() => {
  "use strict";

  const CFG = window.ASTER_CONFIG || {};
  const URL_BASE = (CFG.SUPABASE_URL || "").replace(/\/+$/, "");
  const KEY = CFG.SUPABASE_ANON_KEY || "";
  const CONFIGURADO = URL_BASE && KEY && !URL_BASE.includes("SEU-PROJETO");
  const DRIVE_WEBAPP = (CFG.GOOGLE_DRIVE?.WEBAPP_URL || "").trim();
  const DRIVE_ATIVO = Boolean(DRIVE_WEBAPP);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const byPath = (o, p) => p.split(".").reduce((a, k) => (a ?? {})[k], o);

  const rest = (caminho) =>
    fetch(`${URL_BASE}/rest/v1/${caminho}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))));

  const fotoUrl = (path) =>
    /^https?:\/\//.test(path)
      ? path
      : `${URL_BASE}/storage/v1/object/public/${CFG.BUCKET || "fotos"}/${path}`;

  /* ─────────── aplicação do conteúdo ─────────── */
  function aplicarTextos(dados) {
    $$("[data-cms]").forEach((el) => {
      const p = el.dataset.cms;
      const valor =
        p === "coupon.discount_text"
          ? `${byPath(dados, "coupon.discount")} de desconto`
          : byPath(dados, p);
      // textContent (nunca innerHTML): conteúdo do painel jamais vira marcação.
      if (valor != null && String(valor).trim()) el.textContent = valor;
    });
    if (dados.coupon && dados.coupon.enabled === false) {
      const bloco = $('[data-cms-block="coupon"]');
      if (bloco) bloco.hidden = true;
    }
  }

  function aplicarContatos(c) {
    if (!c) return;
    const wa = `https://wa.me/${c.whatsapp}`;
    $$('a[href*="wa.me"]').forEach((a) => {
      const query = a.href.includes("?") ? "?" + a.href.split("?")[1] : "";
      a.href = wa + query;
    });
    $$('a[href^="mailto:"]').forEach((a) => {
      a.href = `mailto:${c.email}`;
      if (a.textContent.includes("@")) a.textContent = c.email;
    });
    $$('a[href^="tel:"]').forEach((a) => {
      a.href = `tel:+${c.whatsapp}`;
      a.textContent = c.phone_display;
    });
    $$('a[href*="instagram.com"]').forEach((a) => (a.href = c.instagram));
    if (c.tiktok) $$('a[href*="tiktok.com"]').forEach((a) => (a.href = c.tiktok));
  }

  function aplicarFaixa(itens) {
    if (!itens || !itens.length) return;
    const track = $(".ticker__track");
    if (!track) return;
    track.innerHTML = "";
    // Duplicada: é o que faz a faixa emendar sem salto.
    [...itens, ...itens].forEach((texto) => {
      const span = document.createElement("span");
      span.textContent = texto;
      track.append(span, document.createElement("i"));
    });
  }

  function aplicarHistoria(story) {
    if (!story) return;

    const titulo = $(".story__text .h2");
    if (titulo && story.title) {
      titulo.textContent = story.title + " ";
      const em = document.createElement("em");
      em.textContent = story.title_accent || "";
      titulo.appendChild(em);
    }
    const texto = $(".story__p");
    if (texto && story.text) texto.textContent = story.text;
    const legenda = $(".story__media figcaption");
    if (legenda && story.caption) legenda.textContent = story.caption;
    const assinatura = $(".signature__hand");
    if (assinatura && story.signature) assinatura.textContent = story.signature;
    const cargo = $(".signature__role");
    if (cargo && story.signature_role) cargo.textContent = story.signature_role;

    if (Array.isArray(story.feats) && story.feats.length) {
      const lista = $(".feats");
      if (!lista) return;
      // Recicla os ícones que já estão no HTML.
      const icones = $$(".feats__icon", lista).map((el) => el.innerHTML);
      lista.innerHTML = "";
      story.feats.forEach((f, i) => {
        const li = document.createElement("li");
        li.className = "feats__item reveal is-visible";

        const icone = document.createElement("span");
        icone.className = "feats__icon";
        icone.setAttribute("aria-hidden", "true");
        icone.innerHTML = icones[i % icones.length] || icones[0] || "";

        const caixa = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = f.title;
        caixa.appendChild(strong);
        if (f.subtitle) {
          const small = document.createElement("small");
          small.textContent = f.subtitle;
          caixa.appendChild(small);
        }
        li.append(icone, caixa);
        lista.appendChild(li);
      });
    }
  }

  function montarCelulaCarrossel(foto, idx) {
    const larga = foto.wide || foto.larga || idx % 3 === 1;
    const fig = document.createElement("figure");
    fig.className = "look__cell" + (larga ? " look__cell--wide" : "");
    fig.setAttribute("role", "button");
    fig.tabIndex = 0;
    fig.setAttribute("aria-label", "Ampliar foto");

    const img = document.createElement("img");
    img.src = /^https?:\/\//.test(foto.path || "") ? foto.path : fotoUrl(foto.path);
    img.alt = foto.alt || "Peça da coleção Aster Bela";
    img.loading = "lazy";

    fig.appendChild(img);
    return fig;
  }

  function aplicarFotosCarrossel(fotos) {
    if (!fotos || fotos.length < 1) return false;
    const faixas = $$(".look__track");
    if (!faixas.length) return false;

    const metade = Math.ceil(fotos.length / 2);
    const linhas = [fotos.slice(0, metade), fotos.slice(metade)];

    faixas.forEach((track, i) => {
      const lista = linhas[i]?.length ? linhas[i] : fotos;
      track.innerHTML = "";
      lista.forEach((foto, idx) => track.appendChild(montarCelulaCarrossel(foto, idx)));
    });
    document.dispatchEvent(new CustomEvent("aster:photos-updated"));
    return true;
  }

  function aplicarFotos(fotos) {
    if (!fotos || fotos.length < 3) return;
    aplicarFotosCarrossel(
      fotos.map((foto) => ({
        path: fotoUrl(foto.path),
        alt: foto.alt,
        wide: false,
      }))
    );
  }

  async function carregarCarrosselDrive() {
    if (!DRIVE_ATIVO) return false;
    try {
      const res = await fetch(DRIVE_WEBAPP, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const dados = await res.json();
      const fotos = Array.isArray(dados) ? dados : dados.fotos;
      if (!fotos?.length) return false;
      aplicarFotosCarrossel(fotos);
      document.documentElement.dataset.carrosselFonte = "google-drive";
      return true;
    } catch (err) {
      document.documentElement.dataset.carrosselFonte = "google-drive-offline";
      console.info("[Aster Bela] Carrossel do Drive indisponível; usando fallback.", err);
      return false;
    }
  }

  function aplicarDepoimentos(itens) {
    if (!itens || !itens.length) return;
    const linha = $('[data-cms-list="testimonials"]');
    const destaque = $(".voices__lead");
    if (!linha) return;

    const principal = itens.find((t) => t.featured) || itens[0];
    if (destaque && principal) {
      const p = destaque.querySelector("p");
      const cite = destaque.querySelector("cite");
      if (p) p.textContent = `“${principal.text}”`;
      if (cite) cite.textContent = principal.city ? `${principal.name} · ${principal.city}` : principal.name;
    }

    const resto = itens.filter((t) => t !== principal).slice(0, 3);
    if (!resto.length) return;
    linha.innerHTML = "";
    resto.forEach((t) => {
      const fig = document.createElement("figure");
      fig.className = "voice reveal is-visible";
      const p = document.createElement("p");
      p.textContent = `“${t.text}”`;
      const cite = document.createElement("cite");
      cite.textContent = t.city ? `${t.name} · ${t.city}` : t.name;
      fig.append(p, cite);
      linha.appendChild(fig);
    });
  }

  /* ─────────── carregamento ─────────── */
  async function carregar() {
    const carrosselOk = await carregarCarrosselDrive();

    if (!CONFIGURADO) {
      document.documentElement.dataset.cmsStatus = "nao-configurado";
      if (!carrosselOk) {
        console.info("[Aster Bela] Supabase não configurado; exibindo o conteúdo padrão do HTML.");
      }
      return;
    }
    try {
      const pedidos = [
        rest("settings?select=key,value"),
        carrosselOk
          ? Promise.resolve(null)
          : rest("photos?select=path,alt,position&active=eq.true&order=position.asc"),
        rest("testimonials?select=name,city,text,rating,featured&status=eq.approved&order=featured.desc,created_at.desc&limit=12"),
      ];
      const [settings, fotos, depoimentos] = await Promise.all(pedidos);

      const dados = Object.fromEntries(settings.map((s) => [s.key, s.value]));
      aplicarTextos(dados);
      aplicarContatos(dados.contact);
      aplicarFaixa(dados.ticker);
      aplicarHistoria(dados.story);
      if (!carrosselOk) aplicarFotos(fotos);
      aplicarDepoimentos(depoimentos);

      document.documentElement.dataset.cmsStatus = "ok";
    } catch (err) {
      document.documentElement.dataset.cmsStatus = "offline";
      console.info("[Aster Bela] Conteúdo do painel indisponível; exibindo o conteúdo padrão.", err);
    }
  }

  /* ─────────── formulário de depoimento ─────────── */
  function prepararFormulario() {
    const abrir = $("#shareOpen");
    const form = $("#shareForm");
    if (!abrir || !form) return;

    if (!CONFIGURADO) { abrir.hidden = true; return; }

    abrir.addEventListener("click", () => {
      form.hidden = false;
      abrir.hidden = true;
      $("[name=name]", form).focus();
    });

    const picker = $("#starPicker");
    const nota = $("[name=rating]", form);
    if (picker) {
      const estrelas = $$(".star", picker);
      const pintar = (v) => estrelas.forEach((s) => s.classList.toggle("is-on", Number(s.dataset.value) <= v));
      estrelas.forEach((star) => {
        star.addEventListener("click", () => { nota.value = star.dataset.value; pintar(Number(star.dataset.value)); });
        star.addEventListener("mouseenter", () => pintar(Number(star.dataset.value)));
      });
      picker.addEventListener("mouseleave", () => pintar(Number(nota.value)));
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = $("#shareMsg");
      const btn = $("#shareSubmit");
      const d = Object.fromEntries(new FormData(form));

      const mostrar = (texto, tipo) => {
        msg.textContent = texto;
        msg.className = `share__msg share__msg--${tipo}`;
        msg.hidden = false;
      };

      // Armadilha anti-robô: humanos não veem este campo.
      if (d.website?.trim()) {
        form.reset();
        return mostrar("Depoimento recebido! Ele passará por revisão.", "ok");
      }
      if (!d.name?.trim() || d.text?.trim().length < 15)
        return mostrar("Preencha seu nome e escreva ao menos 15 caracteres.", "error");

      btn.disabled = true;
      btn.textContent = "Enviando…";
      try {
        const res = await fetch(`${URL_BASE}/rest/v1/testimonials`, {
          method: "POST",
          headers: {
            apikey: KEY,
            Authorization: `Bearer ${KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            name: d.name.trim(),
            city: (d.city || "").trim(),
            text: d.text.trim(),
            rating: Number(d.rating) || 5,
          }),
        });

        if (!res.ok) {
          const erro = await res.json().catch(() => ({}));
          const texto = erro.message || "";
          if (/enviou depoimentos hoje/i.test(texto))
            throw new Error("Você já enviou depoimentos hoje. Obrigada!");
          if (/duplicate key|idx_testi_unico/i.test(texto))
            throw new Error("Este depoimento já foi enviado.");
          throw new Error("Não foi possível enviar agora. Tente novamente em instantes.");
        }

        form.reset();
        $$(".share__row, .share__field, .share__note", form).forEach((el) => (el.hidden = true));
        btn.hidden = true;
        mostrar("Depoimento recebido! Ele aparecerá no site após a nossa revisão. Obrigada 💛", "ok");
      } catch (ex) {
        mostrar(ex.message, "error");
        btn.disabled = false;
        btn.textContent = "Enviar depoimento";
      }
    });
  }

  carregar();
  prepararFormulario();
})();
