/**
 * UI Components Library
 * =====================
 * Reusable UI components for the YMCA system:
 * - AdminLayout: renders the sidebar + header on admin pages
 * - Modal: confirmation and form dialogs
 * - Table: responsive data tables
 * - Pagination: pagination controls
 * - Loading / Empty / Skeleton states
 * - Form helpers
 */

const UILibrary = {

    /** Render the admin sidebar and header HTML. */
    renderAdminLayout(user) {
        const sidebar = `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-brand">
                                                <img src="assets/images/ymca-logo.jpg" alt="YMCA Uganda" onerror="this.onerror=null;this.src='assets/images/ymca-logo.svg';">
                <span>YMCA Uganda</span>
                <span>YMCA Uganda</span>
            </div>
            <nav class="sidebar-nav">
                <a href="dashboard.html" class="nav-link" data-page="dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                <a href="students.html" class="nav-link" data-page="students"><i class="fas fa-user-graduate"></i> Students</a>
                <a href="register.html" class="nav-link" data-page="register"><i class="fas fa-user-plus"></i> Register Student</a>
                <a href="programs.html" class="nav-link" data-page="programs"><i class="fas fa-book"></i> Programs</a>
                <a href="departments.html" class="nav-link" data-page="departments"><i class="fas fa-building"></i> Departments</a>
                <a href="reports.html" class="nav-link" data-page="reports"><i class="fas fa-chart-bar"></i> Reports</a>
                <a href="settings.html" class="nav-link" data-page="settings"><i class="fas fa-cog"></i> Settings</a>
                <a href="#" class="nav-link" id="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </nav>
        </aside>`;

        const header = `
        <header class="admin-header">
            <div class="header-left">
                <button class="menu-toggle" id="menu-toggle" aria-label="Toggle navigation"><i class="fas fa-bars"></i></button>
                <nav class="breadcrumb" id="breadcrumb"></nav>
            </div>
            <div class="header-right">
                <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode"><i class="fas fa-moon"></i></button>
                <div class="user-menu" id="user-menu">
                    <span class="user-name">${user ? user.name : 'Administrator'}</span>
                    <i class="fas fa-user-circle"></i>
                </div>
            </div>
        </header>`;

        return { sidebar, header };
    },

        /** Insert admin layout into the page. */
    initAdminLayout(user) {
        const layout = this.renderAdminLayout(user);
        let wrapper = document.querySelector('.admin-wrapper');
        if (!wrapper) {
            document.body.insertAdjacentHTML('afterbegin', '<div class="admin-wrapper">' + layout.sidebar + layout.header + '<main class="admin-content"></main></div>');
        } else {
            // Check if sidebar/header already exist
            if (!wrapper.querySelector('.sidebar')) {
                const mainEl = wrapper.querySelector('main.admin-content') || wrapper.querySelector('.admin-content');
                if (mainEl) {
                    mainEl.insertAdjacentHTML('beforebegin', layout.sidebar + layout.header);
                } else {
                    wrapper.insertAdjacentHTML('afterbegin', layout.sidebar + layout.header);
                }
            }
        }
        // Mark active nav link
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        document.querySelectorAll('.sidebar-nav .nav-link[data-page]').forEach(link => {
            if (link.dataset.page === currentPage) link.classList.add('active');
        });
        document.getElementById('logout-link')?.addEventListener('click', (e) => {
            e.preventDefault(); auth.logout();
        });
        document.getElementById('menu-toggle')?.addEventListener('click', () => {
            document.querySelector('.sidebar')?.classList.toggle('open');
        });
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());
        this.initTheme();
    },

    toggleTheme() {
        const current = localStorage.getItem('theme') || 'light';
        const next = current === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', next);
        document.documentElement.setAttribute('data-theme', next);
        const icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    },

    initTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    },

    setBreadcrumb(items) {
        const bc = document.getElementById('breadcrumb');
        if (!bc) return;
        bc.innerHTML = items.map((item, i) =>
            `<span class="bc-item ${i === items.length - 1 ? 'active' : ''}">${item}</span>`
        ).join('<i class="fas fa-chevron-right bc-separator"></i>');
    },

    /** Show a confirmation modal. Returns a promise that resolves to true/false. */
    confirm(options) {
        return new Promise((resolve) => {
            const {
                title = 'Confirm Action',
                message = 'Are you sure?',
                confirmText = 'Confirm',
                cancelText = 'Cancel',
                type = 'danger'
            } = options;

            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal modal-confirm">
                    <div class="modal-header">
                        <i class="fas fa-${type === 'danger' ? 'exclamation-triangle' : 'info-circle'} modal-icon"></i>
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body"><p>${message}</p></div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                        <button class="btn btn-${type}" data-action="confirm">${confirmText}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const cleanup = () => overlay.remove();
            overlay.querySelector('[data-action="confirm"]').onclick = () => { cleanup(); resolve(true); };
            overlay.querySelector('[data-action="cancel"]').onclick = () => { cleanup(); resolve(false); };
                        overlay.onclick = (e) => { if (e.target === overlay) { cleanup(); resolve(false); }; };
        });
    },

    /** Render a responsive data table. */
    renderTable(config) {
        const { columns, rows, actions, rowClass, emptyMessage = 'No records found.', searchable = true } = config;
        const tableId = 'table-' + Date.now();

        let thead = '<thead><tr>';
        columns.forEach(c => {
            thead += `<th ${c.sortKey ? `data-sort="${c.sortKey}"` : ''} ${c.align ? `style="text-align:${c.align}"` : ''}>${c.label}</th>`;
        });
        if (actions) thead += '<th class="no-sort">Actions</th>';
        thead += '</tr></thead>';

        let tbody = '<tbody>';
        if (rows.length === 0) {
            tbody += `<tr><td colspan="${columns.length + (actions ? 1 : 0)}" class="empty-cell">
                <div class="empty-state"><i class="fas fa-info-circle"></i><p>${emptyMessage}</p></div></td></tr>`;
        } else {
            rows.forEach(row => {
                                tbody += `<tr ${rowClass ? `class="${rowClass(row)}"` : ''}>`;
                columns.forEach(c => {
                    let val = c.render ? c.render(row[c.key], row) : (row[c.key] !== undefined ? row[c.key] : '');
                    if (c.type === 'status') {
                        val = `<span class="badge badge-${val}">${val}</span>`;
                    } else if (c.type === 'date') {
                        val = this.formatDate(val);
                    } else if (c.type === 'name') {
                        val = `<strong class="student-name">${val}</strong>`;
                    }
                    tbody += `<td ${c.align ? `style="text-align:${c.align}"` : ''}>${val}</td>`;
                });
                if (actions) {
                    tbody += '<td class="actions-cell">';
                    actions.forEach(a => {
                        tbody += `<button class="btn-icon btn-${a.style || 'primary'}" title="${a.title}" ${a.disabled ? 'disabled' : ''} onclick="${a.onclick(row)}"><i class="${a.icon}"></i></button>`;
                    });
                    tbody += '</td>';
                }
                tbody += '</tr>';
            });
        }
        tbody += '</tbody>';

                return `<div class="table-wrapper"><table class="table" id="${tableId}">${thead}${tbody}</table></div>`;
    },

    /** Render pagination controls. */
    renderPagination(containerId, currentPage, totalPages, onPageChange, extra = '') {
        let html = '<div class="pagination-wrapper">';
        html += `<div class="pagination-info">${extra}</div>`;
        html += '<div class="pagination-controls">';
        if (totalPages <= 1) {
            html += '<span class="pagination-pages">1 page</span>';
        } else {
            html += `<button class="btn btn-sm btn-secondary" ${currentPage <= 1 ? 'disabled' : ''} onclick="${onPageChange(currentPage - 1)}"><i class="fas fa-chevron-left"></i></button>`;
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                    html += `<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline'}" onclick="${onPageChange(i)}">${i}</button>`;
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                    html += '<span class="btn btn-sm btn-disabled">…</span>';
                }
            }
            html += `<button class="btn btn-sm btn-secondary" ${currentPage >= totalPages ? 'disabled' : ''} onclick="${onPageChange(currentPage + 1)}"><i class="fas fa-chevron-right"></i></button>`;
        }
        html += '</div></div>';
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = html;
    },

    formatDate(dateString) {
        if (!dateString) return '-';
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    formatDateTime(dateString) {
        if (!dateString) return '-';
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    },

    /** Show a loading spinner overlay inside a container. */
    showLoading(containerId, message = 'Loading...') {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>${message}</p></div>`;
    },

    /** Show an empty state in a container. */
    showEmpty(containerId, title = 'No records found', actionText = '', actionHref = '#') {
        const el = document.getElementById(containerId);
        if (!el) return;
        const actionBtn = actionText ? `<a href="${actionHref}" class="btn btn-primary"><i class="fas fa-plus"></i> ${actionText}</a>` : '';
        el.innerHTML = `<div class="empty-state"><i class="fas fa-info-circle"></i><h3>${title}</h3>${actionBtn}</div>`;
    },

    /** Show a skeleton loader. */
        showSkeleton(containerId, rows = 5) {
        const el = document.getElementById(containerId);
        if (!el) return;
        let html = '';
        for (let i = 0; i < rows; i++) { html += '<div class="skeleton-row"></div>'; }
        el.innerHTML = html;
    },

    /** Show a form modal for adding/editing records. */
    showFormModal(options) {
        return new Promise((resolve) => {
            const { title, fields, submitText = 'Save', cancelText = 'Cancel', size = 'md' } = options;
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            let formFields = '';
            fields.forEach(f => {
                const req = f.required ? 'required' : '';
                const errId = 'error-' + f.name;
                if (f.type === 'select') {
                    formFields += '<div class="form-group"><label for="' + f.name + '">' + f.label + '</label><select id="' + f.name + '" name="' + f.name + '" ' + req + '>' + f.options.map(o => '<option value="' + o.value + '">' + o.label + '</option>').join('') + '</select><span class="form-error" id="' + errId + '"></span></div>';
                } else if (f.type === 'textarea') {
                    formFields += '<div class="form-group"><label for="' + f.name + '">' + f.label + '</label><textarea id="' + f.name + '" name="' + f.name + '" rows="3" ' + req + '></textarea><span class="form-error" id="' + errId + '"></span></div>';
                } else {
                    formFields += '<div class="form-group"><label for="' + f.name + '">' + f.label + '</label><input type="' + (f.type || 'text') + '" id="' + f.name + '" name="' + f.name + '" ' + req + '><span class="form-error" id="' + errId + '"></span></div>';
                }
            });
            overlay.innerHTML = '<div class="modal modal-' + size + '"><div class="modal-header"><h3>' + title + '</h3><button class="modal-close">&times;</button></div><div class="modal-body"><form id="form-modal-form">' + formFields + '</form></div><div class="modal-footer"><button class="btn btn-secondary" data-action="cancel">' + cancelText + '</button><button class="btn btn-primary" data-action="submit">' + submitText + '</button></div></div>';
            document.body.appendChild(overlay);
            overlay.querySelector('[data-action="cancel"]').onclick = () => { overlay.remove(); resolve(null); };
            overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); resolve(null); };
            overlay.querySelector('[data-action="submit"]').onclick = (e) => {
                e.preventDefault();
                const fd = new FormData(document.getElementById('form-modal-form'));
                const vals = {};
                for (const [k, v] of fd.entries()) vals[k] = v;
                overlay.remove(); resolve(vals);
            };
        });
    },

        closeModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.remove()); },

    exportCSV(headers, rows, filename) {
        const csvContent = [headers.join(','), ...rows.map(r => r.map(c => this._csvCell(c)).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename + '.csv';
        a.click(); URL.revokeObjectURL(url);
        notify.info(filename + '.csv exported.');
    },

    _csvCell(val) {
        if (val === null || val === undefined) return '';
        const s = String(val);
        return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
    },

    escapeHtml(str) { if (!str) return ''; const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
};