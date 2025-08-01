import { UserService } from './services';
import { InMemoryUserRepository } from './repositories';
import { UserRole } from './types';

const userRepository = new InMemoryUserRepository();
const userService = new UserService(userRepository);

/**
 * Manual admin initialization function
 * This should only be called manually when needed, not automatically
 * Use the admin registration form instead for better security
 */
export const initializeAdmin = async (email: string, password: string): Promise<void> => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Check if admin user already exists
    const existingAdmin = await userRepository.findByEmail(email);
    if (existingAdmin) {
      console.log('Admin user already exists with this email');
      return;
    }

    // Create admin user
    const adminUser = await userService.register({
      email,
      password,
      role: UserRole.ADMIN,
    });

    console.log(`Admin user created successfully with email: ${email}`);
  } catch (error) {
    console.error('Error initializing admin user:', error);
    throw error;
  }
};
