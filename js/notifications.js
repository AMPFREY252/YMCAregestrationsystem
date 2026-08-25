/**
 * Notifications (Toast System)
 * ============================
 * Reusable toast notification component. Supports success, error, warning,
 * and info types with auto-dismiss and manual close.
 *
 * Usage:
 *   notify.success('Student registered successfully.');
 *   notify.error('Unable to save student.');
 *   notify.warning('Duplicate phone number found.');
 *   notify.info('Registration updated.');
 */

const notify = {
    containerId: 'notify-container',

    _ensureContainer() {
        let container = document.getElementById(this.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            container.className = 'notify-container';
            document.body.appendChild(container);
        }
        return container;
    },

    _show(type, message, duration = 5000) {
        const container = this._ensureContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.innerHTML = `
            <div class="toast-icon"><i class="fas ${this._icon(type)}"></i></div>
            <div class="toast-content">${message}</div>
            <button class="toast-close" aria-label="Close">&times;</button>
        `;
        container.appendChild(toast);

        // Auto-dismiss
        if (duration > 0) {
            toast._timer = setTimeout(() => this._dismiss(toast), duration);
        }

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => this._dismiss(toast));

        // Slide in
        setTimeout(() => toast.classList.add('show'), 50);

        return toast;
    },

    _icon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    },

    _dismiss(toast) {
        if (toast._timer) clearTimeout(toast._timer);
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    },

    success(message, duration) { return this._show('success', message, duration); },
    error(message, duration) { return this._show('error', message, duration); },
    warning(message, duration) { return this._show('warning', message, duration); },
    info(message, duration) { return this._show('info', message, duration); }
};