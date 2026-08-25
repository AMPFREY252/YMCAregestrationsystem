/**
 * IndexedDB Wrapper Service
 * =========================
 * A reusable, Promise-based IndexedDB wrapper providing a clean API for
 * database operations. All database access goes through repositories that
 * use this service.
 *
 * FUTURE BACKEND NOTE:
 * When migrating to PHP + MySQL, this wrapper will be replaced by a REST API
 * client. The repository layer stays unchanged -- only the data source changes.
 *   db.getAll()   -> GET    /api/students
 *   db.get(id)     -> GET    /api/students/{id}
 *   db.add(data)  -> POST   /api/students
 *   db.put(data)  -> PUT    /api/students/{id}
 *   db.delete(id) -> DELETE /api/students/{id}
 */
class IndexedDBService {
    constructor() {
        this.dbName = 'YMCA_Student_System';
        this.version = 2;
        this.db = null;
        this.ready = this._init();
    }

    async _init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => { this.db = request.result; resolve(this.db); };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this._createStores(db);
            };
        });
    }

    _createStores(db) {
        if (!db.objectStoreNames.contains('students')) {
            const s = db.createObjectStore('students', { keyPath: 'id', autoIncrement: true });
            s.createIndex('registrationNumber', 'registrationNumber', { unique: true });
            s.createIndex('phone', 'phone', { unique: false });
            s.createIndex('email', 'email', { unique: false });
            s.createIndex('nationalId', 'nationalId', { unique: false });
            s.createIndex('lastName', 'lastName', { unique: false });
            s.createIndex('program', 'program', { unique: false });
            s.createIndex('status', 'status', { unique: false });
            s.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('programs')) {
            const s = db.createObjectStore('programs', { keyPath: 'id', autoIncrement: true });
            s.createIndex('name', 'name', { unique: false });
            s.createIndex('department', 'department', { unique: false });
            s.createIndex('status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('departments')) {
            const s = db.createObjectStore('departments', { keyPath: 'id', autoIncrement: true });
            s.createIndex('name', 'name', { unique: true });
            s.createIndex('status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('users')) {
            const s = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            s.createIndex('username', 'username', { unique: true });
            s.createIndex('role', 'role', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
        }
    }

            _getStore(storeName, mode = 'readonly') {
        if (!this.db) throw new Error('Database not initialized');
        const tx = this.db.transaction(storeName, mode);
        return tx.objectStore(storeName);
    }

    async getAll(storeName) {
        await this.ready;
        const store = this._getStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async get(storeName, key) {
        await this.ready;
        const store = this._getStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        await this.ready;
        const store = this._getStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const req = store.index(indexName).get(value);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async getByIndexAll(storeName, indexName, value) {
        await this.ready;
        const store = this._getStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const req = store.index(indexName).getAll(IDBKeyRange.only(value));
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async add(storeName, data) {
        await this.ready;
        const store = this._getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const req = store.add(data);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async put(storeName, data) {
        await this.ready;
        const store = this._getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const req = store.put(data);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

        async delete(storeName, key) {
        await this.ready;
        const store = this._getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const req = store.delete(key);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    async count(storeName) {
        await this.ready;
        const store = this._getStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const req = store.count();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async clear(storeName) {
        await this.ready;
        const store = this._getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    async cursor(storeName, callback, mode = 'readonly') {
        await this.ready;
        const store = this._getStore(storeName, mode);
        return new Promise((resolve, reject) => {
            const req = store.openCursor();
            req.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) { callback(cursor); cursor.continue(); }
                else { resolve(); }
            };
            req.onerror = () => reject(req.error);
        });
    }

    async getSetting(key, defaultValue = null) {
        await this.ready;
        const rec = await this.get('settings', key);
        return rec ? rec.value : defaultValue;
    }

    async setSetting(key, value) {
        await this.ready;
        await this.put('settings', { key, value });
    }

    async _estimateSize() {
        try {
            if (navigator.storage && navigator.storage.estimate) {
                const est = await navigator.storage.estimate();
                return `${(est.usage / 1024 / 1024).toFixed(2)} MB used of ${(est.quota / 1024 / 1024).toFixed(2)} MB quota`;
            }
        } catch (e) { /* ignore */ }
        return 'unknown';
    }

    async getStats() {
        await this.ready;
        const stats = {};
        for (const name of ['students', 'programs', 'departments', 'users']) {
            stats[name] = await this.count(name);
        }
        stats.lastBackup = await this.getSetting('lastBackup', null);
        stats.dbSize = this.db ? await this._estimateSize() : 'unknown';
        return stats;
    }

    async exportAll() {
        await this.ready;
        const result = {};
        for (const name of ['students', 'programs', 'departments', 'users', 'settings']) {
            result[name] = await this.getAll(name);
        }
        return result;
    }

    async importAll(data) {
        await this.ready;
        for (const name of ['students', 'programs', 'departments', 'users', 'settings']) {
            if (data[name] && Array.isArray(data[name])) {
                await this.clear(name);
                for (const record of data[name]) { await this.add(name, record); }
            }
        }
    }
}

// Singleton instance shared across the application
const dbService = new IndexedDBService();
