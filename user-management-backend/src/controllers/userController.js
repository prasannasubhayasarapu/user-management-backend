import * as userService from '../services/userService.js';
import AppError from '../utils/AppError.js';

export const createUser = async (req, res, next) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: newUser
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    // Prevent ID tampering
    if (req.body.id) {
      return next(new AppError('Cannot modify user ID', 400));
    }
    
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.status(200).json({
      status: 'success',
      ...result
    });
  } catch (err) {
    next(err);
  }
};