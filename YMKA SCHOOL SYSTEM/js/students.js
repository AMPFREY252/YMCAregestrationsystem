const StudentsController = {
    currentPage: 1,
    perPage: 10,
    sortBy: 'createdAt',
    sortDir: 'desc',
    filters: {},

    async init(user) {
        UILibrary.initAdminLayout(user);
        UILibrary.setBreadcrumb(['Dashboard', 'Students']);
        this._setupFilterListeners();
        this._setupExportButtons();
        await this._loadProgramsForFilter();
        await this._loadDepartmentsForFilter();
        await this._loadStudents();
    },

    _setupFilterListeners() {
        const searchInput = document.getElementById('search-input');
        searchInput?.addEventListener('input', App.debounce(() => { this.currentPage = 1; this._loadStudents(); }, 300));
        ['filter-program', 'filter-department', 'filter-gender', 'filter-status', 'filter-session', 'filter-intake'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => { this.currentPage = 1; this._applyFilters(); this._loadStudents(); });
        });
        document.getElementById('clear-filters')?.addEventListener('click', () => {
            ['filter-program', 'filter-department', 'filter-gender', 'filter-status', 'filter-session', 'filter-intake'].forEach(id => {
                const el = document.getElementById(id); if (el) el.value = '';
            });
            this.filters = {}; this.currentPage = 1; this._loadStudents();
        });
    },

    _setupExportButtons() {
        document.getElementById('export-csv')?.addEventListener('click', () => this._exportCSV());
        document.getElementById('export-json')?.addEventListener('click', () => this._exportJSON());
    },

    _applyFilters() {
        this.filters = {};
        const map = { 'filter-program': 'program', 'filter-department': 'department', 'filter-gender': 'gender', 'filter-status': 'status', 'filter-session': 'academicSession', 'filter-intake': 'intake' };
        Object.keys(map).forEach(id => {
            const el = document.getElementById(id);
            if (el && el.value) this.filters[map[id]] = el.value;
        });
    },

    async _loadProgramsForFilter() {
        const programs = await ProgramsRepository.getActive();
        const el = document.getElementById('filter-program');
        if (el) {
            let html = '<option value="">All Programs</option>';
            programs.forEach(p => html += '<option value="' + p.name + '">' + p.name + '</option>');
            el.innerHTML = html;
        }
    },

        async _loadDepartmentsForFilter() {
        const departments = await DepartmentsRepository.getActive();
        const el = document.getElementById('filter-department');
        if (el) {
            let html = '<option value="">All Departments</option>';
            departments.forEach(d => html += '<option value="' + d.name + '">' + d.name + '</option>');
            el.innerHTML = html;
        }
    },

    async _loadStudents() {
        const container = document.getElementById('students-table');
        UILibrary.showLoading('students-table', 'Loading students...');
        try {
            const search = document.getElementById('search-input')?.value || '';
            const options = { search, ...this.filters, sortBy: this.sortBy, sortDir: this.sortDir };
            const result = await StudentsRepository.paginated(options, this.currentPage, this.perPage);
            if (result.data.length === 0) {
                UILibrary.showEmpty('students-table', 'No students found', 'Register Student', 'register.html');
            } else {
                let html = '<div class="table-wrapper"><table class="table"><thead><tr>'
                    + '<th data-sort-key="registrationNumber">Reg. Number</th>'
                    + '<th data-sort-key="firstName">Student Name</th>'
                    + '<th data-sort-key="program">Program</th>'
                    + '<th>Phone</th>'
                    + '<th data-sort-key="createdAt">Registered</th>'
                    + '<th>Status</th><th>Actions</th></tr></thead><tbody>';
                result.data.forEach(s => {
                    html += '<tr><td>' + UILibrary.escapeHtml(s.registrationNumber || '-') + '</td><td><strong>' + UILibrary.escapeHtml(s.firstName + ' ' + s.lastName) + '</strong></td><td>' + UILibrary.escapeHtml(s.program || '-') + '</td><td>' + UILibrary.escapeHtml(s.phone || '-') + '</td><td>' + UILibrary.formatDate(s.createdAt) + '</td><td><span class="badge badge-' + (s.status || 'pending') + '">' + (s.status || 'pending') + '</span></td><td class="actions-cell">';
                    html += '<button class="btn-icon btn-primary" title="View" onclick="viewStudent(' + s.id + ')"><i class="fas fa-eye"></i></button>';
                    html += '<button class="btn-icon btn-warning" title="Edit" onclick="editStudent(' + s.id + ')"><i class="fas fa-edit"></i></button>';
                    html += '<button class="btn-icon btn-secondary" title="Print Record" onclick="printStudent(' + s.id + ')"><i class="fas fa-print"></i></button>';
                    html += '<button class="btn-icon btn-danger" title="Delete" onclick="deleteStudent(' + s.id + ')"><i class="fas fa-trash"></i></button>';
                    html += '</td></tr>';
                });
                html += '</tbody></table></div>';
                container.innerHTML = html;
                this._bindSortHandlers(container);
            }
            const info = '<span class="pagination-total">' + result.total + ' students</span>';
            UILibrary.renderPagination('pagination-container', result.page, result.totalPages, (p) => { this.currentPage = p; this._loadStudents(); }, info);
        } catch (e) {
            container.innerHTML = '<p class="error-text">Failed to load students.</p>';
        }
    },

    /** Attach click-to-sort behaviour to table headers (spec §10). */
    _bindSortHandlers(container) {
        const self = this;
        container.querySelectorAll('th[data-sort-key]').forEach(th => {
            const key = th.getAttribute('data-sort-key');
            if (key === self.sortBy) th.classList.add(self.sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
            th.style.cursor = 'pointer';
            th.setAttribute('title', 'Click to sort');
            th.addEventListener('click', () => {
                if (self.sortBy === key) {
                    self.sortDir = (self.sortDir === 'asc') ? 'desc' : 'asc';
                } else {
                    self.sortBy = key;
                    self.sortDir = 'asc';
                }
                self._loadStudents();
            });
        });
    },

    async _exportCSV() {
        const students = await StudentsRepository.getAll();
        const headers = ['Registration #', 'Name', 'Program', 'Gender', 'Phone', 'Email', 'Status', 'Registration Date'];
        const rows = students.map(s => [s.registrationNumber, (s.firstName + ' ' + s.lastName).trim(), s.program, s.gender, s.phone, s.email, s.status, UILibrary.formatDate(s.createdAt)]);
        UILibrary.exportCSV(headers, rows, 'YMCA_Students_' + new Date().getFullYear());
    },

    async _exportJSON() {
        const students = await StudentsRepository.getAll();
        const blob = new Blob([JSON.stringify({ count: students.length, exportDate: new Date().toISOString(), students }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'ymca_students_export.json';
        a.click(); URL.revokeObjectURL(url);
        notify.info('Student data exported as JSON.');
    }
};

function viewStudent(id) { window.location.href = 'student-profile.html?id=' + id; }
function printStudent(id) { window.location.href = 'print-registration.html?id=' + id; }
function editStudent(id) { window.location.href = 'student-profile.html?id=' + id + '&edit=true'; }
async function deleteStudent(id) {
    const confirmed = await UILibrary.confirm({ title: 'Delete Student?', message: 'This action cannot be undone. All data will be permanently removed.', type: 'danger' });
    if (!confirmed) return;
    try {
        await StudentsRepository.delete(id);
        notify.success('Student deleted successfully.');
        StudentsController._loadStudents();
    } catch (e) { notify.error('Failed to delete student.'); }
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = App.requireAuth();
    if (user) await StudentsController.init(user);
});