/**
 * Auth Service
 * ============
 * Handles authentication state management for the admin area.
 *
 * SECURITY NOTE:
 * This is a PROTOTYPE. Client-side IndexedDB auth is NOT secure.
 * When migrating to PHP + MySQL:
 *   1. Move authentication to server-side (PHP sessions)
 *   2. Hash passwords with password_hash() / verify with password_verify()
 *   3. Use HTTPS-only, Secure, SameSite cookies
 *   4. Add CSRF tokens on all state-changing endpoints
 *   5. Implement server-side role checks (not just UI hiding)
 *
 * The getCurrentUser() and isAuthenticated() functions here will be replaced
 * by API calls like: fetch('/api/auth/check', { credentials: 'include' })
 */

const auth = {
    SESSION_KEY: 'ymca_session',

    /** Log in a user — store session in sessionStorage (cleared on tab close) */
    async login(username, password) {
        const user = await UsersRepository.authenticate(username, password);
        if (user) {
            const session = { ...user, loggedInAt: Date.now() };
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            // Remember me: persist to localStorage
            if (arguments[2]) {
                localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            } else {
                localStorage.removeItem(this.SESSION_KEY);
            }
            return session;
        }
        return null;
    },

    logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = '/login.html';
    },

    getCurrentUser() {
        const session = sessionStorage.getItem(this.SESSION_KEY) ||
                        localStorage.getItem(this.SESSION_KEY);
        if (!session) return null;
        try {
            const user = JSON.parse(session);
            // Expire after 8 hours
            if (Date.now() - user.loggedInAt > 8 * 60 * 60 * 1000) {
                this.logout();
                return null;
            }
            return user;
        } catch (e) { return null; }
    },

    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    /** Check if current user has required role. Roles: admin > officer > viewer */
    hasRole(...roles) {
        const user = this.getCurrentUser();
        if (!user) return false;
        const roleHierarchy = { administrator: 3, 'registration officer': 2, viewer: 1 };
        const userLevel = roleHierarchy[user.role] || 0;
        return roles.some(r => userLevel >= (roleHierarchy[r] || 0));
    }
};