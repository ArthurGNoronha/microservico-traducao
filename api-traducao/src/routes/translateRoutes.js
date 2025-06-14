import { Router } from 'express';

import {
    getTranslation,
    createTranslation,
    patchTranslation
} from '../controllers/translateController.js';

const router = Router();

router.post('/', createTranslation);
router.get('/:requestId', getTranslation);
router.patch('/:requestId', patchTranslation);

export default router;