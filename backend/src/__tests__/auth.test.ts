import { AuthService } from '../auth';
import { User, UserRole } from '../types';

describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await AuthService.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await AuthService.hashPassword(password);
      
      const isMatch = await AuthService.comparePassword(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await AuthService.hashPassword(password);
      
      const isMatch = await AuthService.comparePassword(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: '1',
        email: 'test@example.com',
        role: UserRole.NORMAL,
      };
      
      const token = AuthService.generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        userId: '1',
        email: 'test@example.com',
        role: UserRole.NORMAL,
      };
      
      const token = AuthService.generateToken(payload);
      const decoded = AuthService.verifyToken(token);
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.jwt.token';
      
      expect(() => {
        AuthService.verifyToken(invalidToken);
      }).toThrow('Invalid token');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const authHeader = `Bearer ${token}`;
      
      const extractedToken = AuthService.extractTokenFromHeader(authHeader);
      expect(extractedToken).toBe(token);
    });

    it('should throw error for missing header', () => {
      expect(() => {
        AuthService.extractTokenFromHeader(undefined);
      }).toThrow('Authorization header missing or invalid');
    });

    it('should throw error for invalid header format', () => {
      expect(() => {
        AuthService.extractTokenFromHeader('InvalidHeader');
      }).toThrow('Authorization header missing or invalid');
    });
  });
});
