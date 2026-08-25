/**
 * Programs Management Controller
 * ==============================
 * Page controller for /programs.html — list, add, edit, delete, search, and filter programs.
 */

const ProgramsController = {
    currentPage: 1,
    sortField: 'name',
    sortDir: 'asc',
    currentFilter: {},

    async init(user) {
        UILibrary.initAdminLayout(user);
        UILibrary.setBreadcrumb(['Dashboard', 'Programs']);
        await this._loadPrograms();
        this._setupEventListeners();
    },

    _setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        searchInput?.addEventListener('input', App.debounce(() => { this.currentPage = 1; this._loadPrograms(); }, 300));

        document.getElementById('btn-add-program')?.addEventListener('click', () => this._showProgramForm());
        document.getElementById('filter-status')?.addEventListener('change', () => { this.currentPage = 1; this._loadPrograms(); });
    },

    async _loadPrograms() {
        const container = document.getElementById('programs-table');
        UILibrary.showLoading('programs-table', 'Loading programs...');
        try {
            const search = document.getElementById('search-input')?.value || '';
            const status = document.getElementById('filter-status')?.value || '';
            const options = { search, status: status || undefined, sortBy: this.sortField, sortDir: this.sortDir };
            const result = await ProgramsRepository.paginated(options, this.currentPage, 10);

            if (result.data.length === 0) {
                UILibrary.showEmpty('programs-table', 'No programs found', 'Add Program', '#');
            } else {
                let html = '<div class="table-wrapper"><table class="table"><thead><tr><th>#</th><th>Program Name</th><th>Department</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
                result.data.forEach((p, i) => {
                    html += '<tr><td>' + ((result.page - 1) * 10 + i + 1) + '</td><td>' + UILibrary.escapeHtml(p.name) + '</td><td>' + UILibrary.escapeHtml(p.department) + '</td><td>' + UILibrary.escapeHtml(p.duration) + '</td><td><span class="badge badge-' + p.status + '">' + p.status + '</span></td><td class="actions-cell">';
                    html += '<button class="btn-icon btn-warning" title="Edit" onclick="editProgram(' + p.id + ')"><i class="fas fa-edit"></i></button>';
                    html += '<button class="btn-icon btn-danger" title="Delete" onclick="deleteProgram(' + p.id + ')"><i class="fas fa-trash"></i></button>';
                    html += '</td></tr>';
                });
                html += '</tbody></table></div>';
                container.innerHTML = html;
            }
            UILibrary.renderPagination('pagination-container', result.page, result.totalPages, (p) => { this.currentPage = p; this._loadPrograms(); }, '<span class="pagination-total">' + result.total + ' programs</span>');
        } catch (e) {
            console.error('Load programs error:', e);
            container.innerHTML = '<p class="error-text">Failed to load programs.</p>';
        }
    },

    async _showProgramForm(editData = null) {
        const isEdit = !!editData;
        const departments = await DepartmentsRepository.getActive();
        const deptOptions = departments.map(d => ({ value: d.name, label: d.name }));

        const result = await UILibrary.showFormModal({
            title: isEdit ? 'Edit Program' : 'Add New Program',
            fields: [
                { name: 'name', label: 'Program Name', required: true, type: 'text' },
                { name: 'department', label: 'Department', required: true, type: 'select', options: deptOptions },
                { name: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g. 1 Year, 2 Years' },
                { name: 'description', label: 'Description', type: 'textarea' },
                { name: 'status', label: 'Status', required: true, type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] }
            ],
            submitText: isEdit ? 'Update' : 'Save',
            size: 'md'
        });

        if (!result) return;
        if (isEdit) {
            const program = await ProgramsRepository.get(editData.id) || editData;
            program.name = result.name;
            program.department = result.department;
            program.duration = result.duration;
            program.description = result.description;
            program.status = result.status;
            await ProgramsRepository.update(program);
            notify.success('Program updated successfully.');
        } else {
            await ProgramsRepository.add({
                name: result.name, department: result.department, duration: result.duration,
                description: result.description, status: result.status
            });
            notify.success('Program added successfully.');
        }
        this._loadPrograms();
    }
};

async function editProgram(id) {
    const program = await ProgramsRepository.get(id);
    ProgramsController._showProgramForm(program);
}

async function deleteProgram(id) {
    const confirmed = await UILibrary.confirm({ title: 'Delete Program?', message: 'This action cannot be undone.', type: 'danger' });
    if (!confirmed) return;
    try {
        await ProgramsRepository.delete(id);
        notify.success('Program deleted successfully.');
        ProgramsController._loadPrograms();
    } catch (e) { notify.error('Failed to delete program.'); }
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = App.requireAuth();
    if (user) await ProgramsController.init(user);
});