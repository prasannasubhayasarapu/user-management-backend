import * as todoService from '../services/todoService.js';
import AppError from '../utils/AppError.js';

export const createTodo = async (req, res, next) => {
  try {
    const newTodo = await todoService.createTodo(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Todo created successfully',
      data: newTodo
    });
  } catch (err) {
    next(err);
  }
};

export const getUserTodos = async (req, res, next) => {
  try {
    const { user, todos } = await todoService.getUserTodos(req.params.userId);
    res.status(200).json({
      status: 'success',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      todosCount: todos.length,
      todos
    });
  } catch (err) {
    next(err);
  }
};

export const updateTodo = async (req, res, next) => {
  try {
    // Prevent user_id tampering in update
    if (req.body.user_id || req.body.userId) {
      return next(new AppError('Cannot modify todo ownership', 400));
    }
    
    const updatedTodo = await todoService.updateTodo(req.params.todoId, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Todo updated successfully',
       updatedTodo
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTodo = async (req, res, next) => {
  try {
    const result = await todoService.deleteTodo(req.params.todoId);
    res.status(200).json({
      status: 'success',
      ...result
    });
  } catch (err) {
    next(err);
  }
};