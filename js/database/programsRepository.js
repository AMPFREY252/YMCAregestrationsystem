/**
 * Programs Repository
 * ===================
 * Data access layer for academic programs/courses.
 */

const ProgramsRepository = {
    STORE: 'programs',

    async getAll() {
        return await dbService.getAll(this.STORE);
    },

    async get(id) {
        return await dbService.get(this.STORE, id);
    },

    async getByName(name) {
        return await dbService.getByIndex(this.STORE, 'name', name);
    },

    async search(query) {
        const all = await this.getAll();
        const q = query ? query.toLowerCase().trim() : '';
        if (!q) return all;
        return all.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.department?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
    },

    async add(program) {
        program.createdAt = new Date().toISOString();
        program.status = program.status || 'active';
        return await dbService.add(this.STORE, program);
    },

    async update(program) {
        program.updatedAt = new Date().toISOString();
        return await dbService.put(this.STORE, program);
    },

    async delete(id) {
        return await dbService.delete(this.STORE, id);
    },

    async getActive() {
        return await dbService.getByIndexAll(this.STORE, 'status', 'active');
    },

    async getByDepartment(dept) {
        return await dbService.getByIndexAll(this.STORE, 'department', dept);
    },

    async count() {
        return await dbService.count(this.STORE);
    },

    async paginated(options = {}, page = 1, perPage = 15) {
        let results = await this.search(options.search || '');
        results = results.filter(p => {
            if (options.department && p.department !== options.department) return false;
            if (options.status && p.status !== options.status) return false;
            return true;
        });
        results.sort((a, b) => {
            const key = options.sortBy || 'name';
            const dir = options.sortDir === 'desc' ? -1 : 1;
            return (a[key] || '') < (b[key] || '') ? -dir : (a[key] || '') > (b[key] || '') ? dir : 0;
        });
        const total = results.length;
        const totalPages = Math.ceil(total / perPage);
        const start = (page - 1) * perPage;
        return { data: results.slice(start, start + perPage), total, totalPages, page };
    }
};