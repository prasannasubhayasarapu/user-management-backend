# 🔒 Authorization-Based TODO Application

A secure TODO application with JWT authentication, strict ownership validation, and defense-in-depth security practices.

## ✨ Features
- JWT-based authentication (1-hour expiry)
- Bcrypt password hashing (12 salt rounds)
- Row-Level Security (RLS) enforced in Supabase
- Zero-trust ownership validation on all TODO operations
- Centralized error handling with no data leakage
- Environment validation on startup
- Comprehensive input validation

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- Supabase account ([supabase.com](https://supabase.com))
- PostgreSQL knowledge

### Step 1: Clone & Install
```bash
git clone <your-repo-url>
cd todo-app
npm install