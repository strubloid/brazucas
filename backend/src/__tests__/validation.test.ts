import { 
  createUserSchema, 
  loginSchema, 
  createNewsSchema, 
  createAdSchema,
  validateAdMedia 
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
        excerpt: 'Test excerpt',
        published: true,
      };

      const result = createNewsSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should set default published to false', () => {
      const dataWithoutPublished = {
        title: 'Test News',
        content: 'This is test news content',
        excerpt: 'Test excerpt',
      };

      const result = createNewsSchema.parse(dataWithoutPublished);
      expect(result.published).toBe(false);
    });

    it('should reject too long title', () => {
      const invalidData = {
        title: 'a'.repeat(201),
        content: 'This is test news content',
        excerpt: 'Test excerpt',
      };

      expect(() => createNewsSchema.parse(invalidData)).toThrow();
    });
  });

  describe('createAdSchema', () => {
    it('should validate valid ad data', () => {
      const validData = {
        title: 'Test Ad',
        content: 'This is test ad content',
        imageUrl: 'https://example.com/image.jpg',
      };

      const result = createAdSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should validate ad with YouTube URL', () => {
      const validData = {
        title: 'Test Ad',
        content: 'This is test ad content',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      };

      const result = createAdSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid YouTube URL', () => {
      const invalidData = {
        title: 'Test Ad',
        content: 'This is test ad content',
        youtubeUrl: 'https://invalid-youtube-url.com',
      };

      expect(() => createAdSchema.parse(invalidData)).toThrow();
    });

    it('should reject too long content', () => {
      const invalidData = {
        title: 'Test Ad',
        content: 'a'.repeat(501),
        imageUrl: 'https://example.com/image.jpg',
      };

      expect(() => createAdSchema.parse(invalidData)).toThrow();
    });
  });

  describe('validateAdMedia', () => {
    it('should return true when imageUrl is provided', () => {
      const data = { imageUrl: 'https://example.com/image.jpg' };
      expect(validateAdMedia(data)).toBe(true);
    });

    it('should return true when youtubeUrl is provided', () => {
      const data = { youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' };
      expect(validateAdMedia(data)).toBe(true);
    });

    it('should return false when neither is provided', () => {
      const data = {};
      expect(validateAdMedia(data)).toBe(false);
    });

    it('should return true when both are provided', () => {
      const data = { 
        imageUrl: 'https://example.com/image.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      };
      expect(validateAdMedia(data)).toBe(true);
    });
  });
});
