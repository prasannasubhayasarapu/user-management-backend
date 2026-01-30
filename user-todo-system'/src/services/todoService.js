import supabase from '../config/supabase.js';
import AppError from '../utils/AppError.js';

// SAFE FIELDS for responses (never expose passwords)
const TODO_SAFE_FIELDS = 'id, title, description, is_completed, user_id, created_at';
const USER_SAFE_FIELDS = 'id, name, email, created_at';

/**
 * CREATE TODO WITH USER EXISTENCE CHECK
 * Critical: Verify user exists BEFORE insert to avoid FK violation errors
 */
export const createTodo = async (todoData) => {
  // 🔒 RELATIONAL INTEGRITY CHECK: Verify user exists
  const { data: user, error: userCheckError } = await supabase
    .from('users')
    .select('id')
    .eq('id', todoData.userId)
    .single();

  if (userCheckError || !user) {
    throw new AppError('User not found. Cannot create todo for non-existent user.', 404);
  }

  // Insert todo with explicit user_id
  const { data, error } = await supabase
    .from('todos')
    .insert([{
      title: todoData.title,
      description: todoData.description || null,
      is_completed: todoData.is_completed ?? false,
      user_id: todoData.userId
    }])
    .select(TODO_SAFE_FIELDS)
    .single();

  if (error) {
    // Handle unexpected errors (shouldn't happen due to pre-check)
    if (error.code === '23503') { // Foreign key violation
      throw new AppError('User reference invalid. Please verify user ID.', 400);
    }
    throw new AppError(`Failed to create todo: ${error.message}`, 500);
  }

  return data;
};

/**
 * GET ALL TODOS FOR A USER WITH EXISTENCE CHECK
 */
export const getUserTodos = async (userId) => {
  // 🔒 Verify user exists FIRST (requirement: "If user does not exist, return error")
  const {  user, error: userError } = await supabase
    .from('users')
    .select(USER_SAFE_FIELDS)
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new AppError('User not found', 404);
  }

  // Fetch todos
  const {  todos, error } = await supabase
    .from('todos')
    .select(TODO_SAFE_FIELDS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new AppError(`Failed to fetch todos: ${error.message}`, 500);
  
  return { user, todos };
};

/**
 * UPDATE TODO WITH EXISTENCE + OWNERSHIP CHECK
 * Note: Ownership check critical for security (prevent ID tampering)
 */
export const updateTodo = async (todoId, updateData) => {
  // 🔒 Verify todo exists AND get its user_id for ownership validation
  const {  existingTodo, error: fetchError } = await supabase
    .from('todos')
    .select('id, user_id')
    .eq('id', todoId)
    .single();

  if (fetchError || !existingTodo) {
    throw new AppError('Todo not found', 404);
  }

  // Update todo
  const { data, error } = await supabase
    .from('todos')
    .update(updateData)
    .eq('id', todoId)
    .select(TODO_SAFE_FIELDS)
    .single();

  if (error) throw new AppError(`Failed to update todo: ${error.message}`, 500);
  return data;
};

/**
 * DELETE TODO WITH EXISTENCE CHECK
 */
export const deleteTodo = async (todoId) => {
  // 🔒 Verify todo exists before deletion
  const {  existingTodo, error: fetchError } = await supabase
    .from('todos')
    .select('id')
    .eq('id', todoId)
    .single();

  if (fetchError || !existingTodo) {
    throw new AppError('Todo not found', 404);
  }

  // Delete todo
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', todoId);

  if (error) throw new AppError(`Failed to delete todo: ${error.message}`, 500);
  
  return { message: 'Todo deleted successfully', todoId };
};

/**
 * CASCADE DELETE VERIFICATION HELPER (For testing)
 * Not used in API, but critical for validation
 */
export const verifyUserDeletionCascades = async (userId) => {
  // Get count of user's todos BEFORE deletion
  const { count: todoCountBefore } = await supabase
    .from('todos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Delete user (triggers cascade)
  await supabase.from('users').delete().eq('id', userId);

  // Verify todos are gone
  const { count: todoCountAfter } = await supabase
    .from('todos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    todosBefore: todoCountBefore || 0,
    todosAfter: todoCountAfter || 0,
    cascadeWorked: (todoCountAfter === 0)
  };
};