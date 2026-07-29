import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { UsersRepository } from '../users/users.repository.js';
import { validateSchema } from '../../shared/middlewares/validateSchema.middleware.js';
import { loginSchema } from './auth.schema.js';
import { createUserSchema } from '../users/users.schema.js';

const usersRepository = new UsersRepository();
const authService = new AuthService(usersRepository);
const usersService = new UsersService(usersRepository);
const authController = new AuthController(authService, usersService);

const router = Router();

/**
 * @route POST /api/v1/auth/login
 * @desc Iniciar sesión y obtener JWT
 */
router.post('/login', validateSchema(loginSchema), authController.login);

/**
 * @route POST /api/v1/auth/register
 * @desc Registrar cuenta de cliente nuevo
 */
router.post('/register', validateSchema(createUserSchema), authController.register);

export default router;
