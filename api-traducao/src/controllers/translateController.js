import { v4 as uuidv4 } from 'uuid';
import Translation from '../models/translation.js';
import publishTranslation from '../service/translationQueue.js';

export const createTranslation = async (req, res, next) => {
  /*
  #swagger.tags = ['Tradução']
  #swagger.requestBody = {
    required: true,
    schema: { $ref: '#/components/schemas/TranslationRequest' }
  }
  #swagger.responses[200]
  */

  try {
    const { originalText, sourceLanguage, targetLanguage } = req.body;
    if (!originalText || !sourceLanguage || !targetLanguage) {
      return res.payment_required({ error: 'Campos obrigatórios ausentes.' });
    }

    const requestId = uuidv4();

    await Translation.create({
      requestId,
      originalText,
      sourceLanguage,
      targetLanguage,
      status: 'queued'
    });

    await publishTranslation({
      requestId,
      originalText,
      sourceLanguage,
      targetLanguage
    });

    res.ok({
      message: 'Processamento iniciado',
      requestId
    });
  } catch (err) {
    next(err);
  }
};

export const getTranslation = async (req, res, next) => {
  /*
  #swagger.tags = ['Tradução']
  #swagger.responses[200]
  */
  try {
    const { requestId } = req.params;
    const translation = await Translation.findOne({ requestId });

    if (!translation) {
      return res.not_found();
    }

    res.ok({
      requestId: translation.requestId,
      originalText: translation.originalText,
      sourceLanguage: translation.sourceLanguage,
      targetLanguage: translation.targetLanguage,
      translatedText: translation.translatedText,
      status: translation.status,
    });
  } catch (err) {
    next(err);
  }
};

export const patchTranslation = async (req, res, next) => {
  /*
  #swagger.tags = ['Tradução']
  #swagger.responses[200]
  */
  try {
    const { requestId } = req.params;
    const { translatedText, status } = req.body;

    const translation = await Translation.findOneAndUpdate(
      { requestId },
      { translatedText, status },
      { new: true }
    );

    if (!translation) {
      return res.not_found();
    }

    res.ok({
      message: 'Tradução atualizada',
      translation
    });
  } catch (err) {
    next(err);
  }
}