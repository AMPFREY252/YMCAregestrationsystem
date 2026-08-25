# YMCA Uganda — Student Registration & Management System

A complete, production-quality **offline-first** student registration and management system built for YMCA Uganda using pure web technologies — no frameworks, no backend required.

**Empowering Students Through Education and Skills Development**

---

## Technology Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Markup     | HTML5 (semantic, accessible)                      |
| Styling    | CSS3 (CSS variables, grid/flex, dark mode)        |
| Logic      | Vanilla JavaScript (ES6+, async/await)            |
| Database   | IndexedDB (via a promise-based wrapper service)   |
| Icons      | Font Awesome 6 (CDN)                              |
| Charts     | Chart.js 4 (CDN)                                  |

No React / Vue / Angular. No build tools. No server needed — open it in a browser and it works.

---

## Project Structure

```
ymca-registration-system/
│
├── index.html                  # Public landing page
├── login.html                  # Staff login
├── register.html               # 5-step registration wizard
├── register-success.html       # Registration confirmation page
├── dashboard.html              # Admin dashboard (stats + charts)
├── students.html               # Student management (search/filter/sort/paginate)
├── student-profile.html        # Individual student profile
├── programs.html               # Program CRUD management
├── departments.html            # Department CRUD management
├── reports.html                # Filterable report + print/CSV/JSON export
├── settings.html               # Data management, backup/restore, theme
├── print-registration.html     # Printable A4 Student Registration Record
│
├── css/
│   ├── style.css               # Design system: variables, components, pages
│   ├── responsive.css          # Tablet & mobile breakpoints
│   └── print.css               # A4 print styles
│
├── js/
│   ├── app.js                  # Bootstrap, seeding hook, auth guard helpers
│   ├── router.js               # Multi-page navigation helper
│   ├── auth.js                 # Session management (replace w/ server auth later)
│   ├── validation.js           # Reusable field & form validators
│   ├── notifications.js        # Toast notification system
│   ├── ui.js                   # Layout, modals, tables, pagination, states
│   ├── seed.js                 # Demo data generator / cleaner
│   ├── landing.js              # Landing page controller
│   ├── login.js                # Login controller
│   ├── dashboard.js            # Dashboard controller (Chart.js)
│   ├── register.js             # Registration wizard controller
│   ├── students.js             # Student management controller
│   ├── programs.js             # Programs controller
│   ├── departments.js          # Departments controller
│   ├── profile.js              # Student profile controller
│   ├── reports.js              # Reports controller
│   ├── settings.js             # Settings controller
│   ├── print.js                # Printable record controller
│   │
│   └── database/               # DATA LAYER (swap for API later)
│       ├── indexeddb.js        # Promise-based IndexedDB wrapper
│       ├── studentsRepository.js
│       ├── programsRepository.js
│       ├── departmentsRepository.js
│       └── usersRepository.js
│
└── assets/
    └── images/
        └── ymca-logo.svg       # Institutional logo
```

---

## Setup Instructions

1. **Copy the folder** to any location.
2. **Open `index.html`** in a modern browser (Chrome, Edge, Firefox, Safari).
3. Done — the database seeds itself with demo data on first run.

> Optional: serve locally for a cleaner origin:
> ```
> python -m http.server 8080     # or: npx serve .
> ```
> then visit http://localhost:8080

### Demo Accounts (auto-seeded on first run)

| Username      | Password   | Role                 | Capabilities                    |
|---------------|------------|----------------------|---------------------------------|
| `admin`       | `admin123` | Administrator        | Full access                     |
| `registration`| `reg123`   | Registration Officer | Manage students & registrations |
| `viewer`      | `view123`  | Viewer               | Read-only                       |

Demo data can be reloaded or wiped any time via **Settings → Data Management**.

> ⚠️ These are prototype credentials stored client-side. Do not use as-is in production.

---

## How the Database Works

The system uses **IndexedDB** (`YMCA_Student_System`, v2) through three layers:

1. **`indexeddb.js` — the engine.**
   Opens the DB, creates object stores + indexes inside `onupgradeneeded`, and exposes promise-based primitives: `getAll`, `get`, `getByIndex`, `add`, `put`, `delete`, `count`, `clear`, plus `exportAll` / `importAll` for backup and restore.

2. **Repositories — the business vocabulary.**
   Each entity gets a repository that speaks in domain terms instead of transactions:

   ```js
   await StudentsRepository.generateRegistrationNumber(); // YMCA-2026-0001
   await StudentsRepository.checkDuplicate('phone', value);
   await StudentsRepository.paginated(filters, page, perPage);
   await ProgramsRepository.getActive();
   ```

   Uniqueness rules live here: the registration-number index is unique; phone / email / National ID duplicates are rejected before save.

3. **Controllers never touch IndexedDB directly.**
   Page controllers (`dashboard.js`, `students.js`, …) only call repositories — this is what makes a backend swap painless.

### Object Stores & Indexes

