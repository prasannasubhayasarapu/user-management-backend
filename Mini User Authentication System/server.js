require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
const { body, query, validationResult } = require('express-validator');

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

// ======================
// VALIDATION MIDDLEWARE
// ======================
const validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Age must be 1-120'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateProfileQuery = [
  query('name').trim().notEmpty().withMessage('Name query parameter required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// ======================
// SIGNUP ENDPOINT
// ======================
app.post('/signup', validateSignup, async (req, res) => {
  try {
    const { name, email, age, location, password } = req.body;

    // Check for existing email (prevent duplicates)
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user (password hashed, created_at auto-generated)
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        age: parseInt(age),
        location,
        password: hashedPassword
      });

    if (insertError) {
      // Handle race condition duplicate (though pre-check exists)
      if (insertError.code === '23505') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      throw insertError;
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ======================
// PROFILE ENDPOINT
// ======================
app.get('/myprofile', validateProfileQuery, async (req, res) => {
  try {
    const { name } = req.query;

    // Fetch user WITHOUT password field
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, age, location')
      .eq('name', name)
      .limit(1)
      .maybeSingle(); // Returns null if not found

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ======================
// ERROR HANDLING & START
// ======================
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Signup: POST http://localhost:${PORT}/signup`);
  console.log(`📍 Profile: GET http://localhost:${PORT}/myprofile?name=Test`);
});