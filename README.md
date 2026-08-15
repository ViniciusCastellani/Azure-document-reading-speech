# ai900-proxy-gateway

Backend gateway para facilitar o consumo dos recursos de IA da Microsoft (Azure AI Vision, Azure AI Speech) utilizados na trilha **AI-900** (Microsoft Azure AI Fundamentals).

## Como funciona

Cada aluno cria seu próprio recurso no Azure Portal (Vision e/ou Speech) e roda uma instância local deste backend apontando para o seu endpoint e API key. O serviço expõe rotas REST simples que repassam as chamadas para os endpoints REST do Azure usando `axios` puro — sem SDKs oficiais — para que o funcionamento das requisições HTTP fique visível e didático.

Esse backend não tem interface. A ideia é que você (ou uma IA, a partir da documentação abaixo) construa um frontend simples que consuma essas rotas.

## Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- Pelo menos um recurso criado no [Azure Portal](https://portal.azure.com/):
  - **Azure AI Vision** (para o endpoint de leitura de documentos)
  - **Azure AI Speech** (para os endpoints de fala)

## Configuração

1. Clone o repositório
2. `npm install`
3. Copie `.env.example` para `.env`
4. Preencha o `.env` com os dados do(s) recurso(s) que você criou (veja a tabela abaixo)
5. `npm run dev` (ou `npm start`)

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

### Variáveis de ambiente

No Portal Azure, dentro do seu recurso, vá em **"Chaves e Ponto de Extremidade"** para encontrar os valores de endpoint, chave e região.

| Variável | Para que serve | Onde encontrar |
|---|---|---|
| `PORT` | Porta em que o servidor local vai rodar | Você escolhe (padrão `3000`) |
| `VISION_ENDPOINT` | Endpoint do recurso Vision | Campo "Ponto de extremidade" do recurso Vision |
| `VISION_KEY` | Chave do recurso Vision | Campo "CHAVE 1" do recurso Vision |
| `SPEECH_ENDPOINT` | Endpoint do recurso Speech | Campo "Ponto de extremidade" do recurso Speech |
| `SPEECH_KEY` | Chave do recurso Speech | Campo "CHAVE 1" do recurso Speech |
| `SPEECH_REGION` | Região do recurso Speech (ex: `eastus`, `brazilsouth`) | Campo "Local/Região" do recurso Speech |

> Nem todas as regiões suportam todos os serviços (por exemplo, o Fast Transcription não está disponível em todas as regiões). Se receber um erro de "not supported in this region", crie o recurso Speech em outra região.

## Endpoints disponíveis

Todas as rotas ficam sob o prefixo `/api`. Erros sempre voltam no formato `{ "error": "mensagem" }` com o status HTTP correspondente.

### Health check

```
GET /api/health
```

Resposta: `{ "status": "ok" }`. Use para confirmar que o servidor está no ar.

### Vision — Leitura de documentos (OCR)

Extrai texto e layout de um documento (PDF ou imagem) usando o Azure AI Document Intelligence.

```
POST /api/vision/document-intelligence
Content-Type: multipart/form-data
```

| Campo (form-data) | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `file` | arquivo | sim | PDF ou imagem a ser analisada |

**Resposta (200):** JSON com o resultado da análise, incluindo `analyzeResult.content` (texto extraído do documento).

Essa chamada pode levar de 10 a 20 segundos para responder — o backend faz o polling do resultado internamente, então basta aguardar.

Exemplo com `curl`:
```bash
curl -X POST http://localhost:3000/api/vision/document-intelligence \
  -F "file=@caminho/para/documento.pdf"
```

### Speech — Áudio para texto (transcrição)

Transcreve um arquivo de áudio para texto.

```
POST /api/speech/fast-transcription
Content-Type: multipart/form-data
```

| Campo (form-data) | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `audio` | arquivo | sim | Áudio a ser transcrito (wav, mp3, ogg, flac, etc.) |
| `locales` | texto | não | Idioma(s) esperado(s), separados por vírgula (ex: `pt-BR` ou `pt-BR,en-US`). Padrão: `pt-BR` |

**Resposta (200):** JSON com `durationMilliseconds`, `combinedPhrases` (texto completo transcrito) e `phrases` (trechos com timestamps).

Exemplo com `curl`:
```bash
curl -X POST http://localhost:3000/api/speech/fast-transcription \
  -F "audio=@caminho/para/audio.wav" \
  -F "locales=pt-BR"
```

### Speech — Texto para áudio

Converte um texto em um arquivo de áudio (mp3) falado.

```
POST /api/speech/text-to-speech
Content-Type: application/json
```

| Campo (JSON) | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `text` | string | sim | Texto a ser convertido em fala |
| `locale` | string | não | Idioma da voz (ex: `pt-BR`). Padrão: `pt-BR` |
| `voice` | string | não | Nome da voz (ex: `pt-BR-FranciscaNeural`). Padrão: `pt-BR-FranciscaNeural` |
| `outputFormat` | string | não | Formato de saída do áudio. Padrão: `audio-16khz-128kbitrate-mono-mp3` |

**Resposta (200):** arquivo de áudio binário (`Content-Type: audio/mpeg`) — não é JSON.

Exemplo com `curl` (salva o áudio em `saida.mp3`):
```bash
curl -X POST http://localhost:3000/api/speech/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{"text":"Olá, mundo!"}' \
  --output saida.mp3
```

## Construindo um frontend com IA

Este README foi escrito para ser usado como contexto de um prompt. Você pode colar o conteúdo da seção **"Endpoints disponíveis"** para uma IA (ChatGPT, Claude, etc.) e pedir algo como:

> "Crie uma página HTML/JS simples que consome os endpoints `POST /api/vision/document-intelligence`, `POST /api/speech/fast-transcription` e `POST /api/speech/text-to-speech` descritos abaixo, rodando em `http://localhost:3000`."

E colar as tabelas de cada endpoint. Isso é suficiente para a IA gerar os formulários de upload e as chamadas `fetch` corretas.

## Estrutura

```
src/
  routes/       -> rotas Express (/api/vision, /api/speech)
  services/     -> chamadas HTTP (axios) para as APIs REST do Azure
  middlewares/  -> tratamento de erros
server.js       -> ponto de entrada (Express, dotenv, cors)
```

## Status

Endpoints implementados:
- Vision: leitura de documentos (`document-intelligence`)
- Speech: transcrição de áudio (`fast-transcription`) e conversão de texto em fala (`text-to-speech`)
