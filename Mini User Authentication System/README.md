# Mini User Authentication System

## ✅ Requirements Met
- [x] Supabase JS Client integration
- [x] Bcrypt password hashing (configurable rounds)
- [x] Async/await with robust error handling
- [x] **ZERO password exposure** in any response
- [x] Email uniqueness enforcement (pre-check + DB constraint handling)
- [x] Input validation (express-validator)
- [x] 404 for missing profiles
- [x] Secure database design (see below)

## 🗄️ Supabase Table Setup (Run in SQL Editor)
```sql
-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 1 AND age <= 120),
  location TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⚠️ SECURITY: Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public signup (INSERT)
CREATE POLICY "Allow public signup" ON users
  FOR INSERT WITH CHECK (true);

-- RLS Policy: Allow profile lookup by name (SELECT)
CREATE POLICY "Allow profile lookup by name" ON users
  FOR SELECT USING (true);