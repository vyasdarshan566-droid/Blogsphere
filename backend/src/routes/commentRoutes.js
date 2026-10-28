import { Router } from 'express';
import { addComment, deleteComment, getComments } from '../controllers/commentController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { requireCsrf } from '../utils/csrf.js';
import { commentParamsValidator, commentValidator } from '../validators/commentValidators.js';
import { idParamsValidator } from '../validators/postValidators.js';

const router = Router();
router.get('/posts/:id/comments', validate(idParamsValidator, 'params'), getComments);
router.post('/posts/:id/comments', authenticate, requireCsrf, validate(idParamsValidator, 'params'), validate(commentValidator), addComment);
router.post('/post/:postId', authenticate, requireCsrf, validate(commentValidator), (req, _res, next) => {
    req.params.id = req.params.postId;
    next();
}, addComment);
router.delete('/:id', authenticate, requireCsrf, validate(commentParamsValidator, 'params'), deleteComment);

export default router;
