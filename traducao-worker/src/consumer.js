import dotenv from "dotenv";
import connection from "./services/connection.js";
import axios from "axios";

dotenv.config();

const queue = "translations";
const exchange = "translations_exchange";
const routingKey = "translation";

const miniDictionary = {
  "pt-en": {
    "janela": "window",
    "porta": "door",
    "livro": "book",
    "cachorro": "dog",
    "gato": "cat",
    "carro": "car",
    "casa": "house",
    "mesa": "table",
    "cadeira": "chair",
    "sol": "sun"
  },
  "en-pt": {
    "window": "janela",
    "door": "porta",
    "book": "livro",
    "dog": "cachorro",
    "cat": "gato",
    "car": "carro",
    "house": "casa",
    "table": "mesa",
    "chair": "cadeira",
    "sun": "sol"
  }
};

async function mockendTranslation(text, source, target) {
  // Simular um erro para testar o status "failed"
  // throw new Error("Erro simulado");

  const key = `${source}-${target}`;
  const dict = miniDictionary[key];
  if (!dict) return `[${source}->${target}] ${text} (mock)`;
  const translated = dict[text.toLowerCase()];
  return translated ? translated : `[${source}->${target}] ${text} (mock)`;
}

async function libreTranslate(text, source, target) {
  try {
    const response = await axios.post("http://localhost:5000/translate", {
      q: text,
      source,
      target,
      format: "text"
    });
    return response.data.translatedText;
  } catch (err) {
    if (err.response) {
      console.error("Erro da API LibreTranslate:", err.response.data);
    }
    throw err;
  }
}

async function processTranslation(msg) {
  const { requestId, originalText, sourceLanguage, targetLanguage } = msg;

  try {
    await axios.patch(
      `${process.env.API_URL || "http://localhost:3000"}/api/translations/${requestId}`,
      { status: "processing" }
    );

    // Simular um delay de processamento para verificar o status "processing"
    // await new Promise(resolve => setTimeout(resolve, 10000));
  } catch (err) {
    console.error(`Erro ao marcar como processing: ${err.message}`);
    return;
  }

  try {
    const translatedText = await mockendTranslation(originalText, sourceLanguage, targetLanguage);
    // Caso queira usar a API LibreTranslate (Rode o servidor via Docker utilizando: 
    // docker run -d -p 5000:5000 libretranslate/libretranslate:latest)
    // const translatedText = await libreTranslate(originalText, sourceLanguage, targetLanguage);

    await axios.patch(
      `${process.env.API_URL || "http://localhost:3000"}/api/translations/${requestId}`,
      {
        translatedText,
        status: "completed"
      }
    );
  } catch (err) {
    await axios.patch(
      `${process.env.API_URL || "http://localhost:3000"}/api/translations/${requestId}`,
      { status: "failed" }
    );
    console.error(`Erro ao traduzir requestId: ${requestId}`, err.message);
  }
}

connection(queue, exchange, routingKey, processTranslation);