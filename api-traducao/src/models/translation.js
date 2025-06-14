import mongoose from 'mongoose';

const TranslationSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  originalText: {
    type: String,
    required: true
  },
  translatedText: {
    type: String
  },
  sourceLanguage: {
    type: String,
    required: true
  },
  targetLanguage: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued'
  }
}, {
  versionKey: false,
  timestamps: true
});

const Translation = mongoose.model('Translation', TranslationSchema);

export default Translation;