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

        // Exclude password from response
        const usersWithoutPassword = allUsers.map(({ password, ...user }) => user);

        return { success: true, data: usersWithoutPassword };
      }, {
        detail: {
          summary: "Get All Users",
          tags: ['Users'],
          description: "Endpoint ini digunakan untuk mendapatkan semua user yang terdaftar dalam database."
        },
        response: t.Object({
          success: t.Boolean(),
          data: t.Array(t.Object({
            id: t.Number(),
            name: t.String(),
            email: t.String(),
            createdAt: t.String(),
            updatedAt: t.Optional(t.String()),
          })),
        }),
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
        detail: {
          summary: "Registrasi User Baru",
          tags: ['Users'],
          description: "Endpoint ini digunakan untuk mendaftarkan user baru ke dalam database."
        },
        response: t.Object({
          Data: t.String(),
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
        detail: {
          summary: "Login User",
          tags: ['Users'],
          description: "Endpoint ini digunakan untuk login user dan mendapatkan token autentikasi."
        },
        response: t.Union([
          t.Object({
            Data: t.String(),
          }),
          t.Object({
            Error: t.String(),
          }),
        ]),
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
      }, {
        detail: {
          summary: "Get Current User",
          tags: ['Users'],
          description: "Endpoint ini digunakan untuk mendapatkan data user yang sedang login berdasarkan token autentikasi."
        },
        response: t.Union([
          t.Object({
            Data: t.Object({
              id: t.Number(),
              name: t.String(),
              email: t.String(),
              createdAt: t.String(),
              updatedAt: t.Optional(t.String()),
            }),
          }),
          t.Object({
            Error: t.String(),
          }),
        ]),
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
      }, {
        detail: {
          summary: "Logout User",
          tags: ['Users'],
          description: "Endpoint ini digunakan untuk logout user dan menginvalidate token autentikasi."
        },
        response: t.Union([
          t.Object({
            Data: t.Any(),
          }),
          t.Object({
            Error: t.String(),
          }),
        ]),
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

        // Exclude password from response
        const { password, ...userWithoutPassword } = user[0]!;

        return { success: true, data: userWithoutPassword };
      }, {
        params: t.Object({
          id: t.String(),
        }),
        detail: {
          summary: "Get User by ID",
          tags: ['Users'],
          description: "Endpoint ini digunakan untuk mendapatkan data user berdasarkan ID."
        },
        response: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.Number(),
            name: t.String(),
            email: t.String(),
            createdAt: t.String(),
            updatedAt: t.Optional(t.String()),
          }),
        }),
      })

      // PUT /api/users/:id - Update user
      .put('/:id', async ({ params, body }) => {
        const id = parseInt(params.id);

        if (isNaN(id) || id <= 0) {
          throw new Error('Invalid user ID');
        }

        // Check if email is being changed and if it already exists
        if (body.email) {
          const existingUser = await db.select().from(users).where(eq(users.email, body.email)).limit(1);

          if (existingUser.length > 0 && existingUser[0]!.id !== id) {
            return { Error: 'Email sudah terdaftar' };
          }
        }

        // Prepare update data
        const updateData: {
          name: string;
          email: string;
          password?: string;
          updatedAt: string;
        } = {
          name: body.name,
          email: body.email,
          updatedAt: new Date().toISOString(),
        };

        // Only hash and update password if provided
        if (body.password) {
          updateData.password = await bcrypt.hash(body.password, 10);
        }

        await db.update(users)
          .set(updateData)
          .where(eq(users.id, id));

        return { success: true, message: 'User updated successfully' };
      }, {
        body: t.Object({
          name: t.String({ minLength: 3, maxLength: 255 }),
          email: t.String({ format: 'email', maxLength: 255 }),
          password: t.Optional(t.String({ minLength: 6, maxLength: 100 })),
        }),
        params: t.Object({
          id: t.String(),
        }),
        detail: {
          summary: "Update User by ID",
          tags: ['Users'],
          description: "Endpoint ini digunakan untuk memperbarui data user berdasarkan ID."
        },
        response: t.Union([
          t.Object({
            success: t.Boolean(),
            message: t.String(),
          }),
          t.Object({
            Error: t.String(),
          }),
        ]),
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
        detail: {
          summary: "Delete User by ID",
          tags: ['Users'],
          description: "Endpoint ini digunakan untuk menghapus user berdasarkan ID."
        },
        response: t.Object({
          success: t.Boolean(),
          message: t.String(),
        }),
      })
  );
