import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const args = process.argv.slice(2);
  const email = args[0] || 'shadosama@gmail.com';
  const password = args[1] || 'raito123';
  const name = args[2] || 'Admin';
  const roleInput = (args[3] || 'ADMIN').toUpperCase();

  const role = (Role as any)[roleInput] || Role.ADMIN;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FeastCraft Admin User Provisioning CLI  ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`• Email:    ${email}`);
  console.log(`• Name:     ${name}`);
  console.log(`• Role:     ${role}`);
  console.log('• Password: [HIDDEN]');

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        role,
        passwordHash,
      },
      create: {
        email,
        name,
        role,
        passwordHash,
      },
    });

    console.log('\n✅ Admin account saved to database successfully!');
    console.log(`• User ID:   ${user.id}`);
    console.log(`• Role:      ${user.role}`);
    console.log(`• Email:     ${user.email}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error: any) {
    console.error('\n❌ Error saving admin account to database:', error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
