import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const signToken = (id, email) => {
  return jwt.sign(
    { userId: id, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  
  // Validate input
  if (!name || !email || !password) {
    return next(new AppError('Name, email, and password are required', 400));
  }
  
  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }
  
  // Check for existing user
  const {  existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();
  
  if (existingUser) {
    return next(new AppError('User with this email already exists', 409));
  }
  
  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  // Create user
  const {  newUser, error } = await supabase
    .from('users')
    .insert([
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        is_active: true
      }
    ])
    .select('id, name, email, created_at')
    .single();
  
  if (error) {
    if (error.code === '23505') { // Unique violation
      return next(new AppError('User with this email already exists', 409));
    }
    throw error;
  }
  
  // Generate token
  const token = signToken(newUser.id, newUser.email);
  
  res.status(201).json({
    status: 'success',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }
  
  // Find user
  const {  user, error } = await supabase
    .from('users')
    .select('id, email, password, name, is_active')
    .eq('email', email.toLowerCase().trim())
    .single();
  
  if (error || !user || !user.is_active) {
    return next(new AppError('Invalid email or password', 401));
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }
  
  // Generate token
  const token = signToken(user.id, user.email);
  
  res.status(200).json({
    status: 'success',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});