const SettingsController = {
    async init(user) {
        UILibrary.initAdminLayout(user);
        UILibrary.setBreadcrumb(['Dashboard', 'Settings']);
        await this._loadStats();
        this._setupEventListeners();
    },

    async _loadStats() {
        const container = document.getElementById('db-stats');
        UILibrary.showLoading('db-stats', 'Loading database statistics...');
        try {
            const stats = await dbService.getStats();
            let html = '';
            html += '<div class="stat-card"><div class="stat-icon"><i class="fas fa-user-graduate"></i></div><div class="stat-info"><span class="stat-value">' + stats.students + '</span><span class="stat-label">Students</span></div></div>';
            html += '<div class="stat-card"><div class="stat-icon"><i class="fas fa-book"></i></div><div class="stat-info"><span class="stat-value">' + stats.programs + '</span><span class="stat-label">Programs</span></div></div>';
            html += '<div class="stat-card"><div class="stat-icon"><i class="fas fa-building"></i></div><div class="stat-info"><span class="stat-value">' + stats.departments + '</span><span class="stat-label">Departments</span></div></div>';
            html += '<div class="stat-card"><div class="stat-icon"><i class="fas fa-users-cog"></i></div><div class="stat-info"><span class="stat-value">' + stats.users + '</span><span class="stat-label">Staff Users</span></div></div>';
            html += '<div class="stat-card"><div class="stat-icon"><i class="fas fa-database"></i></div><div class="stat-info"><span class="stat-value">' + stats.dbSize + '</span><span class="stat-label">Database Size</span></div></div>';
            html += '<div class="stat-card"><div class="stat-icon"><i class="fas fa-cloud-upload-alt"></i></div><div class="stat-info"><span class="stat-value">' + (stats.lastBackup ? UILibrary.formatDate(stats.lastBackup) : 'Never') + '</span><span class="stat-label">Last Backup</span></div></div>';
            container.innerHTML = html;
        } catch (e) { container.innerHTML = '<p class="error-text">Failed to load statistics.</p>'; }
    },

    _setupEventListeners() {
        const actions = {
            'btn-export-all': () => this._exportAll(),
            'btn-import-data': () => this._importData(),
            'btn-backup': () => this._createBackup(),
            'btn-restore': () => this._restoreData(),
            'btn-seed-demo': () => this._seedDemo(),
            'btn-clear-data': () => this._clearData(),
            'btn-change-pin': () => this._changePin()
        };
        Object.keys(actions).forEach(id => {
            document.getElementById(id)?.addEventListener('click', actions[id]);
        });
        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => UILibrary.toggleTheme());
    },

        async _exportAll() {
        try {
            UILibrary.showLoading('db-stats', 'Exporting all data...');
            const data = await dbService.exportAll();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'ymca_backup_' + Date.now() + '.json';
            a.click(); URL.revokeObjectURL(url);
            await dbService.setSetting('lastBackup', new Date().toISOString());
            notify.success('All data exported successfully.');
            this._loadStats();
        } catch (e) { console.error(e); notify.error('Export failed.'); this._loadStats(); }
    },

    async _importData() {
        const fi = document.createElement('input');
        fi.type = 'file'; fi.accept = '.json';
        fi.onchange = async (e) => {
            const file = e.target.files[0]; if (!file) return;
            const confirmed = await UILibrary.confirm({ title: 'Import Data', message: 'Replace ALL existing data?', type: 'warning' });
            if (!confirmed) return;
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                await dbService.importAll(data);
                await dbService.setSetting('lastBackup', new Date().toISOString());
                notify.success('Data imported successfully.');
                this._loadStats();
            } catch (err) { notify.error('Import failed - invalid format.'); }
        };
        fi.click();
    },

    async _restoreData() { notify.info('Use Import button to restore from a backup file.'); },

    async _seedDemo() {
        const seeded = await SeedService.isSeeded();
        if (seeded) {
            const confirmed = await UILibrary.confirm({ title: 'Clear Demo Data', message: 'Remove all demo data and start fresh?', type: 'warning', confirmText: 'Clear Data' });
            if (confirmed) { await SeedService.clearAll(); notify.success('Demo data cleared.'); this._loadStats(); }
        } else {
            const result = await SeedService.seedAll();
            notify.success('Demo data loaded! ' + (result.total || 0) + ' records added.');
            this._loadStats();
        }
    },

    async _clearData() {
        const confirmed = await UILibrary.confirm({ title: 'Clear All Data', message: 'Permanently delete ALL data?', type: 'danger', confirmText: 'Delete Everything' });
        if (!confirmed) return;
        try { await SeedService.clearAll(); notify.success('All data cleared.'); this._loadStats(); }
        catch (e) { notify.error('Failed to clear data.'); }
    },

    _changePin() { notify.info('Password management requires server-side auth. Available when PHP backend is connected.'); }
};

document.addEventListener('DOMContentLoaded', async () => {
    const user = App.requireAuth();
    if (user) await SettingsController.init(user);
});