/* ============================================================
   ASTER BELA — conexão do SITE com o Supabase
   ------------------------------------------------------------
   Preencha com os dados do seu projeto:
     Supabase → Project Settings → API
       • Project URL   → SUPABASE_URL
       • anon / public → SUPABASE_ANON_KEY

   ⚠️  Somente a chave "anon / public". A "service_role" jamais entra
       aqui — ela ignora todas as regras de segurança.

   Enquanto não preencher, o site funciona normalmente com o conteúdo
   que já está no HTML. Nada quebra.
   ============================================================ */

window.ASTER_CONFIG = {
  SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
  SUPABASE_ANON_KEY: "COLE-AQUI-A-CHAVE-ANON",
  BUCKET: "fotos",

  /* Carrossel do Lookbook — Google Drive
     Preencha WEBAPP_URL com a URL do Apps Script (Implantar → Aplicativo da Web).
     Somente imagens da pasta configurada no script entram no carrossel.
     Veja automacao-google-drive/README.md */
  GOOGLE_DRIVE: {
    WEBAPP_URL: "",
  },
};
