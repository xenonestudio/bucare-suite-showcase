import { Router } from 'express';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { UserRepository } from './user.repository.js';

const router = Router();

// Inyección de dependencias manual (Composition Root de este módulo)
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Rutas
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);

export const userRoutes = router;
