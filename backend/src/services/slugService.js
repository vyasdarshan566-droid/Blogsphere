import slugify from 'slugify';
import { Post } from '../models/Post.js';

export async function createUniquePostSlug(title, excludedId) {
    const base = slugify(title, { lower: true, strict: true }) || 'post';
    let slug = base;
    let suffix = 1;
    while (await Post.exists({ slug, ...(excludedId ? { _id: { $ne: excludedId } } : {}) })) {
        slug = `${base}-${suffix++}`;
    }
    return slug;
}