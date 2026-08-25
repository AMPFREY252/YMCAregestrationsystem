/**
 * Validation Utilities
 * ====================
 * Reusable validation functions for form fields. Each function returns
 * { valid: boolean, message: string } so the caller can display the
 * message next to the field.
 */

const Validator = {
    required(value, label = 'This field') {
        if (value === null || value === undefined || String(value).trim() === '') {
            return { valid: false, message: `${label} is required.` };
        }
        return { valid: true, message: '' };
    },

    email(value) {
        if (!value) return { valid: true, message: '' }; // optional
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!re.test(value)) return { valid: false, message: 'Please enter a valid email address.' };
        return { valid: true, message: '' };
    },

    phone(value) {
        if (!value) return { valid: true, message: '' }; // optional
        const re = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
        if (!re.test(value)) return { valid: false, message: 'Please enter a valid phone number.' };
        return { valid: true, message: '' };
    },

    dateOfBirth(value) {
        if (!value) return { valid: false, message: 'Date of birth is required.' };
        const dob = new Date(value);
        const today = new Date();
        if (isNaN(dob)) return { valid: false, message: 'Please enter a valid date.' };
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 0) return { valid: false, message: 'Date of birth cannot be in the future.' };
        if (age > 120) return { valid: false, message: 'Please verify the date of birth.' };
        return { valid: true, message: '' };
    },

    minLength(value, min, label = 'This field') {
        if (!value) return { valid: true, message: '' };
        if (value.length < min) return { valid: false, message: `${label} must be at least ${min} characters.` };
        return { valid: true, message: '' };
    },

    maxLength(value, max, label = 'This field') {
        if (!value) return { valid: true, message: '' };
        if (value.length > max) return { valid: false, message: `${label} must not exceed ${max} characters.` };
        return { valid: true, message: '' };
    },

    ageRange(value, minAge = 10, maxAge = 100) {
        if (!value) return { valid: false, message: 'Date of birth is required.' };
        const dob = new Date(value);
        const today = new Date();
        if (isNaN(dob)) return { valid: false, message: 'Please enter a valid date.' };
        const age = today.getFullYear() - dob.getFullYear();
        if (age < minAge) return { valid: false, message: `Student must be at least ${minAge} years old.` };
        if (age > maxAge) return { valid: false, message: `Student must not be older than ${maxAge}.` };
        return { valid: true, message: '' };
    },

    /** Validate an entire registration form object. Returns { valid, errors }. */
    validateRegistration(data) {
        const errors = {};

        // Step 1 — Personal Info
        const checks = [
            ['firstName', () => this.required(data.firstName, 'First name')],
            ['lastName', () => this.required(data.lastName, 'Last name')],
            ['gender', () => this.required(data.gender, 'Gender')],
            ['dateOfBirth', () => this.dateOfBirth(data.dateOfBirth)],
            ['nationality', () => this.required(data.nationality, 'Nationality')],
            ['nationalId', () => this.minLength(data.nationalId, 6, 'National ID')],
            ['maritalStatus', () => this.required(data.maritalStatus, 'Marital status')],
            // Step 2 — Contact
            ['phone', () => this.required(data.phone, 'Phone number')],
            ['phone', () => this.phone(data.phone)],
            ['alternativePhone', () => this.phone(data.alternativePhone)],
            ['email', () => this.email(data.email)],
            ['district', () => this.required(data.district, 'District')],
            ['emergencyContact', () => this.required(data.emergencyContact, 'Emergency contact')],
            ['emergencyPhone', () => this.required(data.emergencyPhone, 'Emergency phone')],
            // Step 3 — Academic
            ['program', () => this.required(data.program, 'Course/Program')],
            ['department', () => this.required(data.department, 'Department')],
        ];

        for (const [field, fn] of checks) {
            const result = fn();
            if (!result.valid) {
                if (!errors[field]) errors[field] = [];
                errors[field].push(result.message);
            }
        }

        return { valid: Object.keys(errors).length === 0, errors };
    },

    /** Validate login form. */
    validateLogin(data) {
        const errors = {};
        const u = this.required(data.username, 'Username');
        const p = this.required(data.password, 'Password');
        if (!u.valid) errors.username = u.message;
        if (!p.valid) errors.password = p.message;
        return { valid: Object.keys(errors).length === 0, errors };
    }
};