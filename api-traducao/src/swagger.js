import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        version: '1.0.0',
        title: 'API Tradução',
        description: 'API para tradução de textos',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Servidor local'
        }
    ],
    components: {
        schemas: {
            InternalServerError: {
                code: "",
                message: "",
            },
            TranslationRequest: {
                originalText: "Dog",
                sourceLanguage: "en",
                targetLanguage: "pt",
            },
            TranslationStatus: {
                requestId: "1234567890",
                status: "queued",
                originalText: "Janela",
                translatedText: "Window",
                sourceLanguage: "pt",
                targetLanguage: "en",
                createdAt: "2023-10-01T12:00:00Z",
                updatedAt: "2023-10-01T12:00:00Z"
            }
        }
    }
};

const outputFile = './config/swagger.json';
const endpointsFiles = ['./routes.js'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc)
    .then(async () => {
        await import('./server.js');
    });