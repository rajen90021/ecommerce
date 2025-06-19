import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';


 export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
       const error = new Error('Authorization header is missing or malformed');
       error.statusCode = 401;
         error.name = 'UnauthorizedError';
         error.message = 'Please provide a valid Bearer token in the Authorization header.';
       return next(error);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.userId) {
            const error = new Error('Invalid token payload');
            error.statusCode = 401;
            error.name = 'UnauthorizedError';
            return next(error);
        }
        console.log('Decoded token:', decoded);
        req.user = decoded; // you can access req.user in protected routes
        next();
    } catch (err) {
        const error = new Error('Invalid or expired token');
        error.statusCode = 403;
        error.name = 'ForbiddenError';
        return next(error);
    }
};

// This middleware checks for a valid JWT in the Authorization header