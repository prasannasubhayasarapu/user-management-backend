import { supabase } from '../config/supabase.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// CREATE - Only use userId from JWT, NEVER from request body
export const createTodo = asyncHandler(async (req, res, next) => {
  const { title, completed = false } = req.body;
  
  if (!title || title.trim().length === 0) {
    return next(new AppError('Todo title is required', 400));
  }
  
  // Critical: Use ONLY userId from authenticated session
  const {  newTodo, error } = await supabase
    .from('todos')
    .insert([
      {
        title: title.trim(),
        completed,
        user_id: req.user.id // NEVER trust client-provided userId
      }
    ])
    .select('id, title, completed, created_at')
    .single();
  
  if (error) {
    if (error.code === '23503') { // Foreign key violation
      return next(new AppError('Invalid user reference', 400));
    }
    throw error;
  }
  
  res.status(201).json({
    status: 'success',
    data: { todo: newTodo }
  });
});

// GET - Only todos belonging to authenticated user
export const getTodos = asyncHandler(async (req, res, next) => {
  const {  todos, error } = await supabase
    .from('todos')
    .select('id, title, completed, created_at')
    .eq('user_id', req.user.id) // Enforce ownership at query level
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  res.status(200).json({
    status: 'success',
    results: todos.length,
    data: { todos }
  });
});

// UPDATE - Verify ownership BEFORE update
export const updateTodo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  
  // Validate input
  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    return next(new AppError('Title must be a non-empty string', 400));
  }
  
  if (completed !== undefined && typeof completed !== 'boolean') {
    return next(new AppError('Completed must be a boolean value', 400));
  }
  
  // Critical: Verify ownership in the UPDATE query itself
  const {  updatedTodo, error } = await supabase
    .from('todos')
    .update({
      ...(title && { title: title.trim() }),
      ...(completed !== undefined && { completed })
    })
    .eq('id', id)
    .eq('user_id', req.user.id) // Prevent updating others' todos
    .select('id, title, completed, created_at')
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // No rows updated
      return next(new AppError('Todo not found or access denied', 404));
    }
    throw error;
  }
  
  if (!updatedTodo) {
    return next(new AppError('Todo not found or access denied', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { todo: updatedTodo }
  });
});

// DELETE - Verify ownership BEFORE delete
export const deleteTodo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  // Critical: Verify ownership in the DELETE query
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.id); // Prevent deleting others' todos
  
  if (error) {
    if (error.code === 'PGRST116') { // No rows deleted
      return next(new AppError('Todo not found or access denied', 404));
    }
    throw error;
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});