import { z } from 'zod';

/**
 * Sanitizes input string to remove HTML tags, script injection, and control characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control characters
    .trim();
}

const sanitizedString = (minLen = 1, maxLen = 500) =>
  z
    .string()
    .min(minLen)
    .max(maxLen)
    .transform((val) => sanitizeString(val));

export const lockSlotSchema = z
  .object({
    serviceStyleId: sanitizedString(1, 100).optional(),
    venueId: sanitizedString(1, 100).optional(),
    deliveryZoneId: sanitizedString(1, 100).optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid ISO date format required (YYYY-MM-DD)',
    }),
    timeSlot: sanitizedString(1, 150).optional(),
    servingTimeSlot: sanitizedString(1, 150).optional(),
    setupTimeSlot: sanitizedString(1, 150).optional(),
    guestCount: z.number().int().min(1).max(5000).optional().default(50),
    customerName: sanitizedString(1, 150).optional().default('Prospective Host'),
    customerEmail: z.string().email().max(150).optional().default('hold@feastcraft.com'),
    customerPhone: sanitizedString(6, 40).optional().default('+20 100 000 0000'),
    customerAddress: sanitizedString(0, 300).optional(),
    // Any injected monetary values are explicitly stripped
    totalAmount: z.any().optional(),
    deposit: z.any().optional(),
    depositRequired: z.any().optional(),
  })
  .strip()
  .transform((data) => {
    // Explicitly delete any monetary properties
    const copy = { ...data };
    delete (copy as any).totalAmount;
    delete (copy as any).deposit;
    delete (copy as any).depositRequired;
    return copy;
  });

export type LockSlotInput = z.infer<typeof lockSlotSchema>;

export const selectedItemSchema = z
  .object({
    id: sanitizedString(1, 100),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(5000).default(1),
    // Explicitly strip any client-supplied unitPrice or total
    unitPrice: z.any().optional(),
    price: z.any().optional(),
    total: z.any().optional(),
  })
  .strip()
  .transform((data) => {
    const copy = { ...data };
    delete (copy as any).unitPrice;
    delete (copy as any).price;
    delete (copy as any).total;
    return copy;
  });

export const customerInfoSchema = z
  .object({
    name: sanitizedString(2, 120),
    email: z.string().email('Please provide a valid email address').max(150),
    phone: sanitizedString(6, 40),
    address: sanitizedString(2, 300).optional(),
    notes: sanitizedString(0, 1000).optional(),
  })
  .strip();

export const createBookingSchema = z
  .object({
    serviceStyleId: sanitizedString(1, 100).optional(),
    venueId: sanitizedString(1, 100).optional(),
    deliveryZoneId: sanitizedString(1, 100).optional(),
    eventType: sanitizedString(1, 50).optional().default('WEDDING'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid ISO date format required (YYYY-MM-DD)',
    }),
    timeSlot: sanitizedString(1, 150).optional(),
    servingTimeSlot: sanitizedString(1, 150).optional(),
    setupTimeSlot: sanitizedString(1, 150).optional(),
    guestCount: z.number().int().min(1, 'Guest count must be at least 1 guest').max(5000),
    selectedItemIds: z
      .array(selectedItemSchema)
      .min(1, 'At least one menu item must be selected for catering'),
    customerInfo: customerInfoSchema,
    slotToken: sanitizedString(1, 100).optional(),
    // Client-submitted price tamper fields stripped completely
    totalAmount: z.any().optional(),
    depositRequired: z.any().optional(),
    depositPaid: z.any().optional(),
    baseSubtotal: z.any().optional(),
    discountAmount: z.any().optional(),
    discountPercentage: z.any().optional(),
    unitPrice: z.any().optional(),
  })
  .strip()
  .transform((data) => {
    const copy = { ...data };
    delete (copy as any).totalAmount;
    delete (copy as any).depositRequired;
    delete (copy as any).depositPaid;
    delete (copy as any).baseSubtotal;
    delete (copy as any).discountAmount;
    delete (copy as any).discountPercentage;
    delete (copy as any).unitPrice;
    return copy;
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const credentialsAuthSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const magicLinkRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'concierge', 'customer']).optional().default('admin'),
});

