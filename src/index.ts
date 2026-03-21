import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { usersRoutes } from './routes';

const app = new Elysia()
  // Swagger documentation at /swagger
  .use(swagger())
  
  // Health check endpoint
  .get('/', () => {
    return { 
      message: 'Welcome to VibeEnginer API',
      docs: '/swagger',
    };
  })
  
  .get('/health', () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  })
  
  // Users routes
  .use(usersRoutes)

  .listen(3000);

console.log(`🦊 Server running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Swagger docs at http://${app.server?.hostname}:${app.server?.port}/swagger`);
