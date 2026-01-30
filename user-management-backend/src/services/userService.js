import supabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import AppError from '../utils/AppError.js';
import { MIN_PASSWORD_LENGTH } from '../utils/constants.js';

// Fields to exclude from responses
const SAFE_FIELDS = 'id, name, email, age, role, created_at, updated_at';

/**
 * Hash password with salt
 */
const hashPassword = async (password) => {
  if (!password) return null;
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  return bcrypt.hash(password, saltRounds);
};

/**
 * Create new user
 */
export const createUser = async (userData) => {
  // Hash password before storage
  const hashedPassword = await hashPassword(userData.password);
  
  // Prepare insert data (exclude password from response)
  const insertData = {
    ...userData,
    password: hashedPassword,
    role: userData.role || 'user'
  };

  const { data, error } = await supabase
    .from('users')
    .insert([insertData])
    .select(SAFE_FIELDS)
    .single();

  if (error) {
    if (error.code === '23505' && error.message.includes('email')) {
      throw new AppError('Email already registered', 409);
    }
    if (error.message.includes('name')) {
      throw new AppError('Name validation failed', 400);
    }
    throw new AppError(`Database error: ${error.message}`, 500);
  }

  return data;
};

/**
 * Get all users (without passwords)
 */
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select(SAFE_FIELDS)
    .order('created_at', { ascending: false });

  if (error) throw new AppError(`Fetch failed: ${error.message}`, 500);
  return data;
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select(SAFE_FIELDS)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Not found
      throw new AppError('User not found', 404);
    }
    throw new AppError(`Fetch failed: ${error.message}`, 500);
  }
  return data;
};

/**
 * Update user
 */
export const updateUser = async (id, updateData) => {
  // Hash new password if provided
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  // Prevent role escalation in non-admin contexts (basic check)
  if (updateData.role && !['user', 'admin'].includes(updateData.role)) {
    throw new AppError('Invalid role specified', 400);
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(SAFE_FIELDS)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError('User not found', 404);
    }
    if (error.code === '23505' && error.message.includes('email')) {
      throw new AppError('Email already registered by another user', 409);
    }
    throw new AppError(`Update failed: ${error.message}`, 500);
  }

  return data;
};

/**
 * Delete user
 */
export const deleteUser = async (id) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError('User not found', 404);
    }
    throw new AppError(`Delete failed: ${error.message}`, 500);
  }
  
  return { message: 'User deleted successfully' };
};

/**
 * Verify password (for future auth implementation)
 */
export const verifyPassword = async (candidatePassword, hashedPassword) => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};