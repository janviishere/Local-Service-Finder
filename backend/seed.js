import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { name: 'Electrician', slug: 'electrician', icon: '⚡' },
  { name: 'Plumber', slug: 'plumber', icon: '🔧' },
  { name: 'House Cleaning', slug: 'house-cleaning', icon: '🏠' },
  { name: 'AC Repair', slug: 'ac-repair', icon: '❄️' },
  { name: 'Painting', slug: 'painting', icon: '🎨' },
  { name: 'Carpentry', slug: 'carpentry', icon: '🪵' },
  { name: 'Pest Control', slug: 'pest-control', icon: '🪟' },
  { name: 'Security', slug: 'security', icon: '🔒' }
];

const providersData = [
  { name: 'John Electric', email: 'john@electric.com', password: 'password123', role: 'provider', city: 'Bhopal' },
  { name: 'Mike Plumb', email: 'mike@plumb.com', password: 'password123', role: 'provider', city: 'Indore' },
  { name: 'Sarah Clean', email: 'sarah@clean.com', password: 'password123', role: 'provider', city: 'Bhopal' },
];

const customersData = [
  { name: 'Alice Customer', email: 'alice@test.com', password: 'password123', role: 'customer', city: 'Bhopal' },
  { name: 'Bob Customer', email: 'bob@test.com', password: 'password123', role: 'customer', city: 'Indore' },
];

async function main() {
  console.log('Start seeding...');

  // 1. Create categories
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log('Categories seeded.');

  const dbCategories = await prisma.category.findMany();

  // 2. Create users (Providers and Customers)
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const providers = [];
  for (const p of providersData) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: { ...p, password: hashedPassword }
    });
    providers.push(user);
  }

  const customers = [];
  for (const c of customersData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: { ...c, password: hashedPassword }
    });
    customers.push(user);
  }
  console.log('Users seeded.');

  // 3. Create services
  const servicesData = [
    { title: 'Ceiling Fan Installation', description: 'Expert installation of ceiling fans.', price: '₹499', providerId: providers[0].id, categoryId: dbCategories.find(c => c.slug === 'electrician').id, city: 'Bhopal', rating: 4.8, reviewCount: 120 },
    { title: 'Switchboard Repair', description: 'Repair and replacement of electrical switchboards.', price: '₹299', providerId: providers[0].id, categoryId: dbCategories.find(c => c.slug === 'electrician').id, city: 'Bhopal', rating: 4.5, reviewCount: 45 },
    { title: 'Tap Leakage Repair', description: 'Fixing leaking taps and pipes.', price: '₹199', providerId: providers[1].id, categoryId: dbCategories.find(c => c.slug === 'plumber').id, city: 'Indore', rating: 4.9, reviewCount: 80 },
    { title: 'Deep Home Cleaning', description: 'Full home deep cleaning including kitchen and bathrooms.', price: '₹2999', providerId: providers[2].id, categoryId: dbCategories.find(c => c.slug === 'house-cleaning').id, city: 'Bhopal', rating: 4.7, reviewCount: 200 },
  ];

  const dbServices = [];
  for (const s of servicesData) {
    const service = await prisma.service.create({ data: s });
    dbServices.push(service);
  }
  console.log('Services seeded.');

  // 4. Create Reviews
  const reviewsData = [
    { rating: 5, comment: 'Great service, very professional.', userId: customers[0].id, serviceId: dbServices[0].id },
    { rating: 4, comment: 'Good work, but arrived a bit late.', userId: customers[1].id, serviceId: dbServices[1].id },
    { rating: 5, comment: 'Excellent cleaning, the house looks brand new!', userId: customers[0].id, serviceId: dbServices[3].id },
  ];

  for (const r of reviewsData) {
    await prisma.review.create({ data: r });
  }
  console.log('Reviews seeded.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
