import { Elysia, t } from 'elysia';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

export const usersRoutes = new Elysia()
  .group('/users', (app) => 
    app
      // GET /users - Get all users
      .get('/', async () => {
        const allUsers = await db.select().from(users);
        return { success: true, data: allUsers };
      })

      // POST /users - Create new user
      .post('/', async ({ body }) => {
        await db.insert(users).values({
          name: body.name,
          email: body.email,
          password: body.password,
        });

        const newUser = await db.select().from(users)
          .orderBy(users.id, 'desc')
          .limit(1);

        return {
          success: true,
          message: 'User created successfully',
          id: newUser[0].id
        };
      }, {
        body: t.Object({
          name: t.String(),
          email: t.String(),
          password: t.String(),
        }),
      })

      // GET /users/:id - Get user by ID
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

      // PUT /users/:id - Update user
      .put('/:id', async ({ params, body }) => {
        const id = parseInt(params.id);

        if (isNaN(id) || id <= 0) {
          throw new Error('Invalid user ID');
        }

        await db.update(users)
          .set({
            name: body.name,
            email: body.email,
            password: body.password,
          })
          .where(eq(users.id, id));

        return { success: true, message: 'User updated successfully' };
      }, {
        body: t.Object({
          name: t.String(),
          email: t.String(),
          password: t.String(),
        }),
        params: t.Object({
          id: t.String(),
        }),
      })

      // DELETE /users/:id - Delete user
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
