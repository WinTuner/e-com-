class AuthGatewayService {
    constructor() {
        this.authServiceUrl = process.env.AUTH_SERVICE_URL || null;
    }

    getBaseUrl(req) {
        if (this.authServiceUrl) {
            return this.authServiceUrl;
        }
        return `${req.protocol}://${req.get('host')}`;
    }

    async verifyUser(req, token) {
        const endpoint = `${this.getBaseUrl(req)}/api/auth/verify`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token })
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            const message = payload.message || 'Auth service rejected token';
            const error = new Error(message);
            error.statusCode = response.status;
            throw error;
        }

        return payload.user;
    }
}

module.exports = new AuthGatewayService();
