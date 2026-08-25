/**
 * Departments Management Controller
 * =================================
 * Page controller for /departments.html.
 */

const DepartmentsController = {
    async init(user) {
        UILibrary.initAdminLayout(user);
        UILibrary.setBreadcrumb(['Dashboard', 'Departments']);
        const searchInput = document.getElementById('search-input');
        searchInput?.addEventListener('input', App.debounce(() => this._loadDepartments(), 300));
        document.getElementById('btn-add-dept')?.addEventListener('click', () => this._showDeptForm());
        await this._loadDepartments();
    },

    async _loadDepartments() {
        const container = document.getElementById('departments-table');
        UILibrary.showLoading('departments-table', 'Loading departments...');
        try {
            const query = document.getElementById('search-input')?.value || '';
            let depts = await DepartmentsRepository.search(query);

            if (depts.length === 0) {
                UILibrary.showEmpty('departments-table', 'No departments found', 'Add Department', '#');
            } else {
                let html = '<div class="table-wrapper"><table class="table"><thead><tr><th>#</th><th>Department Name</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
                depts.forEach((d, i) => {
                    html += '<tr><td>' + (i + 1) + '</td><td>' + UILibrary.escapeHtml(d.name) + '</td><td>' + UILibrary.escapeHtml(d.description) + '</td><td><span class="badge badge-' + d.status + '">' + d.status + '</span></td><td class="actions-cell">';
                    html += '<button class="btn-icon btn-warning" title="Edit" onclick="editDept(' + d.id + ')"><i class="fas fa-edit"></i></button>';
                    html += '<button class="btn-icon btn-danger" title="Delete" onclick="deleteDept(' + d.id + ')"><i class="fas fa-trash"></i></button>';
                    html += '</td></tr>';
                });
                html += '</tbody></table></div>';
                container.innerHTML = html;
            }
        } catch (e) {
            container.innerHTML = '<p class="error-text">Failed to load departments.</p>';
        }
    },

    async _showDeptForm(editData = null) {
        const isEdit = !!editData;
        const result = await UILibrary.showFormModal({
            title: isEdit ? 'Edit Department' : 'Add New Department',
            fields: [
                { name: 'name', label: 'Department Name', required: true, type: 'text' },
                { name: 'description', label: 'Description', type: 'textarea' },
                { name: 'status', label: 'Status', required: true, type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] }
            ],
            submitText: isEdit ? 'Update' : 'Save',
            size: 'sm'
        });
        if (!result) return;
        if (isEdit) {
            const dept = await DepartmentsRepository.get(editData.id) || editData;
            const existing = await DepartmentsRepository.getByName(result.name);
            if (existing && existing.id !== dept.id) {
                notify.warning('A department with this name already exists.');
                return;
            }
            dept.name = result.name;
            dept.description = result.description;
            dept.status = result.status;
            await DepartmentsRepository.update(dept);
            notify.success('Department updated successfully.');
        } else {
            const existing = await DepartmentsRepository.getByName(result.name);
            if (existing) {
                notify.warning('A department with this name already exists.');
                return;
            }
            await DepartmentsRepository.add({ name: result.name, description: result.description, status: result.status });
            notify.success('Department added successfully.');
        }
        this._loadDepartments();
    }
};

async function editDept(id) {
    const dept = await DepartmentsRepository.get(id);
    DepartmentsController._showDeptForm(dept);
}

async function deleteDept(id) {
    const confirmed = await UILibrary.confirm({ title: 'Delete Department?', message: 'This action cannot be undone.', type: 'danger' });
    if (!confirmed) return;
    try {
        await DepartmentsRepository.delete(id);
        notify.success('Department deleted successfully.');
        DepartmentsController._loadDepartments();
    } catch (e) { notify.error('Failed to delete department.'); }
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = App.requireAuth();
    if (user) await DepartmentsController.init(user);
});