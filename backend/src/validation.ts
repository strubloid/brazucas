import { z } from 'zod';
import { UserRole } from './types';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  nickname: z
    .string()
    .min(2, 'Nickname must be at least 2 characters')
    .max(50, 'Nickname must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_\s]+$/, 'Nickname can only contain letters, numbers, underscores, and spaces'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  role: z.nativeEnum(UserRole),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createNewsSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(10000, 'Content must be less than 10000 characters'),
  excerpt: z
    .string()
    .min(1, 'Excerpt is required')
    .max(300, 'Excerpt must be less than 300 characters'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('').transform(() => undefined)),
  published: z.boolean().optional().default(false),
});

export const updateNewsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid news ID'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(10000, 'Content must be less than 10000 characters')
    .optional(),
  excerpt: z
    .string()
    .min(1, 'Excerpt is required')
    .max(300, 'Excerpt must be less than 300 characters')
    .optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('').transform(() => undefined)),
  published: z.boolean().optional(),
});

export const createAdvertisementSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  price: z
    .string()
    .min(1, 'Price is required')
    .max(20, 'Price must be less than 20 characters'),
  contactEmail: z.string().email('Invalid email format'),
  published: z.boolean().default(false),
});

export const updateAdvertisementSchema = createAdvertisementSchema.extend({
  id: z.string().min(1, 'Advertisement ID is required'),
});
