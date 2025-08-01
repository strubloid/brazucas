import { UserService } from '../services';
import { InMemoryUserRepository } from '../repositories';
import { UserRole } from '../types';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userService = new UserService(userRepository);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        role: UserRole.NORMAL,
      };

      const result = await userService.register(userData);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.role).toBe(userData.role);
      expect(result.token).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        role: UserRole.NORMAL,
      };

      await userService.register(userData);

      await expect(userService.register(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        role: UserRole.NORMAL,
      };

      await userService.register(userData);

      const loginData = {
        email: userData.email,
        password: userData.password,
      };

      const result = await userService.login(loginData);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.token).toBeDefined();
    });

    it('should throw error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123',
      };

      await expect(userService.login(loginData)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error for invalid password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        role: UserRole.NORMAL,
      };

      await userService.register(userData);

      const loginData = {
        email: userData.email,
        password: 'WrongPassword',
      };

      await expect(userService.login(loginData)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user without password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        role: UserRole.NORMAL,
      };

      const { user } = await userService.register(userData);
      const foundUser = await userService.getUserById(user.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(userData.email);
      expect(foundUser).not.toHaveProperty('password');
    });

    it('should return null for non-existent user', async () => {
      const foundUser = await userService.getUserById('nonexistent');
      expect(foundUser).toBeNull();
    });
  });
});
