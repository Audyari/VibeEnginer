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

interface GetCurrentUserResult {
  success: boolean;
  data?: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
  };
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

export async function getCurrentUser(token: string): Promise<GetCurrentUserResult> {
  // Query session by token
  const session = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);

  if (!session || session.length === 0) {
    return { success: false, error: 'Unauthorized' };
  }

  const sessionData = session[0]!;

  // Get user data from users table
  const user = await db.select().from(users).where(eq(users.id, sessionData.userId)).limit(1);

  if (!user || user.length === 0) {
    return { success: false, error: 'Unauthorized' };
  }

  const userData = user[0]!;

  // Return user data without password
  return {
    success: true,
    data: {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      createdAt: userData.createdAt,
    },
  };
}

export async function logoutUser(token: string): Promise<string> {
  // Query session by token to verify it exists
  const session = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);

  if (!session || session.length === 0) {
    throw new ResponseError('Unauthorized', 401);
  }

  // Delete the session from database
  await db.delete(sessions).where(eq(sessions.token, token));

  return 'OK';
}

class ResponseError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
