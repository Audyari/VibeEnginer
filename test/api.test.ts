import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { Elysia } from 'elysia';
import { db } from '../src/db';
import { users, sessions } from '../src/db/schema';
import { eq } from 'drizzle-orm';

// Import the users routes
import { usersRoutes } from '../src/Router/users-route';

// Create test app instance
function createTestApp() {
  return new Elysia()
    .use(usersRoutes)
    .listen(0); // Use random available port
}

// Test data helpers
const testUserData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

const testUserData2 = {
  name: 'Test User Two',
  email: 'test2@example.com',
  password: 'password456',
};

// Cleanup function to remove test data
async function cleanupTestData() {
  // Delete all sessions related to test users
  const testUsers = await db.select().from(users).where(eq(users.email, testUserData.email));
  if (testUsers.length > 0) {
    for (const testUser of testUsers) {
      await db.delete(sessions).where(eq(sessions.userId, testUser.id));
    }
  }
  
  // Delete test users
  await db.delete(users).where(eq(users.email, testUserData.email));
  await db.delete(users).where(eq(users.email, testUserData2.email));
}

describe('Users API', () => {
  let app: ReturnType<typeof createTestApp>;
  let baseUrl: string;

  beforeEach(async () => {
    app = createTestApp();
    baseUrl = `http://${app.server?.hostname}:${app.server?.port}`;
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
    app.stop();
  });

  // ============================================
  // GET /api/users - Get All Users
  // ============================================
  describe('GET /api/users', () => {
    it('Scenario A: Must return an array of users, even when empty', async () => {
      const response = await fetch(`${baseUrl}/api/users`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('Scenario B: Insert one user and verify the GET array length increases by at least one', async () => {
      // Get initial count
      const initialResponse = await fetch(`${baseUrl}/api/users`);
      const initialData = await initialResponse.json();
      const initialLength = initialData.data.length;

      // Register a new user
      await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData),
      });

      // Get users again
      const response = await fetch(`${baseUrl}/api/users`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBeGreaterThan(initialLength);
    });
  });

  // ============================================
  // POST /api/users - Register
  // ============================================
  describe('POST /api/users (Register)', () => {
    it('Scenario A (Success): Register with valid payload and receive success response', async () => {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.Data).toBe('OK');
    });

    it('Scenario B (Fail): Register with an email that already exists; expect duplicate validation error', async () => {
      // First registration
      await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData),
      });

      // Second registration with same email
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.Error).toBe('Email Sudah Terdaftar');
    });

    it('Scenario C (Fail): Register with missing email', async () => {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', password: 'password123' }),
      });

      // Elysia returns 422 for validation errors
      expect(response.status).toBe(422);
    });

    it('Scenario C (Fail): Register with password less than 6 characters', async () => {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: '12345' }),
      });

      // Elysia returns 422 for validation errors
      expect(response.status).toBe(422);
    });

    it('Scenario C (Fail): Register with name exceeding 255 characters', async () => {
      const longName = 'a'.repeat(256);
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: longName, email: 'test@example.com', password: 'password123' }),
      });

      // Elysia returns 422 for validation errors
      expect(response.status).toBe(422);
    });
  });

  // ============================================
  // POST /api/users/login - Login
  // ============================================
  describe('POST /api/users/login (Login)', () => {
    it('Scenario A (Success): Login with valid existing email and password; expect success response with session token', async () => {
      // Register first
      await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData),
      });

      // Login
      const response = await fetch(`${baseUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUserData.email, password: testUserData.password }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.Data).toBeDefined();
      expect(typeof data.Data).toBe('string');
    });

    it('Scenario B (Fail): Login with wrong password', async () => {
      // Register first
      await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData),
      });

      // Login with wrong password
      const response = await fetch(`${baseUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUserData.email, password: 'wrongpassword' }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.Error).toBe('Email atau password salah');
    });

    it('Scenario B (Fail): Login with non-existent email', async () => {
      const response = await fetch(`${baseUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@example.com', password: 'password123' }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.Error).toBe('Email atau password salah');
    });
  });

  // ============================================
  // GET /api/users/current - Get Current User
  // ============================================
  describe('GET /api/users/current', () => {
    let validToken: string;

    beforeEach(async () => {
      // Register and login to get a valid token
      await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData),
      });

      const loginResponse = await fetch(`${baseUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUserData.email, password: testUserData.password }),
      });

      const loginData = await loginResponse.json();
      validToken = loginData.Data;
    });

    it('Scenario A: Call with valid token; expect user credentials in response', async () => {
      const response = await fetch(`${baseUrl}/api/users/current`, {
        headers: { Authorization: `Bearer ${validToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.Data).toBeDefined();
      expect(data.Data.name).toBe(testUserData.name);
      expect(data.Data.email).toBe(testUserData.email);
      expect(data.Data.id).toBeDefined();
    });

    it('Scenario B: Call without authorization header; expect Unauthorized error', async () => {
      const response = await fetch(`${baseUrl}/api/users/current`);

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.Error).toBe('Unauthorized');
    });

    it('Scenario B: Call with fake token; expect Unauthorized error', async () => {
      const response = await fetch(`${baseUrl}/api/users/current`, {
        headers: { Authorization: 'Bearer fake-token-12345' },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.Error).toBe('Unauthorized');
    });
  });

  // ============================================
  // DELETE /api/users/logout - Logout
  // ============================================
  describe('DELETE /api/users/logout', () => {
    let validToken: string;

    beforeEach(async () => {
      // Register and login to get a valid token
      await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData),
      });

      const loginResponse = await fetch(`${baseUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUserData.email, password: testUserData.password }),
      });

      const loginData = await loginResponse.json();
      validToken = loginData.Data;
    });

    it('Scenario A: Send logout request with valid token and verify success', async () => {
      const response = await fetch(`${baseUrl}/api/users/logout`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${validToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.Data).toBe('OK');
    });

    it('Scenario A: After logout, calling /api/users/current with same token should be unauthorized', async () => {
      // Logout first
      await fetch(`${baseUrl}/api/users/logout`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${validToken}` },
      });

      // Try to get current user with the same token
      const response = await fetch(`${baseUrl}/api/users/current`, {
        headers: { Authorization: `Bearer ${validToken}` },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.Error).toBe('Unauthorized');
    });
  });

  // ============================================
  // GET /api/users/:id - Get User by ID
  // ============================================
  describe('GET /api/users/:id', () => {
    let createdUserId: number;

    beforeEach(async () => {
      // Create a user and get the ID
      await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData),
      });

      // Get users to find the created user's ID
      const response = await fetch(`${baseUrl}/api/users`);
      const data = await response.json();
      const user = data.data.find((u: any) => u.email === testUserData.email);
      createdUserId = user.id;
    });

    it('Scenario A: Call GET endpoint with valid ID; expect valid user data', async () => {
      const response = await fetch(`${baseUrl}/api/users/${createdUserId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(createdUserId);
      expect(data.data.email).toBe(testUserData.email);
    });

    it('Scenario B: Send invalid ID (alphabetic); expect invalid ID error', async () => {
      const response = await fetch(`${baseUrl}/api/users/abc`);

      expect(response.status).toBe(500);
    });

    it('Scenario B: Send non-existent numeric ID; expect user not found error', async () => {
      const response = await fetch(`${baseUrl}/api/users/999999`);

      expect(response.status).toBe(500);
    });
  });

  // ============================================
  // PUT /api/users/:id - Update User
  // ============================================
  describe('PUT /api/users/:id', () => {
    let createdUserId: number;

    beforeEach(async () => {
      // Create a user
      await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData),
      });

      // Get users to find the created user's ID
      const response = await fetch(`${baseUrl}/api/users`);
      const data = await response.json();
      const user = data.data.find((u: any) => u.email === testUserData.email);
      createdUserId = user.id;
    });

    it('Scenario A: Update user data and verify changes', async () => {
      const updatePayload = {
        name: 'Updated Name',
        email: 'updated@example.com',
        password: 'newpassword123',
      };

      // Update user
      const updateResponse = await fetch(`${baseUrl}/api/users/${createdUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      expect(updateResponse.status).toBe(200);

      // Verify changes by re-fetching
      const getResponse = await fetch(`${baseUrl}/api/users/${createdUserId}`);
      const getData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(getData.data.name).toBe('Updated Name');
      expect(getData.data.email).toBe('updated@example.com');
    });
  });

  // ============================================
  // DELETE /api/users/:id - Delete User by ID
  // ============================================
  describe('DELETE /api/users/:id', () => {
    let createdUserId: number;

    beforeEach(async () => {
      // Create a user
      await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData),
      });

      // Get users to find the created user's ID
      const response = await fetch(`${baseUrl}/api/users`);
      const data = await response.json();
      const user = data.data.find((u: any) => u.email === testUserData.email);
      createdUserId = user.id;
    });

    it('Scenario A: Delete user and verify user no longer exists', async () => {
      // Delete user
      const deleteResponse = await fetch(`${baseUrl}/api/users/${createdUserId}`, {
        method: 'DELETE',
      });

      const deleteData = await deleteResponse.json();
      expect(deleteResponse.status).toBe(200);
      expect(deleteData.success).toBe(true);

      // Verify by calling GET /:id - should return error
      const getResponse = await fetch(`${baseUrl}/api/users/${createdUserId}`);

      expect(getResponse.status).toBe(500);
    });
  });
});
