/**
 * Aster Bela — Carrossel automático via Google Drive
 *
 * Coloque as fotos da loja na pasta configurada abaixo.
 * Somente imagens dessa pasta entram no carrossel do site.
 * Adicionou ou removeu uma foto? O site reflete na próxima visita
 * (ou no intervalo do gatilho automático, se ativado).
 */

/** ID da pasta do Drive — troque pelo seu (está na URL ao abrir a pasta). */
const PASTA_CARROSSEL_ID = "COLE-AQUI-O-ID-DA-PASTA";

/** Nome do arquivo JSON publicado na mesma pasta (cache para o site). */
const ARQUIVO_JSON = "carrossel-loja.json";

/**
 * Endpoint público do Apps Script (Implantar → Aplicativo da Web).
 * Retorna a lista atual de fotos da pasta.
 */
function doGet() {
  const fotos = listarFotosDaPasta_();
  return respostaJson_({
    ok: true,
    fonte: "google-drive",
    pasta_id: PASTA_CARROSSEL_ID,
    atualizado_em: new Date().toISOString(),
    total: fotos.length,
    fotos: fotos,
  });
}

/**
 * Rode uma vez (ou deixe o gatilho horário fazer): atualiza o JSON na pasta
 * e garante que cada imagem esteja visível por link.
 */
function sincronizarCarrossel() {
  if (!PASTA_CARROSSEL_ID || PASTA_CARROSSEL_ID.includes("COLE-AQUI")) {
    throw new Error("Configure PASTA_CARROSSEL_ID no início do Code.gs");
  }

  const fotos = listarFotosDaPasta_();
  garantirCompartilhamento_(fotos);
  publicarJsonNaPasta_(fotos);

  Logger.log("Carrossel sincronizado: " + fotos.length + " foto(s).");
  return fotos.length;
}

/** Cria o gatilho que roda a sincronização a cada hora. Execute só uma vez. */
function instalarGatilhoHorario() {
  removerGatilhos_("sincronizarCarrossel");
  ScriptApp.newTrigger("sincronizarCarrossel")
    .timeBased()
    .everyHours(1)
    .create();
  Logger.log("Gatilho horário instalado.");
}

/** Remove gatilhos desta função (útil ao reinstalar). */
function removerGatilhos_(nomeFuncao) {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === nomeFuncao) ScriptApp.deleteTrigger(t);
  });
}

/** Lista imagens da pasta, ordenadas pelo nome do arquivo. */
function listarFotosDaPasta_() {
  const pasta = DriveApp.getFolderById(PASTA_CARROSSEL_ID);
  const arquivos = pasta.getFiles();
  const fotos = [];

  while (arquivos.hasNext()) {
    const arquivo = arquivos.next();
    const mime = arquivo.getMimeType();

    if (!mime || mime.indexOf("image/") !== 0) continue;
    if (arquivo.getName() === ARQUIVO_JSON) continue;

    const id = arquivo.getId();
    fotos.push({
      id: id,
      nome: arquivo.getName(),
      path: urlImagem_(id),
      alt: legendaDaFoto_(arquivo.getName()),
      larga: /wide|larga|banner|paisagem/i.test(arquivo.getName()),
    });
  }

  fotos.sort(function (a, b) {
    return a.nome.localeCompare(b.nome, "pt-BR", { numeric: true, sensitivity: "base" });
  });

  return fotos;
}

/** URL estável para exibir a imagem no site (pasta precisa permitir visualização). */
function urlImagem_(fileId) {
  return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1200";
}

/** Gera texto alternativo a partir do nome do arquivo. */
function legendaDaFoto_(nome) {
  return nome
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Garante "Qualquer pessoa com o link" em cada imagem da pasta. */
function garantirCompartilhamento_(fotos) {
  fotos.forEach(function (foto) {
    try {
      const arquivo = DriveApp.getFileById(foto.id);
      arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (err) {
      Logger.log("Não foi possível compartilhar " + foto.nome + ": " + err);
    }
  });
}

/** Grava/atualiza o JSON público dentro da pasta do carrossel. */
function publicarJsonNaPasta_(fotos) {
  const pasta = DriveApp.getFolderById(PASTA_CARROSSEL_ID);
  const conteudo = JSON.stringify(
    {
      ok: true,
      fonte: "google-drive",
      pasta_id: PASTA_CARROSSEL_ID,
      atualizado_em: new Date().toISOString(),
      total: fotos.length,
      fotos: fotos,
    },
    null,
    2
  );

  const existentes = pasta.getFilesByName(ARQUIVO_JSON);
  let arquivo;

  if (existentes.hasNext()) {
    arquivo = existentes.next();
    arquivo.setContent(conteudo);
  } else {
    arquivo = pasta.createFile(ARQUIVO_JSON, conteudo, MimeType.PLAIN_TEXT);
  }

  arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
}

function respostaJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
