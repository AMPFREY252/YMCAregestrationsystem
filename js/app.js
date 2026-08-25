/**
 * YMCA Student System - App Bootstrap
 * ===================================
 * Initializes the application, loads config, seeds demo data,
 * and provides auth-guard helpers for protected pages.
 */

const App = {
    APP_NAME: 'YMCA Uganda Student Registration & Management System',
    VERSION: '1.0.0',

    /** Initialize the application. Call on every page that needs setup. */
    async init() {
        await dbService.ready;
        await this._seedIfNeeded();
        this._initGlobalShortcuts();
        return true;
    },

    /** Seed demo data on first run. */
    async _seedIfNeeded() {
        const seeded = await SeedService.isSeeded();
        if (!seeded) {
            await SeedService.seedAll();
        }
    },

    /** Require authentication — redirect to login if not authenticated. */
    requireAuth(allowedRoles = null) {
        const user = auth.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        if (allowedRoles && !auth.hasRole(...allowedRoles)) {
            notify.warning('You do not have permission to access this page.');
            window.location.href = 'dashboard.html';
            return null;
        }
        return user;
    },

    /** Initialize global keyboard shortcuts. */
    _initGlobalShortcuts() {
        // Close modals with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UILibrary.closeModals();
            }
        });
    },

    /** Get the current admin user or null. */
    currentUser() {
        return auth.getCurrentUser();
    },

    /** Initialize theme on page load. */
    initTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    },

    /** Format currency for Uganda Shillings. */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency', currency: 'UGX', minimumFractionDigits: 0
        }).format(amount);
    },

    /** Debounce a function call. */
    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }
};

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    App.initTheme();
    try {
        await App.init();
    } catch (e) {
        console.error('Failed to initialize app:', e);
    }
});