/* ============================================================
   ASTER BELA — Interações & movimento
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  const nav = document.getElementById("nav");
  const progress = document.getElementById("scrollProgress");
  const heroMedia = document.querySelector("[data-parallax]");

  /* ---- Loop único de scroll (nav + progresso + parallax) ---- */
  let ticking = false;
  const onFrame = () => {
    const y = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;

    nav.classList.toggle("scrolled", y > 40);

    if (progress) progress.style.transform = `scaleX(${docH > 0 ? y / docH : 0})`;

    if (heroMedia && !prefersReduced) {
      heroMedia.style.transform = `translateY(${Math.min(y, window.innerHeight) * 0.18}px)`;
    }
    ticking = false;
  };
  const requestFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } };
  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", requestFrame, { passive: true });
  onFrame();

  /* ---- Menu mobile ---- */
  const burger = document.getElementById("burger");
  const links = document.getElementById("navLinks");
  const setMenu = (open) => {
    links.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!links.classList.contains("open")));
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---- Cascata (stagger): índice nos filhos reveláveis ---- */
  [".feats", ".voices__row"].forEach((sel) => {
    const container = document.querySelector(sel);
    if (!container) return;
    container.querySelectorAll("[data-reveal]").forEach((el, i) => el.style.setProperty("--i", i));
  });

  /* ---- Mosaico infinito: duplica cada faixa p/ loop sem emenda ---- */
  function buildMarqueeLoop() {
    if (prefersReduced) return;
    document.querySelectorAll(".look__track").forEach((track) => {
      // Remove clones anteriores (o conteúdo pode ter vindo do painel).
      track.querySelectorAll('[data-clone="true"]').forEach((n) => n.remove());
      [...track.children].forEach((node) => {
        const clone = node.cloneNode(true);
        clone.dataset.clone = "true";
        clone.setAttribute("aria-hidden", "true");
        clone.tabIndex = -1;
        track.appendChild(clone);
      });
    });
  }
  buildMarqueeLoop();

  // O painel trocou as fotos: refaz o loop com o conteúdo novo.
  document.addEventListener("aster:photos-updated", buildMarqueeLoop);

  /* ---- Reveal ao entrar na viewport (com failsafe) ---- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));

    // Failsafe: revela o que estiver visível caso o observer não dispare.
    window.addEventListener("load", () => {
      setTimeout(() => {
        revealEls.forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight * 1.1) el.classList.add("is-visible");
        });
      }, 900);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---- Botões magnéticos (desktop, sem reduced-motion) ---- */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll(".btn").forEach((btn) => {
      const strength = 0.28;
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * strength}px, ${my * strength - 3}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---- Lightbox da galeria (mosaico) ---- */
  const marquee = document.getElementById("lookMarquee");
  if (marquee) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = '<button class="lightbox__close" aria-label="Fechar">&times;</button><img alt="" />';
    document.body.appendChild(box);
    const boxImg = box.querySelector("img");

    const open = (img) => {
      // versão em alta resolução (troca o parâmetro de largura da URL)
      boxImg.src = (img.currentSrc || img.src).replace(/w=\d+/, "w=1400");
      boxImg.alt = img.alt || "";
      box.classList.add("open"); box.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      box.classList.remove("open"); box.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    marquee.addEventListener("click", (e) => {
      const cell = e.target.closest(".look__cell");
      if (cell) open(cell.querySelector("img"));
    });
    marquee.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const cell = e.target.closest(".look__cell");
      if (cell) { e.preventDefault(); open(cell.querySelector("img")); }
    });
    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ---- Ano dinâmico no rodapé ---- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
