import supabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import AppError from '../utils/AppError.js';

const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  return bcrypt.hash(password, saltRounds);
};

export const createUser = async (userData) => {
  // Hash password
  const hashedPassword = await hashPassword(userData.password);
  
  // Insert user
  const { data, error } = await supabase
    .from('users')
    .insert([{
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword
    }])
    .select('id, name, email, created_at')
    .single();

  if (error) {
    if (error.code === '23505' && error.message.includes('email')) {
      throw new AppError('Email already registered', 409);
    }
    throw new AppError(`Registration failed: ${error.message}`, 500);
  }

  return data;
};