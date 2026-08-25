/**
 * Dashboard Controller
 * ====================
 * Loads summary statistics and renders charts using Chart.js.
 */

const DashboardController = {
    charts: {},

    async init(user) {
        UILibrary.initAdminLayout(user);
        UILibrary.setBreadcrumb(['Dashboard']);
        // Dynamic time-based greeting
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        const wm = document.getElementById('welcome-message');
        if (wm) wm.textContent = greeting + ', ' + ((user && user.name) || 'Administrator');
        await this._loadStats();
        await this._loadCharts();
        await this._loadRecentRegistrations();
    },

    async _loadStats() {
        try {
            const total = await StudentsRepository.count();
            const newRegs = (await StudentsRepository.getNewRegistrations()).length;
            const active = (await StudentsRepository.getActiveStudents()).length;
            const completed = (await StudentsRepository.getCompletedStudents()).length;
            const programs = await ProgramsRepository.count();
            document.getElementById('stat-total').textContent = total;
            document.getElementById('stat-new').textContent = newRegs;
            document.getElementById('stat-active').textContent = active;
            document.getElementById('stat-completed').textContent = completed;
            document.getElementById('stat-programs').textContent = programs;
        } catch (e) {
            console.error('Dashboard stats error:', e);
            notify.error('Failed to load dashboard statistics.');
        }
    },

    async _loadCharts() {
        try {
            const students = await StudentsRepository.getAll();
            this._renderRegistrationChart(students);

            const programDist = {};
            students.forEach(s => { programDist[s.program] = (programDist[s.program] || 0) + 1; });
            this._renderProgramChart(programDist);

            const genderDist = { male: 0, female: 0, other: 0 };
            students.forEach(s => { if (genderDist[s.gender] !== undefined) genderDist[s.gender]++; });
            this._renderGenderChart(genderDist);

            const statusDist = { active: 0, pending: 0, completed: 0, suspended: 0 };
            students.forEach(s => { const st = s.status || 'pending'; if (statusDist[st] !== undefined) statusDist[st]++; });
            this._renderStatusChart(statusDist);
        } catch (e) { console.error('Chart error:', e); }
    },

    _renderRegistrationChart(students) {
        const ctx = document.getElementById('chart-registration');
        if (!ctx) return;
        const months = {};
        students.forEach(s => {
            const d = new Date(s.createdAt);
            const m = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            months[m] = (months[m] || 0) + 1;
        });
        const sortedKeys = Object.keys(months).sort((a, b) => new Date(a) - new Date(b));
        this.charts.registration = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedKeys,
                datasets: [{ label: 'Registrations', data: sortedKeys.map(k => months[k]), borderColor: '#d32f2f', backgroundColor: 'rgba(211, 47, 47, 0.1)', tension: 0.3, fill: true, borderWidth: 2 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'var(--chart-text)' } } }, scales: { x: { ticks: { color: 'var(--chart-text)' }, grid: { color: 'var(--chart-grid)' } }, y: { ticks: { color: 'var(--chart-text)' }, grid: { color: 'var(--chart-grid)' } } } }
                });
    },

    _renderProgramChart(dist) {
        const ctx = document.getElementById('chart-program');
        if (!ctx) return;
        this.charts.program = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(dist),
                datasets: [{ data: Object.values(dist), backgroundColor: ['#d32f2f', '#1a237e', '#388e3c', '#f57c00', '#7b1fa2', '#00838f', '#c2185b', '#303f9f'] }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'var(--chart-text)' } } } }
        });
    },

    _renderGenderChart(dist) {
        const ctx = document.getElementById('chart-gender');
        if (!ctx) return;
        this.charts.gender = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Male', 'Female', 'Other'],
                datasets: [{ label: 'Students', data: [dist.male, dist.female, dist.other], backgroundColor: '#1a237e' }]
            },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { labels: { display: false } } }, scales: { x: { ticks: { color: 'var(--chart-text)' }, grid: { color: 'var(--chart-grid)' } }, y: { ticks: { color: 'var(--chart-text)' }, grid: { color: 'var(--chart-grid)' } } } }
        });
    },

    _renderStatusChart(dist) {
        const ctx = document.getElementById('chart-status');
        if (!ctx) return;
        this.charts.status = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Active', 'Pending', 'Completed', 'Suspended'],
                datasets: [{ data: [dist.active, dist.pending, dist.completed, dist.suspended], backgroundColor: ['#388e3c', '#ff9800', '#1976d2', '#d32f2f'] }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'var(--chart-text)' } } } }
        });
    },

    async _loadRecentRegistrations() {
        const container = document.getElementById('recent-registrations');
        if (!container) return;
        UILibrary.showLoading('recent-registrations', 'Loading recent registrations...');
        try {
            const students = await StudentsRepository.getAll();
            const recent = students.slice(0, 5);
            if (recent.length === 0) {
                UILibrary.showEmpty('recent-registrations', 'No students registered yet', 'Register Student', 'register.html');
                return;
            }
            let html = '<div class="table-wrapper"><table class="table"><thead><tr><th>Registration #</th><th>Student Name</th><th>Program</th><th>Phone</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
            recent.forEach(s => {
                html += '<tr><td>' + (s.registrationNumber || '-') + '</td><td><strong>' + (s.firstName + ' ' + s.lastName) + '</strong></td><td>' + (s.program || '-') + '</td><td>' + (s.phone || '-') + '</td><td>' + UILibrary.formatDate(s.createdAt) + '</td><td><span class="badge badge-' + (s.status || 'pending') + '">' + (s.status || 'pending') + '</span></td><td class="actions-cell">';
                html += '<button class="btn-icon btn-primary" title="View" onclick="viewStudent(' + s.id + ')"><i class="fas fa-eye"></i></button>';
                html += '<button class="btn-icon btn-warning" title="Edit" onclick="editStudent(' + s.id + ')"><i class="fas fa-edit"></i></button>';
                html += '<button class="btn-icon btn-secondary" title="Print Record" onclick="printStudent(' + s.id + ')"><i class="fas fa-print"></i></button>';
                html += '<button class="btn-icon btn-danger" title="Delete" onclick="deleteStudent(' + s.id + ')"><i class="fas fa-trash"></i></button>';
                html += '</td></tr>';
            });
            html += '</tbody></table></div>';
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = '<p class="error-text">Failed to load data.</p>';
        }
        }
};

function viewStudent(id) { window.location.href = 'student-profile.html?id=' + id; }
function editStudent(id) { window.location.href = 'student-profile.html?id=' + id + '&edit=true'; }
function printStudent(id) { window.location.href = 'print-registration.html?id=' + id; }
async function deleteStudent(id) {
    const confirmed = await UILibrary.confirm({ title: 'Delete Student?', message: 'This action cannot be undone.', type: 'danger' });
    if (!confirmed) return;
    try {
        await StudentsRepository.delete(id);
        notify.success('Student deleted successfully.');
        location.reload();
    } catch (e) { notify.error('Failed to delete student.'); }
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = App.requireAuth();
    if (user) await DashboardController.init(user);
});