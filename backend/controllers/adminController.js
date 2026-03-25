import db from "../config/db.js";

export const createCompany = async (req, res) => {
    const { name, description } = req.body;
    const adminId = req.user.id;

    if (!name || !description) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const [result] = await db.query(
            "INSERT INTO companies (name, description, created_by) VALUES (?, ?, ?)",
            [name, description, adminId]
        );

        return res.json({
            message: "Company created successfully",
            companyId: result.insertId
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error creating company" });
    }
};

export const createJob = async (req, res) => {
    const { company_id, role, ctc, min_cgpa, description, branches } = req.body;

    if (!company_id || !role || !ctc || !min_cgpa) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Validate company exists
        const [company] = await db.query(
            "SELECT id FROM companies WHERE id=?",
            [company_id]
        );

        if (company.length === 0) {
            return res.status(400).json({ message: "Company does not exist" });
        }
        await db.beginTransaction();

        // 🔥 Insert job
        const [result] = await db.query(
            `INSERT INTO jobs (company_id, role, ctc, min_cgpa, description, eligible_branches)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [company_id, role, ctc, min_cgpa, description, branches.join(",")]
        );

        const jobId = result.insertId;

        await db.commit();

        res.json({
            message: "Job created successfully",
            jobId
        });

    } catch (err) {
        await db.rollback();
        console.error(err);
        res.status(500).json({ message: "Error creating job" });
    }
};

export const getApplicants = async (req, res) => {
    const { jobId } = req.params;

    const [apps] = await db.query(
        `SELECT a.id, s.name, s.cgpa, a.status 
         FROM applications a 
         JOIN students s ON a.student_id = s.user_id 
         WHERE a.job_id=?`,
        [jobId]
    );

    res.json(apps);
};

export const updateStatus = async (req, res) => {
    const { applicationId, status } = req.body;

    if (!applicationId || !status) {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        await db.beginTransaction();

        
        const [apps] = await db.query(
            "SELECT * FROM applications WHERE id=?",
            [applicationId]
        );

        if (apps.length === 0) {
            return res.status(404).json({ message: "Application not found" });
        }

        const application = apps[0];

        
        await db.query(
            "UPDATE applications SET status=? WHERE id=?",
            [status, applicationId]
        );

        if (status === "SELECTED") {
            await db.query(
                "UPDATE students SET placed = TRUE WHERE user_id=?",
                [application.student_id]
            );
        }

        await db.commit();

        res.json({ message: "Status updated successfully" });

    } catch (err) {
        await db.rollback();
        console.error(err);
        res.status(500).json({ message: "Error updating status" });
    }
};

export const scheduleInterview = async (req, res) => {
    const { application_id, interview_date, location } = req.body;

    if (!application_id || !interview_date ) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const [apps] = await db.query(
            "SELECT * FROM applications WHERE id=?",
            [application_id]
        );

        if (apps.length === 0) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (apps[0].status !== "INTERVIEW") {
            return res.status(400).json({
                message: "Application is not in INTERVIEW stage"
            });
        }

    
        await db.query(
            `INSERT INTO interviews (application_id, interview_date, location)
             VALUES (?, STR_TO_DATE(?, '%d/%m/%Y %r'), ?)`,
            [application_id, interview_date, location]
        );

        return res.json({ message: "Interview scheduled" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error scheduling interview" });
    }
};