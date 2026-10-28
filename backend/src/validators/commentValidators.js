import { z } from 'zod';

export const commentValidator = z.object({ content: z.string().trim().min(1).max(1000) });
export const commentParamsValidator = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier.') });