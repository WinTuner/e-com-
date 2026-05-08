const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');

const JWT_SECRET = 'electro_2026_secret';

class AuthService {
    /**
     * Register a new user
     * @param {string} name
     * @param {string} email
     * @param {string} password
     * @returns {Promise<Object>}
     * @throws {Error}
     */
    async register(name, email, password) {
        // Validate inputs
        if (!name || !email || !password) {
            throw new Error('All fields are required');
        }

        // Check if email already exists
        const emailExists = await userRepository.emailExists(email);
        if (emailExists) {
            throw new Error('Email already exists');
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in repository
        const userId = await userRepository.create({
            name,
            email,
            password: hashedPassword
        });

        console.log(`✅ [AuthService] New user registered: ${email}`);

        return {
            success: true,
            userId,
            message: 'Registration successful'
        };
    }

    /**
     * Login user and return JWT token
     * @param {string} email
     * @param {string} password
     * @returns {Promise<Object>}
     * @throws {Error}
     */
    async login(email, password) {
        // Validate inputs
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        console.log(`🔍 [AuthService] Login attempt for: ${email}`);

        // Find user by email
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        let isMatch = false;
        let isLegacyMD5 = false;

        // Check bcrypt password (new users or upgraded users)
        if (user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Check MD5 password (legacy users)
            const inputMd5 = crypto.createHash('md5').update(password).digest('hex');
            if (inputMd5 === user.password) {
                isMatch = true;
                isLegacyMD5 = true;
            }
        }

        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        // 🛡️ Security Upgrade: Convert MD5 to Bcrypt
        if (isLegacyMD5) {
            const newHashedPassword = await bcrypt.hash(password, 10);
            await userRepository.updatePassword(user.id, newHashedPassword);
            console.log(`🛡️ [AuthService] Upgraded password to Bcrypt for: ${email}`);
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                name: user.name,
                role: user.role || 'user'
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        console.log(`✅ [AuthService] Login successful: ${email}`);

        return {
            success: true,
            token,
            user: {
                id: user.id,
                userId: user.id,
                firstName: user.name,
                email: user.email
            }
        };
    }

    /**
     * Verify JWT token
     * @param {string} token
     * @returns {Object}
     * @throws {Error}
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
}

module.exports = new AuthService();
