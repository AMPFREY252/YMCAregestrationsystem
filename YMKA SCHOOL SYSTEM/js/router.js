/**
 * Router / Navigation Helper
 * ==========================
 * Lightweight multi-page navigation manager. Each admin screen is its own
 * HTML file; this module centralizes page detection and programmatic
 * navigation so links never need hardcoding in controllers.
 */
const Router = {
    ADMIN_PAGES: ['dashboard', 'students', 'register', 'programs', 'departments', 'reports', 'settings'],

    /** Get the current page name (filename without .html). */
    currentPage() {
        return window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    },

    isAdminPage() {
        return this.ADMIN_PAGES.includes(this.currentPage());
    },

    /** Navigate to a page with optional query params. */
    go(page, params = {}) {
        const qs = new URLSearchParams(params).toString();
        window.location.href = page + '.html' + (qs ? '?' + qs : '');
    },

    /** Auth guard passthrough for protected pages. */
    requireAdminAuth(roles) {
        return App.requireAuth(roles);
    }
};