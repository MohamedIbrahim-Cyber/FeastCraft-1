import { z } from 'zod';

export const itemOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Option name in English is required'),
  nameAr: z.string().min(1, 'Option name in Arabic is required'),
  priceDelta: z.number().min(0, 'Price delta must be 0 or positive'),
  isDefault: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
});

export const itemOptionGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Option group name in English is required'),
  nameAr: z.string().min(1, 'Option group name in Arabic is required'),
  minSelect: z.number().int().min(0).default(0),
  maxSelect: z.number().int().min(1).default(1),
  isRequired: z.boolean().default(false),
  options: z.array(itemOptionSchema).min(1, 'Option group must have at least one choice'),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'English name must be at least 2 characters'),
  nameAr: z.string().min(2, 'Arabic name must be at least 2 characters'),
  description: z.string().min(5, 'English description is required'),
  descriptionAr: z.string().min(5, 'Arabic description is required'),
  imageUrl: z.string().url('A valid image URL is required'),
  basePrice: z.number().positive('Base price must be greater than 0'),
  prepTimeMinutes: z.number().int().positive().default(15),
  calories: z.number().int().positive().optional(),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  isVegetarian: z.boolean().default(false),
  optionGroups: z.array(itemOptionGroupSchema).optional().default([]),
});

export const updateMenuItemSchema = createMenuItemSchema.partial().extend({
  id: z.string().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, 'English category name is required'),
  nameAr: z.string().min(2, 'Arabic category name is required'),
  slug: z.string().min(2, 'Category slug is required'),
  icon: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const toggleAvailabilitySchema = z.object({
  isAvailable: z.boolean().optional(),
});

export const updatePriceSchema = z.object({
  price: z.number().positive('Price must be greater than 0'),
});
