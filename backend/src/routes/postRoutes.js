import { Router } from 'express';
import {
    getPosts,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    getMyPosts,
    getFeaturedPosts,
} from '../controllers/postController.js';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { requireCsrf } from '../utils/csrf.js';
import { addComment, getComments } from '../controllers/commentController.js';
import { commentValidator } from '../validators/commentValidators.js';
import {
    createPostValidator,
    idParamsValidator,
    postQueryValidator,
    slugParamsValidator,
    updatePostValidator,
} from '../validators/postValidators.js';

const router = Router();
router.get('/', validate(postQueryValidator, 'query'), getPosts);
router.get('/featured', getFeaturedPosts);
router.get('/my', authenticate, validate(postQueryValidator, 'query'), getMyPosts);
router.get('/:id/comments', validate(idParamsValidator, 'params'), getComments);
router.post('/:id/comments', authenticate, requireCsrf, validate(idParamsValidator, 'params'), validate(commentValidator), addComment);
router.post('/', authenticate, requireCsrf, validate(createPostValidator), createPost);
router.patch('/:id', authenticate, requireCsrf, validate(idParamsValidator, 'params'), validate(updatePostValidator), updatePost);
router.put('/:id', authenticate, requireCsrf, validate(idParamsValidator, 'params'), validate(updatePostValidator), updatePost);
router.delete('/:id', authenticate, requireCsrf, validate(idParamsValidator, 'params'), deletePost);
router.get('/:slug', optionalAuthenticate, validate(slugParamsValidator, 'params'), getPostBySlug);

export default router;
