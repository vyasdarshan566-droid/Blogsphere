import { z } from 'zod';
import { CATEGORIES } from '../models/Post.js';

const postFields = {
    title: z.string().trim().min(5).max(200),
    excerpt: z.string().trim().min(10).max(500),
    content: z.string().min(20).max(100000),
    coverImage: z.string().url().max(2048).optional().or(z.literal('')),
    category: z.enum(CATEGORIES),
    tags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
    status: z.enum(['draft', 'published']).optional(),
};
export const createPostValidator = z.object(postFields);
export const updatePostValidator = z.object(postFields).partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
export const postQueryValidator = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    q: z.string().trim().max(100).optional(),
    search: z.string().trim().max(100).optional(),
    category: z.enum(CATEGORIES).optional(),
    tag: z.string().trim().max(30).optional(),
    tags: z.string().trim().max(300).optional(),
    author: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    status: z.enum(['draft', 'published']).optional(),
    sort: z.enum(['newest', 'oldest', 'popular', 'title']).default('newest'),
});
export const idParamsValidator = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier.') });
export const slugParamsValidator = z.object({ slug: z.string().trim().min(1).max(220) });