import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at'),
});

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  token: text('token').notNull(),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});
