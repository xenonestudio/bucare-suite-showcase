import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';
import { validateSchema } from '../../shared/middlewares/validateSchema.middleware.js';
import { createUserSchema, getUserByIdSchema, updateUserSchema } from './users.schema.js';

const usersRepository = new UsersRepository();
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);

const router = Router();

/**
 * @route POST /api/v1/users
 * @desc Registrar un nuevo usuario (Superadmin, Administrador, Contabilidad, Ventas, Proyecto, Usuario)
 */
router.post('/', validateSchema(createUserSchema), usersController.createUser);

/**
 * @route GET /api/v1/users
 * @desc Listar todos los usuarios o filtrar por ?role=
 */
router.get('/', usersController.getAllUsers);

/**
 * @route GET /api/v1/users/:id
 * @desc Obtener detalle de usuario por ID
 */
router.get('/:id', validateSchema(getUserByIdSchema), usersController.getUserById);

/**
 * @route PATCH /api/v1/users/:id
 * @desc Actualizar datos de usuario por ID
 */
router.patch('/:id', validateSchema(updateUserSchema), usersController.updateUser);

export default router;