| Store         | Indexes                                                                            |
|---------------|------------------------------------------------------------------------------------|
| `students`    | registrationNumber (unique), phone, email, nationalId, program, status, createdAt  |
| `programs`    | name, department, status                                                           |
| `departments` | name (unique), status                                                              |
| `users`       | username (unique), role                                                            |
| `settings`    | key                                                                                |

Because everything lives in the browser, **registration, search, filtering, and reports all work offline**. Each record can later carry a `synced` flag so a sync engine can replay local writes to a server when connectivity returns.

---

## Connecting PHP + MySQL Later (Migration Guide)

The architecture was deliberately shaped so **only the data layer changes** — every UI file keeps working untouched because it already calls repositories, not IndexedDB.

### Step 1 — Re-point repositories at an API

Method signatures stay identical; only the implementation changes:

```js
// js/database/studentsRepository.js  (backend version)
const StudentsRepository = {
    async getAll() {
        const res = await fetch('/api/students.php', { credentials: 'include' });
        return res.json();
    },
    async get(id) {
        const res = await fetch('/api/students.php?id=' + encodeURIComponent(id));
        return res.json();
    },
    async add(student) {
        const res = await fetch('/api/students.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        return res.json();
    }
    // put → PUT, delete → DELETE, same pattern
};
```

Repository → endpoint mapping is 1:1:

| Repository call   | HTTP endpoint              |
|-------------------|----------------------------|
| `getAll()`        | `GET /api/students.php`    |
| `get(id)`         | `GET /api/students.php?id=`|
| `add(data)`       | `POST /api/students.php`   |
| `put(data)`       | `PUT /api/students.php`    |
| `delete(id)`      | `DELETE /api/students.php` |

### Step 2 — Move authentication server-side

Replace the internals of `js/auth.js` with session calls:

```php
// api/auth/login.php
$stmt = $pdo->prepare('SELECT id, username, password_hash, role, name
                       FROM users WHERE username = ?');
$stmt->execute([$_POST['username'] ?? '']);
$user = $stmt->fetch();

if ($user && password_verify($_POST['password'] ?? '', $user['password_hash'])) {
    session_regenerate_id(true);
    $_SESSION['user'] = ['id' => $user['id'], 'role' => $user['role']];
    echo json_encode(['ok' => true]);
} else {
    http_response_code(401);
}
```

### Step 3 — Harden the API

- `password_hash()` / `password_verify()` — never store plaintext passwords.
- **PDO prepared statements** for every query.
- Server-side validation mirroring `validation.js` (never trust the client).
- CSRF tokens on all state-changing requests.
- Role checks enforced **in PHP**, not just hidden UI elements.
- HTTPS only; `Secure`, `HttpOnly`, `SameSite=Lax` cookies.

### Suggested MySQL schema (starting point)

```sql
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  department_id INT NOT NULL,
  duration VARCHAR(50),
  description TEXT,
  status ENUM('active','inactive') DEFAULT 'active',
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  gender ENUM('male','female','other'),
  date_of_birth DATE,
  nationality VARCHAR(80),
  national_id VARCHAR(50),
  marital_status VARCHAR(30),
  photo MEDIUMTEXT,
  phone VARCHAR(30) NOT NULL,
  alt_phone VARCHAR(30),
  email VARCHAR(150),
  district VARCHAR(80), city VARCHAR(80), village VARCHAR(80), address VARCHAR(255),
  emergency_contact VARCHAR(120), emergency_phone VARCHAR(30), relationship VARCHAR(60),
  previous_school VARCHAR(150), education_level VARCHAR(40),
  program_id INT NOT NULL,
  intake VARCHAR(40), study_mode VARCHAR(20),
  year_of_study TINYINT, academic_session VARCHAR(20),
  disability VARCHAR(20), special_needs TEXT,
  sponsor VARCHAR(120), guardian VARCHAR(120), guardian_phone VARCHAR(30),
  referral_source VARCHAR(120),
  status ENUM('active','pending','completed','suspended') DEFAULT 'active',
  synced_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id),
  INDEX idx_status (status), INDEX idx_created (created_at)
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('administrator','registration officer','viewer') NOT NULL,
  name VARCHAR(120), email VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Move registration-number generation into the insert transaction (`SELECT ... FOR UPDATE` per year) so concurrent submissions can't produce duplicates.

---

## Security Notes (honest disclosure)

- Current auth is **client-side only** — it demonstrates flow and roles but is **not production secure**.
- Passwords sit in plaintext in IndexedDB in this prototype. Code comments mark exactly where server-side auth must replace it.
- Destructive actions require confirmation modals; exports contain personal data and must be handled accordingly in a real deployment.

## Future Features That Can Be Added

- **Sync engine** — queue local writes, replay to server when online (`synced` flag per record)
- **PWA** — manifest + service worker for an installable offline app
- Attendance tracking per course/session
- Fees & payments module with UGX receipts
- Grading, transcripts & certificate generation
- Bulk CSV import of students
- Camera capture for student photos on mobile
- Email/SMS notifications (requires backend)
- Multi-campus support & scoped data
- Audit log of every edit/delete
- Staff management UI & granular role editor
- Document attachments (transcripts, IDs) per student