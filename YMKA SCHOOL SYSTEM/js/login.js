/**
 * Login Controller
 * ================
 * Handles staff authentication against IndexedDB-stored users.
 *
 * SECURITY NOTE: This is a prototype. Production should use server-side
 * authentication (PHP sessions) with hashed passwords.
 */

const LoginController = {
    async init() {
        // Auto-focus username field
        const usernameEl = document.getElementById('username');
        usernameEl?.focus();

        // Check if already logged in
        if (auth.isAuthenticated()) {
            window.location.href = 'dashboard.html';
            return;
        }

        // Ensure demo users exist
        await App.init();

        document.getElementById('login-form')?.addEventListener('submit', (e) => this._handleLogin(e));
        document.getElementById('toggle-password')?.addEventListener('click', () => this._togglePassword());
        document.getElementById('remember').checked = true;
    },

    async _handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        const validation = Validator.validateLogin({ username, password });
        if (!validation.valid) {
            Object.keys(validation.errors).forEach(field => {
                const el = document.querySelector('[name="' + field + '"]');
                if (el) {
                    el.classList.add('error');
                    const err = el.parentNode.querySelector('.form-error');
                    if (err) err.textContent = validation.errors[field];
                }
            });
            return;
        }

        // Attempt login
        const user = await auth.login(username, password, remember);
        if (user) {
            notify.success('Login successful. Welcome, ' + user.name + '!');
            window.location.href = 'dashboard.html';
        } else {
            notify.error('Invalid username or password.');
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    },

    _togglePassword() {
        const pwd = document.getElementById('password');
        const icon = document.getElementById('toggle-password').querySelector('i');
        if (pwd.type === 'password') {
            pwd.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            pwd.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => LoginController.init());