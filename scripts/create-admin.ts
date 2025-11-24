import { prisma } from '../lib/prisma';
import { auth } from '../lib/auth';

async function createAdmin() {
  const email = 'admin@digiwolf.com';
  const password = 'admin123';
  const name = 'Admin User';

  try {
    // Check if user already exists and delete it
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Deleting existing user...');
      await prisma.user.delete({
        where: { email },
      });
      console.log('Existing user deleted.');
    }

    // Use Better Auth's sign-up API to create the user properly
    // This ensures the password is hashed correctly
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to create user');
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Password:', password);
    console.log('\n⚠️  Please change the default password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
