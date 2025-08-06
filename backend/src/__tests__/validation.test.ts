import { 
  createUserSchema, 
  loginSchema, 
  createNewsSchema, 
  createAdvertisementSchema
} from '../validation';

describe('Validation Schemas', () => {
  describe('createUserSchema', () => {
    it('should validate valid user data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        role: 'normal' as const,
      };

      const result = createUserSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'TestPassword123',
        role: 'normal' as const,
      };

      expect(() => createUserSchema.parse(invalidData)).toThrow();
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        role: 'normal' as const,
      };

      expect(() => createUserSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid role', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        role: 'invalid' as any,
      };

      expect(() => createUserSchema.parse(invalidData)).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });
  });

  describe('createNewsSchema', () => {
    it('should validate valid news data', () => {
      const validData = {
        title: 'Test News',
        content: 'This is test news content',
        published: true,
      };

      const result = createNewsSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should set default published to false', () => {
      const dataWithoutPublished = {
        title: 'Test News',
        content: 'This is test news content',
      };

      const result = createNewsSchema.parse(dataWithoutPublished);
      expect(result.published).toBe(false);
    });

    it('should reject too long title', () => {
      const invalidData = {
        title: 'a'.repeat(201),
        content: 'This is test news content',
      };

      expect(() => createNewsSchema.parse(invalidData)).toThrow();
    });

    it('should reject too long content', () => {
      const invalidData = {
        title: 'Test News',
        content: 'a'.repeat(501),
      };

      expect(() => createNewsSchema.parse(invalidData)).toThrow();
    });
  });

  describe('createAdvertisementSchema', () => {
    it('should validate valid ad data', () => {
      const validData = {
        title: 'Test Ad',
        description: 'This is test ad description',
        category: 'Services',
        price: '€50',
        contactEmail: 'test@example.com',
        published: false,
      };

      const result = createAdvertisementSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should set default published to false', () => {
      const dataWithoutPublished = {
        title: 'Test Ad',
        description: 'This is test ad description',
        category: 'Services',
        price: '€50',
        contactEmail: 'test@example.com',
      };

      const result = createAdvertisementSchema.parse(dataWithoutPublished);
      expect(result.published).toBe(false);
    });

    it('should reject too long description', () => {
      const invalidData = {
        title: 'Test Ad',
        description: 'a'.repeat(501),
        category: 'Services',
        price: '€50',
        contactEmail: 'test@example.com',
      };

      expect(() => createAdvertisementSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        title: 'Test Ad',
        description: 'This is test ad description',
        category: 'Services',
        price: '€50',
        contactEmail: 'invalid-email',
      };

      expect(() => createAdvertisementSchema.parse(invalidData)).toThrow();
    });
  });
});
