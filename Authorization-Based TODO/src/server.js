import app from './app.js';
import { testSupabaseConnection } from './config/supabase.js';

const PORT = process.env.PORT || 3000;

// Verify critical dependencies on startup
const init = async () => {
  try {
    await testSupabaseConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
      console.log(`🔗 Environment: ${process.env.NODE_ENV}`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🗄️  Database: ${process.env.SUPABASE_URL}`);
    });
  } catch (err) {
    console.error('❌ Critical startup error:');
    console.error(err.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

init();