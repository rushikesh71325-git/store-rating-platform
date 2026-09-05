import app from './app';
import env from './config/env';
import prisma from './db';

async function bootstrap() {
  try {
    // 1. Verify Database Connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database successfully.');

    // 2. Start HTTP Server
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Store Management Backend running at http://localhost:${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🩺 Health check: http://localhost:${env.PORT}/api/v1/health`);
    });

    // 3. Graceful Shutdown Handlers
    const handleShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('🔒 HTTP server closed.');
        await prisma.$disconnect();
        console.log('🔌 Database disconnected.');
        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful close hangs
      setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
