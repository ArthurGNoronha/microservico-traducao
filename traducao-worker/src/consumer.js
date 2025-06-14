import dotenv from "dotenv";
import connection from "./services/connection.js";
import axios from "axios";

dotenv.config();

const queue = "translations";
const exchange = "translations_exchange";
const routingKey = "translation";

function mockTranslate(text, source, target) {
  // Simular um erro descomentando a linha abaixo:
  // throw new Error("Erro simulado!");

  return `[${source} -> ${target}] [${text} -> traduzido]`;
}

async function processTranslation(msg) {
  const { requestId, originalText, sourceLanguage, targetLanguage } = msg;

  try {
    await axios.patch(
      `${process.env.API_URL || "http://localhost:3000"}/api/translations/${requestId}`,
      { status: "processing" }
    );

    // Simular um delay de processamento para verificar o status "processing" descomentando a linha abaixo:
    // await new Promise(resolve => setTimeout(resolve, 10000));
  } catch (err) {
    console.error(`Erro ao marcar como processing: ${err.message}`);
    return;
  }

  try {
    const translatedText = mockTranslate(originalText, sourceLanguage, targetLanguage);

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