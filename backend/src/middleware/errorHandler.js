export function errorHandler(error, _req, res, _next) {
    let status = error.statusCode || 500;
    let message = error.message || 'Internal server error.';
    if (error.name === 'ValidationError') { status = 400; message = Object.values(error.errors).map((item) => item.message).join('; '); }
    if (error.name === 'CastError') { status = 400; message = 'Invalid identifier.'; }
    if (error.type === 'entity.too.large') { status = 413; message = 'Request body is too large.'; }
    if (error.type === 'entity.parse.failed') { status = 400; message = 'Malformed JSON request body.'; }
    if (error.code === 11000) { status = 409; message = 'A record with that value already exists.'; }
    if (status >= 500) {
        console.error(error);
        if (process.env.NODE_ENV === 'production') message = 'Internal server error.';
    }
    if (process.env.NODE_ENV === 'production' && ['ValidationError', 'CastError', 'JsonWebTokenError', 'TokenExpiredError'].includes(error.name)) {
        message = error.name === 'ValidationError' ? 'Invalid request.' : error.name === 'CastError' ? 'Invalid identifier.' : 'Invalid or expired authentication token.';
    }
    res.status(status).json({ success: false, message });
}
