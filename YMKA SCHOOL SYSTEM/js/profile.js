const ProfileController = {
    studentId: null,
    isEditMode: false,

    async init(user) {
        UILibrary.initAdminLayout(user);
        UILibrary.setBreadcrumb(['Dashboard', 'Students', 'Student Profile']);
        this.studentId = parseInt(new URLSearchParams(window.location.search).get('id') || '0');
        this.isEditMode = new URLSearchParams(window.location.search).get('edit') === 'true';
        if (!this.studentId) { window.location.href = 'students.html'; return; }
        await this._loadStudent();
        this._setupActionButtons();
    },

    async _loadStudent() {
        const container = document.getElementById('profile-content');
        UILibrary.showLoading('profile-content', 'Loading student profile...');
        try {
            const student = await StudentsRepository.get(this.studentId);
            if (!student) {
                UILibrary.showEmpty('profile-content', 'Student not found', 'Back to Students', 'students.html');
                return;
            }
            let photoHtml = student.photo ? '<img src="' + student.photo + '" alt="Profile">' : '<i class="fas fa-user-circle"></i>';
            let html = '<div class="profile-header"><div class="profile-photo">' + photoHtml + '</div><div class="profile-name"><h2>' + UILibrary.escapeHtml(student.firstName + ' ' + (student.middleName ? student.middleName + ' ' : '') + student.lastName) + '</h2><span class="profile-regno">' + UILibrary.escapeHtml(student.registrationNumber || '') + '</span><span class="badge badge-' + (student.status || 'pending') + ' status-badge">' + (student.status || 'pending') + '</span></div><div class="profile-actions"><button class="btn btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button><button class="btn btn-warning" onclick="ProfileController.editStudent()"><i class="fas fa-edit"></i> Edit</button><button class="btn btn-success" id="change-status-btn"><i class="fas fa-sync-alt"></i> Change Status</button><button class="btn btn-outline" onclick="exportStudentData()"><i class="fas fa-file-export"></i> Export</button></div></div>';
            html += '<div class="profile-sections">';
            html += this._infoSection('Personal Information', [['First Name', student.firstName], ['Middle Name', student.middleName], ['Last Name', student.lastName], ['Gender', student.gender], ['Date of Birth', student.dateOfBirth ? UILibrary.formatDate(student.dateOfBirth) : '-'], ['Nationality', student.nationality], ['National ID', student.nationalId], ['Marital Status', student.maritalStatus]]);
            html += this._infoSection('Contact Information', [['Phone', student.phone], ['Alternative Phone', student.alternativePhone], ['Email', student.email], ['District', student.district], ['City/Town', student.city], ['Village', student.village], ['Physical Address', student.address]]);
            html += this._infoSection('Academic Information', [['Previous School', student.previousSchool], ['Education Level', student.educationLevel], ['Course/Program', student.program], ['Department', student.department], ['Intake', student.intake], ['Study Mode', student.studyMode], ['Year of Study', student.yearOfStudy], ['Academic Session', student.academicSession]]);
            html += this._infoSection('Emergency Contact', [['Contact Name', student.emergencyContact], ['Phone', student.emergencyPhone], ['Relationship', student.relationship]]);
            html += this._infoSection('Registration Information', [['Registration Number', student.registrationNumber], ['Registration Date', student.createdAt ? UILibrary.formatDate(student.createdAt) : '-'], ['Last Updated', student.updatedAt ? UILibrary.formatDate(student.updatedAt) : '-'], ['Status', student.status], ['Referred By', student.referralSource]]);
            html += this._infoSection('Additional Information', [['Disability Status', student.disability], ['Special Needs', student.specialNeeds], ['Sponsor', student.sponsor], ['Parent/Guardian', student.guardian], ['Parent/Guardian Phone', student.guardianPhone]]);
            html += '</div>';
            container.innerHTML = html;
                } catch (e) { container.innerHTML = '<p class="error-text">Failed to load student profile.</p>'; }
    },

    _infoSection(title, fields) {
        let html = '<div class="profile-section"><h3>' + title + '</h3><div class="info-grid">';
        fields.forEach(([label, val]) => {
            html += '<div class="info-item"><strong>' + label + '</strong><span>' + UILibrary.escapeHtml(val || '-') + '</span></div>';
        });
        return html + '</div></div>';
    },

    _setupActionButtons() {
        const btn = document.getElementById('change-status-btn');
        if (btn) btn.addEventListener('click', () => this._changeStatus());
    },

    async _changeStatus() {
        const student = await StudentsRepository.get(this.studentId);
        if (!student) return;
        const result = await UILibrary.showFormModal({
            title: 'Change Status',
            fields: [{ name: 'status', label: 'New Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }, { value: 'suspended', label: 'Suspended' }] }],
            submitText: 'Update', size: 'sm'
        });
        if (!result) return;
        student.status = result.status;
        await StudentsRepository.update(student);
        notify.success('Status updated to ' + result.status + '.');
        this._loadStudent();
    },

    editStudent() {
        UILibrary.showFormModal({
            title: 'Edit Student',
            fields: [
                { name: 'firstName', label: 'First Name', required: true, type: 'text' },
                { name: 'lastName', label: 'Last Name', required: true, type: 'text' },
                { name: 'phone', label: 'Phone', required: true, type: 'text' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'program', label: 'Program', type: 'text' },
                { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }, { value: 'suspended', label: 'Suspended' }] }
            ],
            submitText: 'Save Changes', size: 'lg'
        }).then(async (result) => {
            if (!result) return;
            try {
                const student = await StudentsRepository.get(this.studentId);
                if (!student) return;
                Object.assign(student, result);
                await StudentsRepository.update(student);
                notify.success('Student information updated.');
                this._loadStudent();
            } catch (e) { notify.error('Failed to update student.'); }
        });
    }
};

async function exportStudentData() {
    const student = await StudentsRepository.get(ProfileController.studentId);
    if (!student) return;
    const blob = new Blob([JSON.stringify(student, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = (student.registrationNumber || 'student') + '_export.json';
    a.click(); URL.revokeObjectURL(url);
    notify.info('Student data exported.');
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = App.requireAuth();
    if (user) await ProfileController.init(user);
});