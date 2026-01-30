import Joi from 'joi';
import { MIN_PASSWORD_LENGTH, VALID_ROLES } from '../utils/constants.js';

export const createUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 1 character',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(MIN_PASSWORD_LENGTH)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required()
    .messages({
      'string.min': `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    }),
  
  age: Joi.number()
    .integer()
    .min(18)
    .max(120)
    .optional()
    .messages({
      'number.min': 'Age must be at least 18',
      'number.max': 'Age cannot exceed 120',
      'number.integer': 'Age must be a whole number'
    }),
  
  role: Joi.string()
    .valid(...VALID_ROLES)
    .default('user')
    .messages({
      'any.only': `Role must be one of: ${VALID_ROLES.join(', ')}`
    })
}).messages({
  'object.unknown': 'Unknown field in request body'
});

export const updateUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Name must be at least 1 character'
    }),
  
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .optional()
    .messages({
      'string.email': 'Invalid email format'
    }),
  
  password: Joi.string()
    .min(MIN_PASSWORD_LENGTH)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .optional()
    .messages({
      'string.min': `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character'
    }),
  
  age: Joi.number()
    .integer()
    .min(18)
    .max(120)
    .optional()
    .messages({
      'number.min': 'Age must be at least 18'
    }),
  
  role: Joi.string()
    .valid(...VALID_ROLES)
    .optional()
    .messages({
      'any.only': `Role must be one of: ${VALID_ROLES.join(', ')}`
    })
})
  .min(1)
  .messages({
    'object.min': 'At least one field is required for update',
    'object.unknown': 'Unknown field in request body'
  });