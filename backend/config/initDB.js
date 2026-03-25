import mysql from "mysql2/promise";


const initDB = async () => {
    try {
        console.log("Initializing database...");

        // 🔷 STEP 1: Connect without DB
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        // 🔷 STEP 2: Create DB if not exists
        await connection.query(
            `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
        );

        console.log("Database ensured ✅");

        // 🔷 STEP 3: Connect to DB
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // 🔷 USERS
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin','student') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 🔷 STUDENTS
        await db.query(`
            CREATE TABLE IF NOT EXISTS students (
                user_id INT PRIMARY KEY,
                roll_no VARCHAR(10) UNIQUE,
                name VARCHAR(100),
                cgpa FLOAT,
                branch VARCHAR(50),
                skills TEXT,
                resume_url TEXT,
                placed BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // 🔷 COMPANIES
        await db.query(`
            CREATE TABLE IF NOT EXISTS companies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                created_by INT,
                name VARCHAR(150),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);


        // 🔷 JOBS
        await db.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_id INT,
                role VARCHAR(100),
                ctc FLOAT,
                min_cgpa FLOAT,
                description TEXT,
                eligible_branches TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
            )
        `);


        // 🔷 APPLICATIONS
        await db.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT,
                job_id INT,
                status ENUM('APPLIED','SHORTLISTED','INTERVIEW','SELECTED','REJECTED') DEFAULT 'APPLIED',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, job_id),
                FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
            )
        `);

        // 🔷 INTERVIEWS
        await db.query(`
            CREATE TABLE IF NOT EXISTS interviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                application_id INT,
                interview_date DATETIME,
                location VARCHAR(255),
                FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
            )
        `);


        // 🔷 INDEXES (SAFE CREATION)

        // student_id index
        const [idx1] = await db.query(`
            SHOW INDEX FROM applications WHERE Key_name = 'idx_student'
        `);

        if (idx1.length === 0) {
            await db.query(`CREATE INDEX idx_student ON applications(student_id)`);
            console.log("Index idx_student created");
        }

        // job_id index
        const [idx2] = await db.query(`
            SHOW INDEX FROM applications WHERE Key_name = 'idx_job'
        `);

        if (idx2.length === 0) {
            await db.query(`CREATE INDEX idx_job ON applications(job_id)`);
            console.log("Index idx_job created");
        }

        console.log("All tables & indexes ensured ✅");

        await db.end();
        await connection.end();

    } catch (err) {
        console.error("DB Init Error:", err);
    }
};

export default initDB;