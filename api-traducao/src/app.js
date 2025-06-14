import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './config/swagger.json' with { type: 'json' };

import db from './config/db.js';
import routes from './routes.js';

import handlers from './routes/handlers.js';

dotenv.config();
db.config(process.env.DB);

const app = express();

app.use(compression());
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(handlers);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(routes);

export default app;