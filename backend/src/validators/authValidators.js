import { z } from 'zod';

export const registerValidator = z.object({
    name: z.string().trim().min(2).max(60),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    password: z.string().min(12).max(128).regex(/[A-Z]/, 'Password must contain an uppercase letter').regex(/[a-z]/, 'Password must contain a lowercase letter').regex(/[0-9]/, 'Password must contain a number'),
    bio: z.string().max(300).optional(),
    avatar: z.string().url().max(2048).optional().or(z.literal('')),
});
export const loginValidator = z.object({
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z.string().min(1).max(128),
});