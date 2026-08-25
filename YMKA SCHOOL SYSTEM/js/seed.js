/**
 * Seed / Demo Data Generator
 * ===========================
 * Populates the database with sample departments, programs, students,
 * and staff users so the system is immediately usable for demos.
 * Accessible from Settings > Data Management.
 */

const SeedService = {
    DEPARTMENTS: [
        { name: 'Business & Entrepreneurship', description: 'Business studies, entrepreneurship, and financial literacy programs.', status: 'active' },
        { name: 'Health & Wellness', description: 'Health education, nutrition, and community health programs.', status: 'active' },
        { name: 'Arts & Technology', description: 'Creative arts, digital media, and technology skills development.', status: 'active' },
        { name: 'Community Development', description: 'Community organizing, youth development, and social work programs.', status: 'active' },
        { name: 'Education & Literacy', description: 'Adult literacy, teacher training, and educational support.', status: 'active' }
        ],

    PROGRAMS: [
        { name: 'Certificate in Business Administration', department: 'Business & Entrepreneurship', duration: '1 Year', description: 'Fundamentals of business, accounting, and management.', status: 'active' },
        { name: 'Diploma in Entrepreneurship', department: 'Business & Entrepreneurship', duration: '2 Years', description: 'Comprehensive entrepreneurship and small business management.', status: 'active' },
        { name: 'Certificate in Community Health', department: 'Health & Wellness', duration: '1 Year', description: 'Basic community health, first aid, and health education.', status: 'active' },
        { name: 'Certificate in Nutrition & Dietetics', department: 'Health & Wellness', duration: '1 Year', description: 'Nutritional science, meal planning, and dietary management.', status: 'active' },
        { name: 'Certificate in Digital Media', department: 'Arts & Technology', duration: '1 Year', description: 'Graphic design, video editing, and digital content creation.', status: 'active' },
        { name: 'Diploma in Computer Applications', department: 'Arts & Technology', duration: '2 Years', description: 'Advanced computer applications, programming, and IT skills.', status: 'active' },
        { name: 'Certificate in Youth Development', department: 'Community Development', duration: '1 Year', description: 'Youth leadership, program design, and community engagement.', status: 'active' },
                { name: 'Certificate in Early Childhood Education', department: 'Education & Literacy', duration: '1 Year', description: 'Child development, teaching methods, and early learning.', status: 'active' }
    ],

    STUDENTS: [
        { firstName: 'Amina', lastName: 'Kisaakho', gender: 'female', phone: '+256 700 100 100', email: 'amina.k@example.com', program: 'Certificate in Business Administration', department: 'Business & Entrepreneurship', status: 'active', intake: 'January 2024', studyMode: 'full-time', yearOfStudy: 1, academicSession: '2023/2024', district: 'Kampala', nationality: 'Ugandan', nationalId: 'CM100001', dateOfBirth: '2002-03-15', previousSchool: 'Makerere University', educationLevel: 'Bachelor\'s', maritalStatus: 'single' },
        { firstName: 'David', lastName: 'Okello', gender: 'male', phone: '+256 700 200 200', email: 'david.o@example.com', program: 'Diploma in Computer Applications', department: 'Arts & Technology', status: 'active', intake: 'September 2023', studyMode: 'full-time', yearOfStudy: 2, academicSession: '2023/2024', district: 'Kampala', nationality: 'Ugandan', nationalId: 'CM200002', dateOfBirth: '2001-08-20', previousSchool: 'Kyambongo University', educationLevel: 'Bachelor\'s', maritalStatus: 'single' },
        { firstName: 'Sarah', lastName: 'Mukasa', gender: 'female', phone: '+256 700 300 300', email: 'sarah.m@example.com', program: 'Certificate in Community Health', department: 'Health & Wellness', status: 'active', intake: 'January 2024', studyMode: 'part-time', yearOfStudy: 1, academicSession: '2023/2024', district: 'Mengo', nationality: 'Ugandan', nationalId: 'CM300003', dateOfBirth: '1999-11-05', previousSchool: 'Nakawa Secondary School', educationLevel: 'A-Level', maritalStatus: 'married' },
        { firstName: 'James', lastName: 'Ochieng', gender: 'male', phone: '+256 700 400 400', email: 'james.o@example.com', program: 'Certificate in Nutrition & Dietetics', department: 'Health & Wellness', status: 'completed', intake: 'September 2022', studyMode: 'full-time', yearOfStudy: 1, academicSession: '2022/2023', district: 'Gulu', nationality: 'Ugandan', nationalId: 'CM400004', dateOfBirth: '2003-01-12', previousSchool: 'St. Mary\'s College', educationLevel: 'O-Level', maritalStatus: 'single' },
        { firstName: 'Fatuma', lastName: 'Hassan', gender: 'female', phone: '+256 700 500 500', email: 'fatuma.h@example.com', program: 'Certificate in Digital Media', department: 'Arts & Technology', status: 'active', intake: 'January 2024', studyMode: 'full-time', yearOfStudy: 1, academicSession: '2023/2024', district: 'Jinja', nationality: 'Ugandan', nationalId: 'CM500005', dateOfBirth: '2002-06-30', previousSchool: 'Makerere High School', educationLevel: 'A-Level', maritalStatus: 'single' },
        { firstName: 'Robert', lastName: 'Wabwire', gender: 'male', phone: '+256 700 600 600', email: 'robert.w@example.com', program: 'Diploma in Business Administration', department: 'Business & Entrepreneurship', status: 'suspended', intake: 'September 2022', studyMode: 'full-time', yearOfStudy: 2, academicSession: '2023/2024', district: 'Mbale', nationality: 'Ugandan', nationalId: 'CM600006', dateOfBirth: '2001-04-18', previousSchool: 'Mbarara Secondary School', educationLevel: 'A-Level', maritalStatus: 'single' },
        { firstName: 'Grace', lastName: 'Nakato', gender: 'female', phone: '+256 700 700 700', email: 'grace.n@example.com', program: 'Certificate in Youth Development', department: 'Community Development', status: 'active', intake: 'January 2024', studyMode: 'part-time', yearOfStudy: 1, academicSession: '2023/2024', district: 'Mityana', nationality: 'Ugandan', nationalId: 'CM700007', dateOfBirth: '1998-09-22', previousSchool: 'Kyankwanizi Secondary School', educationLevel: 'A-Level', maritalStatus: 'married' },
        { firstName: 'Samuel', lastName: 'Kateregga', gender: 'male', phone: '+256 700 800 800', email: 'samuel.k@example.com', program: 'Certificate in Early Childhood Education', department: 'Education & Literacy', status: 'pending', intake: 'January 2024', studyMode: 'full-time', yearOfStudy: 1, academicSession: '2023/2024', district: 'Masaka', nationality: 'Ugandan', nationalId: 'CM800008', dateOfBirth: '2003-12-01', previousSchool: 'Masaka Secondary School', educationLevel: 'O-Level', maritalStatus: 'single' },
        { firstName: 'Brenda', lastName: 'Tumwine', gender: 'female', phone: '+256 700 900 900', email: 'brenda.t@example.com', program: 'Certificate in Digital Media', department: 'Arts & Technology', status: 'active', intake: 'September 2023', studyMode: 'full-time', yearOfStudy: 2, academicSession: '2023/2024', district: 'Entebbe', nationality: 'Ugandan', nationalId: 'CM900009', dateOfBirth: '2001-05-14', previousSchool: 'Namilyango Girls School', educationLevel: 'A-Level', maritalStatus: 'single' },
                        { firstName: 'Isaac', lastName: 'Mugisha', gender: 'male', phone: '+256 700 110 110', email: 'isaac.m@example.com', program: 'Certificate in Nutrition & Dietetics', department: 'Health & Wellness', status: 'active', intake: 'January 2024', studyMode: 'part-time', yearOfStudy: 1, academicSession: '2023/2024', district: 'Fort Portal', nationality: 'Ugandan', nationalId: 'CM100010', dateOfBirth: '2000-07-28', previousSchool: 'Kampala Parents School', educationLevel: 'A-Level', maritalStatus: 'single' }
    ],
    STAFF: [
        { username: 'admin', password: 'admin123', role: 'administrator', name: 'System Administrator', email: 'admin@ymca.ug' },
        { username: 'registration', password: 'reg123', role: 'registration officer', name: 'Sarah Namubiru', email: 'sarah@ymca.ug' },
        { username: 'viewer', password: 'view123', role: 'viewer', name: 'John Mukasa', email: 'john@ymca.ug' }
    ],

    async seedAll() {
        const existing = await dbService.getSetting('demoSeeded');
        if (existing) return { demo: true, count: 0 };
        const counts = { departments: 0, programs: 0, students: 0, users: 0 };
        for (const dept of this.DEPARTMENTS) { await DepartmentsRepository.add(dept); counts.departments++; }
        for (const prog of this.PROGRAMS) { await ProgramsRepository.add(prog); counts.programs++; }
        for (const student of this.STUDENTS) {
            const reg = await StudentsRepository.generateRegistrationNumber();
            student.registrationNumber = reg;
            student.photo = null;
            student.createdAt = student.createdAt || new Date().toISOString();
            student.updatedAt = student.createdAt;
            await StudentsRepository.add(student);
            counts.students++;
        }
        for (const user of this.STAFF) { await UsersRepository.add(user); counts.users++; }
        await dbService.setSetting('demoSeeded', true);
        return { demo: true, count: counts, total: counts.departments + counts.programs + counts.students + counts.users };
    },

    async clearAll() {
        await dbService.clear('students');
        await dbService.clear('programs');
        await dbService.clear('departments');
        await dbService.clear('users');
        await dbService.setSetting('demoSeeded', false);
        return true;
    },

    async isSeeded() {
        return await dbService.getSetting('demoSeeded', false);
    }
};