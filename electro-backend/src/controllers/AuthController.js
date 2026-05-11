const authService = require('../services/AuthService');

class AuthController {
    /**
     * POST /api/register
     * Register a new user
     */
    async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const result = await authService.register(name, email, password);

            return res.status(201).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/login
     * Login user and return JWT token
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/verify
     * Verify token and return decoded user payload
     */
    async verify(req, res, next) {
        try {
            const authHeader = req.headers.authorization || '';
            const tokenFromHeader = authHeader.startsWith('Bearer ')
                ? authHeader.split(' ')[1]
                : null;
            const tokenFromBody = req.body ? req.body.token : null;
            const token = tokenFromHeader || tokenFromBody;

            if (!token) {
                const error = new Error('Token is required');
                error.statusCode = 400;
                throw error;
            }

            const decodedUser = authService.verifyToken(token);

            return res.status(200).json({
                success: true,
                user: {
                    userId: decodedUser.userId,
                    email: decodedUser.email,
                    name: decodedUser.name,
                    role: decodedUser.role
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
