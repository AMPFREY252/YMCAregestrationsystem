/**
 * Landing Page Controller
 * =======================
 * Loads dynamic statistics and programs from IndexedDB onto the public landing page.
 */

const LandingController = {
    async init() {
        await this._loadStats();
        await this._loadPrograms();
        this._setupMobileMenu();
    },

    async _loadStats() {
        try {
            const total = await StudentsRepository.count();
            const activePrograms = (await ProgramsRepository.getActive()).length;
            const departments = await DepartmentsRepository.count();
            const graduates = (await StudentsRepository.getCompletedStudents()).length;

            document.getElementById('stat-students').textContent = total;
            document.getElementById('stat-programs').textContent = activePrograms;
            document.getElementById('stat-depts').textContent = departments;
            document.getElementById('stat-graduates').textContent = graduates;
        } catch (e) {
            console.error('Landing stats error:', e);
        }
    },

    async _loadPrograms() {
        const container = document.getElementById('programs-container');
        if (!container) return;
        try {
            const programs = await ProgramsRepository.getActive();
            if (programs.length === 0) {
                container.innerHTML = '<p class="text-center">Programs loading...</p>';
                return;
            }
            let html = '';
            programs.forEach(p => {
                const isDefault = p.department === undefined;
                // Try to get department description for demo data
                let dept = p.department || 'General';
                html += '<div class="program-card"><div class="program-header"><h3>' + (p.name || 'Program') + '</h3><span class="program-dept">' + dept + '</span></div><div class="program-body"><p class="program-duration"><i class="far fa-clock"></i> ' + (p.duration || '1 Year') + '</p><p class="program-desc">' + (p.description || 'Join our program to advance your skills and career prospects.') + '</p></div><div class="program-footer"><a href="register.html" class="btn btn-outline btn-sm">Register</a></div></div>';
            });
            container.innerHTML = html;
        } catch (e) {
            console.error('Load programs error:', e);
            container.innerHTML = '<p class="error-text">Failed to load programs.</p>';
        }
    },

    _setupMobileMenu() {
        const toggle = document.getElementById('menu-toggle');
        const nav = document.getElementById('main-nav');
        if (toggle && nav) {
            toggle.addEventListener('click', () => nav.classList.toggle('open'));
            // Close menu on scroll or link click
            document.querySelectorAll('#main-nav a').forEach(a => {
                a.addEventListener('click', () => nav.classList.remove('open'));
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init().then(() => LandingController.init());
});