import { db } from './index';
import { users } from './schema';

const dummyUsers = [
  {
    name: 'Audyari',
    email: 'audyari@example.com',
    password: 'password123',
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    name: 'Budi Santoso',
    email: 'budi@example.com',
    password: 'budi123',
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    name: 'Citra Lestari',
    email: 'citra@example.com',
    password: 'citra456',
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    name: 'Dewi Putri',
    email: 'dewi@example.com',
    password: 'dewi789',
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    name: 'Eko Prasetyo',
    email: 'eko@example.com',
    password: 'eko321',
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
];

async function seed() {
  console.log('🌱 Seeding database...');
  
  try {
    await db.insert(users).values(dummyUsers);
    console.log('✅ Successfully inserted', dummyUsers.length, 'users');
    
    const allUsers = await db.select().from(users);
    console.log('\n📋 Users in database:');
    allUsers.forEach((user) => {
      console.log(`  - ${user.id}. ${user.name} (${user.email})`);
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seed();
