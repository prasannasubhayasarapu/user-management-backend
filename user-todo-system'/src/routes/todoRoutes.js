import express from 'express';
import * as todoController from '../controllers/todoController.js';
import { validate } from '../validations/validationMiddleware.js';
import { 
  createTodoSchema, 
  updateTodoSchema,
  idParamSchema 
} from '../validations/todoValidation.js';

const router = express.Router();

// Apply ID validation to all routes with :id params
router.param('userId', (req, res, next, id) => {
  const { error } = idParamSchema.validate({ id });
  if (error) return next(new AppError(error.details[0].message, 400));
  req.params.userId = id;
  next();
});

router.param('todoId', (req, res, next, id) => {
  const { error } = idParamSchema.validate({ id });
  if (error) return next(new AppError(error.details[0].message, 400));
  req.params.todoId = id;
  next();
});

// Todo routes
router
  .route('/add-todo')
  .post(validate(createTodoSchema), todoController.createTodo);

router
  .route('/get-my-todo/:userId')
  .get(todoController.getUserTodos);

router
  .route('/update-todo/:todoId')
  .put(validate(updateTodoSchema), todoController.updateTodo);

router
  .route('/delete-todo/:todoId')
  .delete(todoController.deleteTodo);

export default router;