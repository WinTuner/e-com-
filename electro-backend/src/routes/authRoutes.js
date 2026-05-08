const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

/**
 * POST /api/register
 * Register a new user
 * Body: {name, email, password}
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * POST /api/login
 * Login user and return JWT token
 * Body: {email, password}
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * POST /api/auth/verify
 * Verify JWT token and return user payload
 * Body: {token} or Header: Authorization: Bearer <token>
 */
router.post('/auth/verify', (req, res) => authController.verify(req, res));

module.exports = router;