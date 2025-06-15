# Microserviço de Tradução

Este projeto é composto por dois serviços Node.js que se comunicam de forma assíncrona via RabbitMQ para realizar traduções de textos. O armazenamento do estado das traduções é feito em MongoDB.

## Estrutura do Projeto

```
api-traducao/        # API REST para submissão e consulta de traduções
traducao-worker/     # Worker responsável por processar as traduções
```

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB (Mongoose)
- RabbitMQ (mensageria)
- Swagger (documentação da API)

---

## Como Executar

### Pré-requisitos

- Node.js >= 18
- MongoDB rodando localmente (`mongodb://localhost:27017/traducao`)
- RabbitMQ rodando localmente (`amqp://localhost:5672`)
- (Opcional) Docker para subir MongoDB, RabbitMQ e API de traduções externa (libretranslate) facilmente.

### Subindo RabbitMQ com Docker

```sh
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```
Acesse o painel em [http://localhost:15672](http://localhost:15672) (usuário/senha: guest/guest).

### Subindo MongoDB com Docker

```sh
docker run -d --name mongodb -p 27017:27017 mongo
```

### Subindo API libretranslate com Docker

```sh
docker run -d --name libretranslate -p 5000:5000 libretranslate/libretranslate
```

### Configuração de Variáveis de Ambiente

Copie os arquivos `.env.example` para `.env` em cada serviço e ajuste se necessário.

#### Exemplo para `api-traducao/.env`:

```
PORT=3000
DB=mongodb://localhost:27017/traducao
RABBITMQ=amqp://localhost
```

#### Exemplo para `traducao-worker/.env`:

```
RABBITMQ=amqp://guest:guest@localhost:5672/
MAX_RETRIES=3
API_URL=http://localhost:3000
```

---

## Instalação

Em cada pasta (`api-traducao` e `traducao-worker`):

```sh
npm install
```

---

## Executando os Serviços

### 1. Inicie a API

```sh
cd api-traducao
npm start
```

Acesse a documentação Swagger em: [http://localhost:3000/swagger](http://localhost:3000/swagger)

### 2. Inicie o Worker

```sh
cd traducao-worker
npm start
```

---

## Endpoints da API

### POST `/api/translations/`

Envia um texto para tradução.

**Body:**
```json
{
  "originalText": "janela",
  "sourceLanguage": "pt",
  "targetLanguage": "en"
}
```

**Resposta:**
```json
{
  "message": "Processamento iniciado",
  "requestId": "uuid-gerado"
}
```

### GET `/api/translations/{requestId}`

Consulta o status e resultado da tradução.

**Resposta:**
```json
{
  "requestId": "uuid-gerado",
  "originalText": "janela",
  "sourceLanguage": "pt",
  "targetLanguage": "en",
  "translatedText": "window",
  "status": "completed"
}
```

---

## Funcionamento

- A API recebe requisições de tradução, gera um `requestId`, armazena no MongoDB com status `queued` e envia para a fila RabbitMQ.
- O worker consome a fila, atualiza o status para `processing`, realiza a tradução (mock ou via API externa), atualiza o status para `completed` ou `failed` e salva o resultado no MongoDB.
- O cliente pode consultar o status e resultado a qualquer momento pelo endpoint GET.

---

## Observações

- O worker possui um mini dicionário mock para traduções simples. Para usar uma API real, configure e utilize o LibreTranslate.

---

- Autor: Arthur Noronha