import { Router } from 'express';
import { citasController } from './citas.controller.js';
import { validateSchema } from '../../shared/middlewares/validateSchema.middleware.js';
import { createCitaSchema, updateCitaSchema } from './citas.schema.js';
import { authenticateJWT } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', validateSchema(createCitaSchema), citasController.create.bind(citasController));
router.get('/', citasController.getAll.bind(citasController));
router.patch('/:id', validateSchema(updateCitaSchema), citasController.update.bind(citasController));
router.delete('/:id', citasController.delete.bind(citasController));

export default router;
