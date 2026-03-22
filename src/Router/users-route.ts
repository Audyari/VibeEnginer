import { Elysia, t } from 'elysia';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../db/schema';
import { registerUser, loginUser, getCurrentUser, logoutUser } from '../services/users-services';

export const usersRoutes = new Elysia()
  .group('/api/users', (app) =>
    app
      // GET /api/users - Get all users
      .get('/', async () => {
        const allUsers = await db.select().from(users);
        return { success: true, data: allUsers };
      })

      // POST /api/users - Register new user
      .post('/', async ({ body }) => {
        const result = await registerUser(body);

        if (!result.success) {
          return { Error: result.error };
        }

        return { Data: 'OK' };
      }, {
        body: t.Object({
          name: t.String({ minLength: 3, maxLength: 255 }),
          email: t.String({ format: 'email', maxLength: 255 }),
          password: t.String({ minLength: 6, maxLength: 100 }),
        }),
      })

      // POST /api/users/login - Login user
      .post('/login', async ({ body }) => {
        const { email, password } = body;

        const result = await loginUser(email, password);

        if (!result.success) {
          return { Error: result.error };
        }

        return { Data: result.token };
      }, {
        body: t.Object({
          email: t.String(),
          password: t.String(),
        }),
      })

      // GET /api/users/current - Get current user
      .get('/current', async ({ headers }) => {
        const authHeader = headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return { Error: 'Unauthorized' };
        }

        const token = authHeader.slice(7); // Remove 'Bearer ' prefix

        if (!token || token.trim() === '') {
          return { Error: 'Unauthorized' };
        }

        const result = await getCurrentUser(token.trim());

        if (!result.success) {
          return { Error: 'Unauthorized' };
        }

        return { Data: result.data };
      })

      // DELETE /api/users/logout - Logout user
      .delete('/logout', async ({ headers, set }) => {
        const authHeader = headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          set.status = 401;
          return { Error: 'Unauthorized' };
        }

        const token = authHeader.slice(7); // Remove 'Bearer ' prefix

        if (!token || token.trim() === '') {
          set.status = 401;
          return { Error: 'Unauthorized' };
        }

        try {
          const result = await logoutUser(token.trim());
          return { Data: result };
        } catch (error) {
          set.status = 401;
          return { Error: 'Unauthorized' };
        }
      })

      // GET /api/users/:id - Get user by ID
      .get('/:id', async ({ params }) => {
        const id = parseInt(params.id);

        if (isNaN(id) || id <= 0) {
          throw new Error('Invalid user ID');
        }

        const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

        if (!user || user.length === 0) {
          throw new Error('User not found');
        }

        return { success: true, data: user[0] };
      }, {
        params: t.Object({
          id: t.String(),
        }),
      })

      // PUT /api/users/:id - Update user
      .put('/:id', async ({ params, body }) => {
        const id = parseInt(params.id);

        if (isNaN(id) || id <= 0) {
          throw new Error('Invalid user ID');
        }

        // Hash password before updating
        const hashedPassword = await bcrypt.hash(body.password, 10);

        await db.update(users)
          .set({
            name: body.name,
            email: body.email,
            password: hashedPassword,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(users.id, id));

        return { success: true, message: 'User updated successfully' };
      }, {
        body: t.Object({
          name: t.String({ minLength: 3, maxLength: 255 }),
          email: t.String({ format: 'email', maxLength: 255 }),
          password: t.String({ minLength: 6, maxLength: 100 }),
        }),
        params: t.Object({
          id: t.String(),
        }),
      })

      // DELETE /api/users/:id - Delete user
      .delete('/:id', async ({ params }) => {
        const id = parseInt(params.id);

        if (isNaN(id) || id <= 0) {
          throw new Error('Invalid user ID');
        }

        await db.delete(users).where(eq(users.id, id));

        return { success: true, message: 'User deleted successfully' };
      }, {
        params: t.Object({
          id: t.String(),
        }),
      })
  );
