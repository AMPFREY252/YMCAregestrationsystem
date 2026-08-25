/**
 * Users Repository
 * ================
 * Data access layer for staff/user accounts.
 *
 * SECURITY NOTE:
 * In this prototype, passwords are stored in plaintext in IndexedDB.
 * THIS IS NOT SECURE FOR PRODUCTION. When migrating to PHP + MySQL,
 * replace this with:
 *   - Password hashing (password_hash / password_verify)
 *   - Server-side session management (PHP sessions)
 *   - Secure HTTPS-only cookies
 *   - CSRF tokens on all state-changing requests
 */

const UsersRepository = {
    STORE: 'users',

    async getAll() {
        return await dbService.getAll(this.STORE);
    },

    async get(id) {
        return await dbService.get(this.STORE, id);
    },

    async getByUsername(username) {
        return await dbService.getByIndex(this.STORE, 'username', username);
    },

    async getByRole(role) {
        return await dbService.getByIndexAll(this.STORE, 'role', role);
    },

    async add(user) {
        user.createdAt = new Date().toISOString();
        user.updatedAt = user.createdAt;
        return await dbService.add(this.STORE, user);
    },

    async update(user) {
        user.updatedAt = new Date().toISOString();
        return await dbService.put(this.STORE, user);
    },

    async delete(id) {
        return await dbService.delete(this.STORE, id);
    },

    /** Simple client-side auth check — NOT SECURE. Replace with server auth. */
    async authenticate(username, password) {
        const user = await this.getByUsername(username);
        if (!user) return null;
        // TODO: Replace with server-side password verification (PHP: password_verify)
        if (user.password === password) {
            return { id: user.id, username: user.username, role: user.role, name: user.name };
        }
        return null;
    },

    async count() {
        return await dbService.count(this.STORE);
    },

    async seed() {
        // Create a demo admin account if none exists
        const existing = await this.getByUsername('admin');
        if (!existing) {
            await this.add({
                username: 'admin',
                password: 'admin123',  // DEMO ONLY — replace with hashed passwords in PHP
                role: 'administrator',
                name: 'System Administrator',
                email: 'admin@ymca.ug'
            });
        }
    },

    async getByRolePaginated(role, page = 1, perPage = 15) {
        let results = await this.getByRole(role);
        if (arguments[1] && typeof arguments[1] === 'object') {
            // Overload: getByRolePaginated(options, page, perPage)
            page = arguments[2] || 1;
            perPage = arguments[3] || 15;
        }
        const total = results.length;
        const totalPages = Math.ceil(total / perPage);
        const start = (page - 1) * perPage;
        return { data: results.slice(start, start + perPage), total, totalPages, page };
    }
};