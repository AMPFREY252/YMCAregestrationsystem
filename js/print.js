const PrintController = {
    async init(user) {
        UILibrary.initAdminLayout(user);
        UILibrary.setBreadcrumb(['Reports', 'Registration Record']);
        const params = new URLSearchParams(window.location.search);
        const regNum = params.get('reg') || params.get('id');
        const container = document.getElementById('print-record');
        UILibrary.showLoading('print-record', 'Loading registration record...');
        try {
            let student = null;
            if (regNum) {
                const idNum = parseInt(regNum);
                if (!isNaN(idNum)) student = await StudentsRepository.get(idNum);
                if (!student) student = await StudentsRepository.getByRegNum(regNum);
            }
            if (!student) {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle"></i><h3>Student Not Found</h3><p>Search for a student or provide a valid registration number.</p></div><div class="no-print"><input type="text" id="search-reg" class="search-input" placeholder="Enter registration number..."><button class="btn btn-primary" onclick="PrintController.searchAndPrint()">Find Record</button></div>';
                return;
            }
            container.innerHTML = this._renderRecord(student);
        } catch (e) {
            console.error('Print record error:', e);
            container.innerHTML = '<p class="error-text">Failed to load record.</p>';
        }
        document.getElementById('btn-print')?.addEventListener('click', () => window.print());
    },

        async searchAndPrint() {
        const reg = document.getElementById('search-reg')?.value.trim();
        if (reg) window.location.href = 'print-registration.html?reg=' + encodeURIComponent(reg);
    },

    _renderRecord(s) {
        const photo = s.photo ? '<img src="' + s.photo + '" class="record-photo" alt="Student Photo">' : '<div class="record-photo-placeholder"><i class="fas fa-user"></i></div>';
        const fullName = s.firstName + ' ' + (s.middleName ? s.middleName + ' ' : '') + s.lastName;
        return `
        <div class="record-document">
            <div class="record-header">
                <div class="record-logo"><img src="assets/images/ymca-logo.jpg" alt="YMCA Uganda"></div>
                <div class="record-title"><h1>YMCA UGANDA</h1><h2>STUDENT REGISTRATION RECORD</h2><p>Student Registration and Management System</p></div>
                ${photo}
            </div>
            <div class="record-section">
                <h3><i class="fas fa-id-card"></i> Personal Details</h3>
                <table class="record-table">
                    <tr><td class="label">Registration Number</td><td class="value">${s.registrationNumber || '-'}</td><td class="label">Student ID</td><td class="value">${s.id || '-'}</td></tr>
                    <tr><td class="label">Full Name</td><td class="value" colspan="2">${fullName}</td></tr>
                    <tr><td class="label">Gender</td><td class="value">${s.gender || '-'}</td><td class="label">Date of Birth</td><td class="value">${s.dateOfBirth ? UILibrary.formatDate(s.dateOfBirth) : '-'}</td></tr>
                    <tr><td class="label">Nationality</td><td class="value">${s.nationality || '-'}</td><td class="label">National ID</td><td class="value">${s.nationalId || '-'}</td></tr>
                    <tr><td class="label">Marital Status</td><td class="value">${s.maritalStatus || '-'}</td></tr>
                </table>
            </div>
            <div class="record-section">
                <h3><i class="fas fa-map-marker-alt"></i> Contact Information</h3>
                <table class="record-table">
                    <tr><td class="label">Phone</td><td class="value">${s.phone || '-'}</td><td class="label">Alternative Phone</td><td class="value">${s.alternativePhone || '-'}</td></tr>
                    <tr><td class="label">Email</td><td class="value" colspan="3">${s.email || '-'}</td></tr>
                    <tr><td class="label">District</td><td class="value">${s.district || '-'}</td><td class="label">City/Town</td><td class="value">${s.city || '-'}</td></tr>
                    <tr><td class="label">Village</td><td class="value">${s.village || '-'}</td><td class="label">Address</td><td class="value">${s.address || '-'}</td></tr>
                </table>
            </div>
            <div class="record-section">
                <h3><i class="fas fa-book"></i> Academic Information</h3>
                <table class="record-table">
                    <tr><td class="label">Previous School</td><td class="value">${s.previousSchool || '-'}</td><td class="label">Education Level</td><td class="value">${s.educationLevel || '-'}</td></tr>
                    <tr><td class="label">Program</td><td class="value">${s.program || '-'}</td><td class="label">Department</td><td class="value">${s.department || '-'}</td></tr>
                    <tr><td class="label">Study Mode</td><td class="value">${s.studyMode || '-'}</td><td class="label">Year of Study</td><td class="value">${s.yearOfStudy || '-'}</td></tr>
                    <tr><td class="label">Intake</td><td class="value">${s.intake || '-'}</td><td class="label">Academic Session</td><td class="value">${s.academicSession || '-'}</td></tr>
                </table>
            </div>
            <div class="record-section">
                <h3><i class="fas fa-phone-volume"></i> Guardian / Emergency Contact</h3>
                <table class="record-table">
                    <tr><td class="label">Name</td><td class="value">${s.emergencyContact || s.guardian || '-'}</td><td class="label">Phone</td><td class="value">${s.emergencyPhone || s.guardianPhone || '-'}</td></tr>
                    <tr><td class="label">Relationship</td><td class="value">${s.relationship || '-'}</td><td class="label">Sponsor</td><td class="value">${s.sponsor || '-'}</td></tr>
                    <tr><td class="label">Disability</td><td class="value">${s.disability || 'None reported'}</td><td class="label">Referred By</td><td class="value">${s.referralSource || '-'}</td></tr>
                </table>
            </div>
            <div class="record-footer">
                <div class="record-date">Registration Date: ${s.createdAt ? UILibrary.formatDate(s.createdAt) : '-'}</div>
                <div class="signatures">
                    <div class="signature-box"><div class="signature-line"></div><p>Student Signature</p></div>
                    <div class="signature-box"><div class="signature-line"></div><p>Guardian Signature</p></div>
                    <div class="signature-box"><div class="signature-line"></div><p>Administrator</p></div>
                </div>
                <div class="approval-section"><span class="badge badge-${s.status || 'pending'}">${s.status || 'pending'}</span><p>This is an official YMCA Uganda document.</p></div>
            </div>
        </div>`;
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const user = App.requireAuth();
    if (user) await PrintController.init(user);
});