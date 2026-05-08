const express = require('express');
const router = express.Router();
const orderService = require('../services/OrderService');
const authGatewayService = require('../services/AuthGatewayService');

/**
 * POST /api/checkout
 * Process order checkout
 * Headers: Authorization: Bearer <token>
 * Body: {cart, email, creditCard}
 */
router.post('/checkout', async (req, res) => {
    try {
        // Extract and verify JWT token
        const authHeader = req.headers.authorization || '';
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Please login first.',
                clearCart: false
            });
        }

        const token = authHeader.split(' ')[1];
        let decodedUser;

        try {
            decodedUser = await authGatewayService.verifyUser(req, token);
        } catch (error) {
            if (error.statusCode === 401 || error.statusCode === 400) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token',
                    clearCart: false
                });
            }

            console.error('❌ [CheckoutRoute] Auth service unavailable:', error.message);
            return res.status(503).json({
                success: false,
                message: 'Auth service unavailable. Please try again later.',
                clearCart: false
            });
        }

        // Validate request body
        const { cart, email, creditCard } = req.body;

        if (!Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Checkout rejected: Your cart is empty.',
                clearCart: false
            });
        }

        // Validate email matches token
        if (!email || !orderService.validateEmailMatch(email, decodedUser)) {
            console.warn(`⚠️ [CheckoutRoute] Email mismatch: ${email} vs ${decodedUser.email}`);
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Email does not match your account',
                clearCart: false
            });
        }

        // Validate credit card
        if (!orderService.validateCreditCard(creditCard)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credit card number',
                clearCart: false
            });
        }

        // Process checkout
        const result = await orderService.processCheckout(
            { userId: decodedUser.userId, email: decodedUser.email },
            cart,
            creditCard
        );

        return res.status(201).json({
            success: true,
            message: result.message,
            orderId: result.orderId,
            totalAmount: result.totalAmount,
            clearCart: true
        });

    } catch (error) {
        console.error('❌ [CheckoutRoute] Unexpected error:', error);

        // Handle specific error messages
        if (error.message.includes('empty')) {
            return res.status(400).json({
                success: false,
                message: error.message,
                clearCart: false
            });
        }

        if (error.message.includes('Invalid credit card')) {
            return res.status(400).json({
                success: false,
                message: error.message,
                clearCart: false
            });
        }

        if (error.message.includes('no longer available')) {
            return res.status(400).json({
                success: false,
                message: error.message,
                clearCart: false
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal Server Error: Failed to process checkout',
            clearCart: false
        });
    }
});

module.exports = router;