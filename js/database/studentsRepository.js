/**
 * Students Repository
 * ===================
 * Data access layer for student records. All student CRUD operations go
 * through this repository. If a backend is added later, this file's methods
 * will become HTTP calls — the rest of the app stays the same.
 */

const StudentsRepository = {
    STORE: 'students',

    /** Generate unique registration number: YMCA-YYYY-XXXX */
    async generateRegistrationNumber() {
        const year = new Date().getFullYear();
        const all = await dbService.getAll(this.STORE);
        const sameYear = all.filter(s => s.registrationNumber && s.registrationNumber.startsWith(`YMCA-${year}-`));
        const seq = sameYear.length + 1;
        return `YMCA-${year}-${String(seq).padStart(4, '0')}`;
    },

    async getAll() {
        return await dbService.getAll(this.STORE);
    },

    async get(id) {
        return await dbService.get(this.STORE, id);
    },

    async getByRegNum(regNum) {
        return await dbService.getByIndex(this.STORE, 'registrationNumber', regNum);
    },

    async search(query) {
        const all = await this.getAll();
        const q = query ? query.toLowerCase().trim() : '';
        if (!q) return all;
        return all.filter(s =>
            s.firstName?.toLowerCase().includes(q) ||
            s.lastName?.toLowerCase().includes(q) ||
            s.registrationNumber?.toLowerCase().includes(q) ||
            s.phone?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.nationalId?.toLowerCase().includes(q) ||
            s.program?.toLowerCase().includes(q)
        );
    },

    async checkDuplicate(field, value) {
        if (!value) return false;
        const all = await this.getAll();
        switch (field) {
            case 'phone': return all.some(s => s.phone === value);
            case 'email': return all.some(s => s.email === value);
            case 'nationalId': return all.some(s => s.nationalId === value);
            default: return false;
        }
    },

    async add(student) {
        student.createdAt = new Date().toISOString();
        student.updatedAt = student.createdAt;
        student.status = student.status || 'active';
        return await dbService.add(this.STORE, student);
    },

    async update(student) {
        student.updatedAt = new Date().toISOString();
        return await dbService.put(this.STORE, student);
    },

    async delete(id) {
        return await dbService.delete(this.STORE, id);
    },

    async getByProgram(program) {
        return await dbService.getByIndexAll(this.STORE, 'program', program);
    },

    async getByStatus(status) {
        return await dbService.getByIndexAll(this.STORE, 'status', status);
    },

    async getByGender(gender) {
        const all = await this.getAll();
        return all.filter(s => s.gender === gender);
    },

    async count() {
        return await dbService.count(this.STORE);
    },

    async getNewRegistrations() {
        const all = await this.getAll();
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        return all.filter(s => new Date(s.createdAt) >= start);
    },

    async getActiveStudents() {
        return await this.getByStatus('active');
    },

    async getCompletedStudents() {
        return await this.getByStatus('completed');
    },

    async filter(options = {}) {
        const all = await this.getAll();
        return all.filter(s => {
            if (options.program && s.program !== options.program) return false;
            if (options.department && s.department !== options.department) return false;
            if (options.gender && s.gender !== options.gender) return false;
            if (options.status && s.status !== options.status) return false;
            if (options.academicSession && s.academicSession !== options.academicSession) return false;
            if (options.intake && s.intake !== options.intake) return false;
            return true;
        });
    },

    async paginated(options = {}, page = 1, perPage = 10) {
        let results = await this.filter(options);
        const query = options.search ? await this.search(options.search) : results;
        if (options.search) results = query;
        results.sort((a, b) => {
            const key = options.sortBy || 'createdAt';
            const dir = options.sortDir === 'desc' ? -1 : 1;
            const av = a[key] || '', bv = b[key] || '';
            return av < bv ? -dir : av > bv ? dir : 0;
        });
        const total = results.length;
        const totalPages = Math.ceil(total / perPage);
        const start = (page - 1) * perPage;
        const data = results.slice(start, start + perPage);
        return { data, total, totalPages, page };
    }
};