import Joi from 'joi';

// Validation for creating todo (requires userId)
export const createTodoSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(150)
    .required()
    .messages({
      'string.empty': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 150 characters'
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  userId: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.uuid': 'Invalid user ID format',
      'any.required': 'User ID is required'
    }),
  is_completed: Joi.boolean().optional()
}).messages({ 'object.unknown': 'Unknown field in request body' });

// Validation for updating todo
export const updateTodoSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(150)
    .optional()
    .messages({ 'string.max': 'Title cannot exceed 150 characters' }),
  description: Joi.string()
    .max(500)
    .optional(),
  is_completed: Joi.boolean().optional()
})
  .min(1)
  .messages({
    'object.min': 'At least one field required for update',
    'object.unknown': 'Unknown field in request body'
  });

// Validation for ID parameters
export const idParamSchema = Joi.object({
  id: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.uuid': 'Invalid ID format',
      'any.required': 'ID parameter is required'
    })
}).unknown(); // Allow route params