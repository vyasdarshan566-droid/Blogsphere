import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2).max(60),
    email: z.string().email(),
    password: z
        .string()
        .min(8)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    bio: z.string().max(300).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const postSchema = z.object({
    title: z.string().min(5).max(200),
    excerpt: z.string().min(10).max(500),
    content: z.string().min(20),
    coverImage: z.string().url().optional().or(z.literal('')),
    category: z.enum([
        'Technology',
        'Programming',
        'Design',
        'Business',
        'Science',
        'Health',
        'Travel',
        'Food',
        'Lifestyle',
        'Other',
    ]),
    tags: z.array(z.string().max(30)).max(10).optional(),
    status: z.enum(['draft', 'published']).optional(),
});

export const commentSchema = z.object({
    content: z.string().min(1).max(1000),
});

export const updateProfileSchema = z.object({
    name: z.string().min(2).max(60).optional(),
    bio: z.string().max(300).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
});

export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const msg = result.error.errors.map((e) => e.message).join(', ');
        return res.status(400).json({ success: false, message: msg });
    }
    req.body = result.data;
    next();
};
