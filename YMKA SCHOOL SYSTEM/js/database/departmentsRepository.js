/**
 * Departments Repository
 * ======================
 * Data access layer for academic departments.
 */

const DepartmentsRepository = {
    STORE: 'departments',

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
        return all.filter(d =>
            d.name?.toLowerCase().includes(q) ||
            d.description?.toLowerCase().includes(q)
        );
    },

    async add(dept) {
        dept.createdAt = new Date().toISOString();
        dept.status = dept.status || 'active';
        return await dbService.add(this.STORE, dept);
    },

    async update(dept) {
        dept.updatedAt = new Date().toISOString();
        return await dbService.put(this.STORE, dept);
    },

    async delete(id) {
        return await dbService.delete(this.STORE, id);
    },

    async getActive() {
        return await dbService.getByIndexAll(this.STORE, 'status', 'active');
    },

    async count() {
        return await dbService.count(this.STORE);
    }
};