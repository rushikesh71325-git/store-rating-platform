import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing records in reverse dependency order
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // 2. Passwords
  const adminPassword = await hashPassword('AdminPassword@123');
  const ownerPassword = await hashPassword('OwnerPassword@123');
  const userPassword = await hashPassword('UserPassword@123');

  // 3. Create Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'System Platform Administrator', // 31 chars (valid: 20-60)
      email: 'admin@storerating.com',
      passwordHash: adminPassword,
      address: '100 Tech Hub Boulevard, Suite 500, Silicon City',
      role: Role.ADMIN,
    },
  });

  // 4. Create Store Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Alexander Marcus Sterling', // 25 chars
      email: 'owner1@storerating.com',
      passwordHash: ownerPassword,
      address: '42 Market Street, Commercial District, Metropolis',
      role: Role.STORE_OWNER,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Eleanor Vance Montgomery', // 24 chars
      email: 'owner2@storerating.com',
      passwordHash: ownerPassword,
      address: '78 Kingfisher Way, West End, Metropolis',
      role: Role.STORE_OWNER,
    },
  });

  // 5. Create Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Jonathan Edward Harker', // 22 chars
      email: 'user1@storerating.com',
      passwordHash: userPassword,
      address: '12 Castle Hill Road, Greenfield Town',
      role: Role.NORMAL_USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Catherine Elizabeth Brooks', // 26 chars
      email: 'user2@storerating.com',
      passwordHash: userPassword,
      address: '95 Magnolia Crescent, Greenfield Town',
      role: Role.NORMAL_USER,
    },
  });

  // 6. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Downtown Organic Grocery Mart', // 29 chars
      email: 'contact@downtowngrocery.com',
      address: '101 Fresh Valley Plaza, Downtown Commercial Zone',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'The Artisan Coffee Roastery', // 27 chars
      email: 'hello@artisancoffeeroasters.com',
      address: '55 Bean Alley, Old Quarter Arts District',
      ownerId: owner1.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Apex Electronics & Gadgets', // 26 chars
      email: 'support@apexelectronics.com',
      address: '202 Silicon Avenue, NextGen Innovation Park',
      ownerId: owner2.id,
    },
  });

  const store4 = await prisma.store.create({
    data: {
      name: 'Metropolitan Book & Stationery', // 30 chars
      email: 'info@metrobooks.com',
      address: '33 University Boulevard, Academic Row',
      ownerId: null, // Unassigned store
    },
  });

  // 7. Create Ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, value: 5 },
      { userId: user2.id, storeId: store1.id, value: 4 },
      { userId: user1.id, storeId: store2.id, value: 4 },
      { userId: user2.id, storeId: store3.id, value: 5 },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('🔑 TEST ACCOUNTS CREATED:');
  console.log('1. Admin:       admin@storerating.com     / AdminPassword@123');
  console.log('2. Store Owner: owner1@storerating.com    / OwnerPassword@123');
  console.log('3. Store Owner: owner2@storerating.com    / OwnerPassword@123');
  console.log('4. Normal User: user1@storerating.com     / UserPassword@123');
  console.log('5. Normal User: user2@storerating.com     / UserPassword@123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
