import { AppError } from '../utils/errors.js';

export function validate(schema, source = 'body') {
    return (req, _res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const message = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
            return next(new AppError(message || 'Invalid request.', 400));
        }
        Object.defineProperty(req, source, { configurable: true, enumerable: true, writable: true, value: result.data });
        next();
    };
}