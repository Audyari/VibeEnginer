import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, sessions } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';

interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

interface RegisterUserResult {
  success: boolean;
  error?: string;
}

interface LoginUserResult {
  success: boolean;
  token?: string;
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

export async function loginUser(email: string, password: string): Promise<LoginUserResult> {
  // Query user by email
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user || user.length === 0) {
    return { success: false, error: 'Email atau password salah' };
  }

  const userData = user[0]!;

  // Verify password
  const isValidPassword = await bcrypt.compare(password, userData.password);

  if (!isValidPassword) {
    return { success: false, error: 'Email atau password salah' };
  }

  // Generate session token (UUID v4)
  const token = uuidv4();

  // Insert session into database
  await db.insert(sessions).values({
    token,
    userId: userData.id,
  });

  return { success: true, token };
}
