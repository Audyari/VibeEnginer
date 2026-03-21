import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

interface RegisterUserResult {
  success: boolean;
  error?: string;
}

export async function registerUser(payload: RegisterUserPayload): Promise<RegisterUserResult> {
  const { name, email, password } = payload;

  // Check if email already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser && existingUser.length > 0) {
    return { success: false, error: 'Email Sudah Terdaftar' };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { success: true };
}
