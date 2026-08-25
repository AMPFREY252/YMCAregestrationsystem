/**
 * Registration Wizard Controller
 * ================================
 * Manages the 5-step student registration form:
 *   Step 1 - Personal Information
 *   Step 2 - Contact Information
 *   Step 3 - Academic Information
 *   Step 4 - Additional Information
 *   Step 5 - Review & Submit
 */

const RegistrationWizard = {
    currentStep: 1,
    totalSteps: 5,
    formData: {},

    init() {
        this._loadDependencies().then(() => {
            this._autoGenRegNumber();
            this._setupEventListeners();
            this._setupPhotoPreview();
            this._populateDropdowns();
            this._updateStepUI();
            this._updateReview();
        });
    },

    async _loadDependencies() {
        const departments = await DepartmentsRepository.getActive();
        this.departments = departments.map(d => d.name);
        const programs = await ProgramsRepository.getActive();
        this.programs = programs;
    },

    _autoGenRegNumber() {
        const el = document.getElementById('reg-number-display');
        if (el) {
            StudentsRepository.generateRegistrationNumber().then(num => {
                el.textContent = num || 'Generating...';
                this.formData.registrationNumber = num;
            });
        }
    },

    _setupEventListeners() {
        const nextBtn = document.getElementById('btn-next');
        const prevBtn = document.getElementById('btn-prev');
        const submitBtn = document.getElementById('btn-submit');
        nextBtn?.addEventListener('click', () => this.nextStep());
        prevBtn?.addEventListener('click', () => this.prevStep());
        submitBtn?.addEventListener('click', () => this.submit());

        document.querySelectorAll('.step-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const step = parseInt(e.target.dataset.step);
                if (step <= this.currentStep) this.goToStep(step);
            });
        });

        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', (e) => this._validateField(e.target));
            field.addEventListener('input', (e) => this._clearError(e.target));
        });

        const photoInput = document.getElementById('photo');
        photoInput?.addEventListener('change', (e) => this._handlePhoto(e));
    },

        _handlePhoto(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('photo-preview');
        if (!file || !preview) return;
        if (file.size > 2 * 1024 * 1024) { notify.warning('Photo size should be under 2MB.'); return; }
        if (!file.type.startsWith('image/')) { notify.warning('Please upload an image file.'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
            preview.classList.remove('has-placeholder');
            this.formData.photo = ev.target.result;
        };
        reader.readAsDataURL(file);
    },

    _populateDropdowns() {
        const genderEl = document.getElementById('gender');
        if (genderEl) genderEl.innerHTML = '<option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>';

        const maritalEl = document.getElementById('maritalStatus');
        if (maritalEl) maritalEl.innerHTML = '<option value="">Select</option><option value="single">Single</option><option value="married">Married</option><option value="divorced">Divorced</option><option value="widowed">Widowed</option><option value="other">Other</option>';

        const natEl = document.getElementById('nationality');
        if (natEl) natEl.innerHTML = '<option value="Ugandan">Ugandan</option><option value="Kenyan">Kenyan</option><option value="Tanzanian">Tanzanian</option><option value="Rwandan">Rwandan</option><option value="South Sudanese">South Sudanese</option><option value="Other">Other</option>';

        const deptEl = document.getElementById('department');
        if (deptEl) {
            let html = '<option value="">Select Department</option>';
            this.departments.forEach(d => html += `<option value="${d}">${d}</option>`);
            deptEl.innerHTML = html;
        }

        const progEl = document.getElementById('program');
        if (progEl) {
            let html = '<option value="">Select Program</option>';
            this.programs.forEach(p => html += `<option value="${p.name}">${p.name}</option>`);
            progEl.innerHTML = html;
        }

        const intakeEl = document.getElementById('intake');
        if (intakeEl) intakeEl.innerHTML = '<option value="January 2024">January 2024</option><option value="September 2023">September 2023</option><option value="January 2025">January 2025</option>';

        const modeEl = document.getElementById('studyMode');
        if (modeEl) modeEl.innerHTML = '<option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="evening">Evening</option>';

        const sessionEl = document.getElementById('academicSession');
        if (sessionEl) sessionEl.innerHTML = '<option value="2023/2024">2023/2024</option><option value="2024/2025">2024/2025</option>';

        const yrEl = document.getElementById('yearOfStudy');
        if (yrEl) yrEl.innerHTML = '<option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option>';

        const disEl = document.getElementById('disability');
        if (disEl) disEl.innerHTML = '<option value="no">No</option><option value="yes">Yes</option><option value="partial">Partial</option>';

        const distEl = document.getElementById('district');
        if (distEl) {
            const districts = ['Kampala', 'Wakiso', 'Mbarara', 'Gulu', 'Jinja', 'Mbale', 'Mityana', 'Masaka', 'Fort Portal', 'Mengo', 'Entebbe'];
            let html = '<option value="">Select District</option>';
            districts.forEach(d => html += `<option value="${d}">${d}</option>`);
            distEl.innerHTML = html;
        }
    },

    nextStep() {
        this._saveStepData();
        if (!this._validateCurrentStep()) return;
        if (this.currentStep < this.totalSteps) this.currentStep++;
        this._updateStepUI();
        this._updateReview();
    },

    prevStep() {
        this._saveStepData();
        if (this.currentStep > 1) this.currentStep--;
        this._updateStepUI();
    },

    goToStep(step) {
        if (step >= 1 && step <= this.totalSteps) {
            this._saveStepData();
            this.currentStep = step;
            this._updateStepUI();
        }
    },

    _updateStepUI() {
        document.querySelectorAll('.step-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i + 1 === this.currentStep);
            dot.classList.toggle('completed', i + 1 < this.currentStep);
        });
        document.querySelectorAll('.step-pane').forEach((pane, i) => {
            pane.classList.toggle('active', i + 1 === this.currentStep);
        });
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');
        const submitBtn = document.getElementById('btn-submit');
        if (prevBtn) prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
        if (nextBtn) nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'inline-flex';
        if (submitBtn) submitBtn.style.display = this.currentStep === this.totalSteps ? 'inline-flex' : 'none';
    },

    _saveStepData() {
        const inputs = document.querySelectorAll('#step-' + this.currentStep + ' input, #step-' + this.currentStep + ' select, #step-' + this.currentStep + ' textarea');
                inputs.forEach(input => {
            const val = input.type === 'checkbox' ? input.checked : input.value;
            this.formData[input.name] = val;
        });
    },

    _validateCurrentStep() {
        const validation = Validator.validateRegistration(this.formData);
        let valid = true;
        const stepFields = document.querySelectorAll('#step-' + this.currentStep + ' [required]');
        stepFields.forEach(field => {
            if (!this.formData[field.name]) {
                this._showError(field, 'This field is required.');
                valid = false;
            }
        });
        Object.keys(validation.errors || {}).forEach(field => {
            const inputs = document.querySelectorAll('[name="' + field + '"]');
            inputs.forEach(input => this._showError(input, validation.errors[field].join(' ')));
        });
        return valid;
    },

    _validateField(field) {
        const name = field.name;
        const value = field.value;
        let result = { valid: true, message: '' };
        if (field.hasAttribute('required') && !value.trim()) {
            result = { valid: false, message: 'This field is required.' };
        } else if (name === 'email') {
            result = Validator.email(value);
        } else if (['phone', 'alternativePhone', 'emergencyPhone', 'parentGuardianPhone'].includes(name)) {
            if (value) result = Validator.phone(value);
        } else if (name === 'dateOfBirth') {
            if (value) result = Validator.dateOfBirth(value);
        }
        if (!result.valid) this._showError(field, result.message);
        else this._clearError(field);
    },

    _showError(field, message) {
        this._clearError(field);
        field.classList.add('error');
        const errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        field.parentNode.appendChild(errorEl);
    },

    _clearError(field) {
        field.classList.remove('error');
        const existing = field.parentNode.querySelector('.field-error');
        if (existing) existing.remove();
    },

    _escapeHtml(str) {
        if (!str) return '-';
        return str.toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    },

    _updateReview() {
        const reviewEl = document.getElementById('review-content');
        if (!reviewEl) return;
        const fields = [
            ['firstName', 'First Name'], ['middleName', 'Middle Name'], ['lastName', 'Last Name'],
            ['gender', 'Gender'], ['dateOfBirth', 'Date of Birth'], ['nationality', 'Nationality'],
            ['nationalId', 'National ID'], ['maritalStatus', 'Marital Status'],
            ['phone', 'Phone Number'], ['alternativePhone', 'Alternative Phone'],
            ['email', 'Email Address'], ['district', 'District'], ['city', 'City/Town'],
            ['village', 'Village'], ['address', 'Physical Address'],
            ['emergencyContact', 'Emergency Contact'], ['emergencyPhone', 'Emergency Phone'], ['relationship', 'Relationship'],
            ['previousSchool', 'Previous School'], ['educationLevel', 'Education Level'],
            ['program', 'Course/Program'], ['department', 'Department'],
            ['intake', 'Intake'], ['studyMode', 'Study Mode'], ['yearOfStudy', 'Year of Study'], ['academicSession', 'Academic Session'],
            ['disability', 'Disability Status'], ['specialNeeds', 'Special Needs'],
            ['sponsor', 'Sponsor'], ['guardian', 'Parent/Guardian'], ['guardianPhone', 'Parent/Guardian Phone'],
            ['referralSource', 'How did you hear about YMCA?']
        ];
        let html = '<div class="review-grid">';
        fields.forEach(([key, label]) => {
            let val = this.formData[key] || '-';
            if (key === 'dateOfBirth' && val) val = new Date(val).toLocaleDateString('en-GB');
            html += '<div class="review-item"><strong>' + label + ':</strong> <span>' + this._escapeHtml(val) + '</span></div>';
        });
        html += '<div class="review-item"><strong>Registration Number:</strong> <span>' + this._escapeHtml(this.formData.registrationNumber || '') + '</span></div>';
        html += '</div>';
        reviewEl.innerHTML = html;
    },

    async submit() {
        this._saveStepData();
        const dupPhone = await StudentsRepository.checkDuplicate('phone', this.formData.phone);
        const dupEmail = await StudentsRepository.checkDuplicate('email', this.formData.email);
        const dupId = await StudentsRepository.checkDuplicate('nationalId', this.formData.nationalId);
        if (dupPhone) { notify.warning('A student with this phone number already exists.'); return; }
        if (dupEmail) { notify.warning('A student with this email already exists.'); return; }
        if (dupId) { notify.warning('A student with this National ID already exists.'); return; }
        try {
            const id = await StudentsRepository.add(this.formData);
            notify.success('Student registered successfully!');
            window.location.href = 'register-success.html?reg=' + encodeURIComponent(this.formData.registrationNumber) + '&id=' + id;
        } catch (e) {
            console.error('Registration error:', e);
            notify.error('Unable to save student. Please try again.');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('registration-form')) {
        RegistrationWizard.init();
    }
});