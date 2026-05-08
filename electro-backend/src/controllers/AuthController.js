const authService = require('../services/AuthService');

class AuthController {
    /**
     * POST /api/register
     * Register a new user
     */
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            const result = await authService.register(name, email, password);

            return res.status(201).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('❌ [AuthController] Registration error:', error.message);

            // Handle specific error types
            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            if (error.message.includes('required')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * POST /api/login
     * Login user and return JWT token
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            return res.status(200).json(result);
        } catch (error) {
            console.error('❌ [AuthController] Login error:', error.message);

            if (error.message.includes('required')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('Invalid')) {
                return res.status(401).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * POST /api/auth/verify
     * Verify token and return decoded user payload
     */
    async verify(req, res) {
        try {
            const authHeader = req.headers.authorization || '';
            const tokenFromHeader = authHeader.startsWith('Bearer ')
                ? authHeader.split(' ')[1]
                : null;
            const tokenFromBody = req.body ? req.body.token : null;
            const token = tokenFromHeader || tokenFromBody;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Token is required'
                });
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
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    }
}

module.exports = new AuthController();
