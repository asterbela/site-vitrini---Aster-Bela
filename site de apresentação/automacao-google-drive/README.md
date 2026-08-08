# Carrossel automático — Google Drive

Esta automação roda **dentro do Google Drive** e alimenta o mosaico infinito
(Lookbook) do site. **Somente as imagens que estiverem na pasta configurada**
aparecem no carrossel — quantas fotos você colocar, quantas o site exibe.

---

## Passo a passo

### 1. Criar a pasta no Drive

1. No Google Drive, crie uma pasta, por exemplo: **`Carrossel Loja Aster Bela`**
2. Coloque dentro **somente** as fotos que devem aparecer no site
3. Abra a pasta e copie o **ID** da URL:
   ```
   https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz
                                         └────────── este trecho ──────────┘
   ```

### 2. Criar o projeto Apps Script

1. Acesse [script.google.com](https://script.google.com) → **Novo projeto**
2. Apague o código padrão e cole o conteúdo de **`Code.gs`** desta pasta
3. No topo do arquivo, troque `COLE-AQUI-O-ID-DA-PASTA` pelo ID copiado
4. Salve o projeto (nome sugerido: `Aster Bela — Carrossel`)

### 3. Primeira sincronização

1. No editor, selecione a função **`sincronizarCarrossel`** e clique em **Executar**
2. Autorize o acesso ao Drive quando o Google pedir
3. Isso vai:
   - listar todas as imagens da pasta
   - tornar cada uma visível por link
   - gerar o arquivo **`carrossel-loja.json`** dentro da mesma pasta

### 4. Publicar o endpoint (Web App)

1. **Implantar** → **Nova implantação**
2. Tipo: **Aplicativo da Web**
3. Executar como: **Eu**
4. Quem tem acesso: **Qualquer pessoa**
5. Copie a **URL do aplicativo da Web** (termina em `/exec`)

### 5. Conectar o site

Abra o **`config.js`** na raiz do site e preencha:

```js
GOOGLE_DRIVE: {
  WEBAPP_URL: "https://script.google.com/macros/s/SEU-ID/exec",
},
```

Salve, publique o site e recarregue a página. O Lookbook passará a usar
automaticamente as fotos da pasta.

### 6. Automação contínua (recomendado)

Execute **uma vez** a função **`instalarGatilhoHorario`**. Ela agenda a
sincronização a cada hora — útil quando você adiciona ou remove fotos sem
abrir o script manualmente.

---

## Como atualizar as fotos do carrossel

| Ação | O que fazer |
|------|-------------|
| **Adicionar foto** | Envie a imagem para a pasta do Drive |
| **Remover foto** | Apague da pasta |
| **Trocar ordem** | Renomeie os arquivos (ordem alfabética) |
| **Foto larga no mosaico** | Inclua `wide`, `larga`, `banner` ou `paisagem` no nome |

Depois da alteração, aguarde o gatilho horário **ou** rode `sincronizarCarrossel`
manualmente. Na próxima visita ao site, o carrossel reflete a pasta.

---

## Dicas

- Formatos aceitos: JPG, PNG, WebP, GIF e demais `image/*`
- O arquivo `carrossel-loja.json` é gerado pela automação — não edite à mão
- Se o carrossel não atualizar, confira se a URL do Web App está correta no `config.js`
- Textos, contatos e depoimentos continuam vindo do Supabase; só o Lookbook usa o Drive
