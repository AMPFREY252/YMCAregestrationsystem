/**
 * Reports Controller
 * =================
 * Generates reports from IndexedDB data with filtering, print, and export.
 */

const ReportsController = {
    async init(user) {
        UILibrary.initAdminLayout(user);
        UILibrary.setBreadcrumb(['Dashboard', 'Reports']);
        await this._populateProgramFilter();
        await this._loadReport();
        document.getElementById('filter-btn')?.addEventListener('click', () => this._loadReport());
        document.getElementById('print-report')?.addEventListener('click', () => window.print());
        document.getElementById('export-csv')?.addEventListener('click', () => this._exportCSV());
        document.getElementById('export-json')?.addEventListener('click', () => this._exportJSON());
    },

    async _loadReport() {
        const container = document.getElementById('report-table');
        UILibrary.showLoading('report-table', 'Loading report...');
        try {
            const startDate = document.getElementById('date-from')?.value || null;
            const endDate = document.getElementById('date-to')?.value || null;
            const status = document.getElementById('filter-status')?.value || '';
            const program = document.getElementById('filter-program')?.value || '';

            let students = await StudentsRepository.getAll();

            // Filter by date range
            if (startDate || endDate) {
                const start = startDate ? new Date(startDate) : new Date(0);
                const end = endDate ? new Date(endDate) : new Date(8640000000000000);
                students = students.filter(s => {
                    const d = new Date(s.createdAt);
                    return d >= start && d <= end;
                });
            }
            if (status) students = students.filter(s => s.status === status);
            if (program) students = students.filter(s => s.program === program);

            const reportDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('report-date').textContent = reportDate;
            document.getElementById('report-count').textContent = students.length;

            if (students.length === 0) {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-bar"></i><h3>No records found for selected criteria</h3></div>';
            } else {
                let html = '<table class="table table-report"><thead><tr><th>Reg. Number</th><th>Student Name</th><th>Program</th><th>Gender</th><th>Phone</th><th>Registration Date</th><th>Status</th></tr></thead><tbody>';
                students.forEach(s => {
                    html += '<tr><td>' + UILibrary.escapeHtml(s.registrationNumber || '-') + '</td><td>' + UILibrary.escapeHtml(s.firstName + ' ' + s.lastName) + '</td><td>' + UILibrary.escapeHtml(s.program || '-') + '</td><td>' + UILibrary.escapeHtml(s.gender || '-') + '</td><td>' + UILibrary.escapeHtml(s.phone || '-') + '</td><td>' + UILibrary.formatDate(s.createdAt) + '</td><td><span class="badge badge-' + (s.status || 'pending') + '">' + (s.status || 'pending') + '</span></td></tr>';
                });
                html += '</tbody></table>';
                container.innerHTML = html;
            }
        } catch (e) {
            console.error('Report error:', e);
            container.innerHTML = '<p class="error-text">Failed to load report.</p>';
        }
    },

        async _populateProgramFilter() {
        const progEl = document.getElementById('filter-program');
        if (!progEl) return;
        try {
            const programs = await ProgramsRepository.getActive();
            let html = '<option value="">All Programs</option>';
            programs.forEach(p => html += '<option value="' + p.name + '">' + p.name + '</option>');
            progEl.innerHTML = html;
        } catch (e) { console.error('Program filter error:', e); }
    },

    _exportCSV() {
        StudentsRepository.getAll().then(students => {
            const startDate = document.getElementById('date-from')?.value || null;
            const endDate = document.getElementById('date-to')?.value || null;
            if (startDate || endDate) {
                const start = startDate ? new Date(startDate) : new Date(0);
                const end = endDate ? new Date(endDate) : new Date(8640000000000000);
                students = students.filter(s => { const d = new Date(s.createdAt); return d >= start && d <= end; });
            }
            const headers = ['Registration #', 'Name', 'Program', 'Gender', 'Phone', 'Email', 'Registration Date', 'Status'];
            const rows = students.map(s => [s.registrationNumber, (s.firstName + ' ' + s.lastName).trim(), s.program, s.gender, s.phone, s.email, UILibrary.formatDate(s.createdAt), s.status]);
            UILibrary.exportCSV(headers, rows, 'YMCA_Registration_Report');
        });
    },

    async _exportJSON() {
        const students = await StudentsRepository.getAll();
        const reportData = { report: 'Student Registration Report', generatedAt: new Date().toISOString(), count: students.length, students };
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'ymca_registration_report.json';
        a.click(); URL.revokeObjectURL(url);
        notify.info('Report exported as JSON.');
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const user = App.requireAuth();
    if (user) await ReportsController.init(user);
});