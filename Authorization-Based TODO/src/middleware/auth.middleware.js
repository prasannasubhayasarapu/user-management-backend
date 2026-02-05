import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import { supabase } from '../config/supabase.js';

export const protect = async (req, res, next) => {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Please provide a valid authentication token', 401));
    }
    
    const token = authHeader.split(' ')[1];
    
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Verify user still exists (prevent deleted user access)
    const {  user, error } = await supabase
      .from('users')
      .select('id, email, is_active')
      .eq('id', decoded.userId)
      .single();
    
    if (error || !user || !user.is_active) {
      return next(new AppError('User no longer exists or is deactivated', 401));
    }
    
    // 4. Attach user to request
    req.user = {
      id: user.id,
      email: user.email
    };
    
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid authentication token', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Authentication token expired. Please login again', 401));
    }
    next(new AppError('Authentication failed', 401));
  }
};