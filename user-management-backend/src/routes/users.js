import express from 'express';
import * as userController from '../controllers/userController.js';
import { validate } from '../validations/validationMiddleware.js';
import { createUserSchema, updateUserSchema } from '../validations/userValidation.js';

const router = express.Router();

// Apply validation middleware
router
  .route('/')
  .post(validate(createUserSchema), userController.createUser)
  .get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUserById)
  .put(validate(updateUserSchema), userController.updateUser)
  .delete(userController.deleteUser);

export default router;