import { Router } from 'express';

import translateRoutes from './routes/translateRoutes.js';

const routes = Router();
routes.use('/api/translations', translateRoutes);

export default routes;