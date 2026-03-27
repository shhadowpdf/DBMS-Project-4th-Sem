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

export const fetchCompanies = async (req, res) => {
    try {
        const [companies] = await db.query("SELECT * FROM companies");
        res.status(200).json(companies);
    } catch (error) {
        console.error("Fetch companies error:", error);
        res.status(404).json({ message: "Error fetching companies" });
    }
};

export const createJob = async (req, res) => {
    const { company_id, role, ctc, min_cgpa, description, eligible_branches } = req.body;

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

        // Convert eligible_branches array to comma-separated string
        const branchesString = Array.isArray(eligible_branches) 
            ? eligible_branches.join(",") 
            : eligible_branches || "";

        await db.beginTransaction();

        // 🔥 Insert job
        const [result] = await db.query(
            `INSERT INTO jobs (company_id, role, ctc, min_cgpa, description, eligible_branches)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [company_id, role, ctc, min_cgpa, description, branchesString]
        );

        const jobId = result.insertId;

        await db.commit();

        return res.json({
            message: "Job created successfully",
            jobId
        });

    } catch (err) {
        await db.rollback();
        console.error(err);
        return res.status(500).json({ message: "Error creating job" });
    }
};

export const getApplicants = async (req, res) => {
    const { jobId } = req.params;

    const [apps] = await db.query(
        `SELECT 
    a.id,
    s.name,
    s.cgpa,
    s.branch,
    s.roll_no,
    s.skills,
    s.resume_url,
    a.status,
    a.applied_at,
    c.name AS company_name,
    j.role,
    j.ctc
FROM applications a
JOIN students s ON a.student_id = s.user_id
JOIN jobs j ON a.job_id = j.id
JOIN companies c ON j.company_id = c.id
WHERE a.job_id = ?`,
        [jobId]
    );

    res.json(apps);
};

export const updateStatus = async (req, res) => {
    const { applicationId, status } = req.body;

    if (!applicationId || !status) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const statusMap = {
        applied: "APPLIED",
        pending: "APPLIED",
        selected: "SELECTED",
        shortlisted: "SHORTLISTED",
        interview: "INTERVIEW",
        accepted: "ACCEPTED",
        rejected: "REJECTED",
    };

    const normalized = (status || "").toString().toLowerCase();
    const dbStatus = statusMap[normalized] || status;

    if (!Object.values(statusMap).includes(dbStatus)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        await db.beginTransaction();

        const [apps] = await db.query(
            "SELECT * FROM applications WHERE id=?",
            [applicationId]
        );

        if (apps.length === 0) {
            await db.rollback();
            return res.status(404).json({ message: "Application not found" });
        }

        const application = apps[0];

        await db.query(
            "UPDATE applications SET status=? WHERE id=?",
            [dbStatus, applicationId]
        );

        // Mark student as placed when shortlisted
        if (dbStatus === "SHORTLISTED") {
            await db.query(
                "UPDATE students SET placed = TRUE WHERE user_id=?",
                [application.student_id]
            );
        }

        await db.commit();

        return res.json({ message: "Status updated successfully" });

    } catch (err) {
        await db.rollback();
        console.error(err);
        return res.status(500).json({ message: "Error updating status" });
    }
};

export const scheduleInterview = async (req, res) => {
    const { application_id, interview_round, interview_date, interview_time, interview_link } = req.body;

    if (!application_id || !interview_round || !interview_date || !interview_time) {
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

        // Combine interview_date and interview_time into DATETIME format
        const interviewDateTime = `${interview_date} ${interview_time}`;

        await db.query(
            `INSERT INTO interviews (application_id, interview_round, interview_date, interview_time, interview_link)
             VALUES (?, ?, ?, ?, ?)`,
            [application_id, interview_round, interviewDateTime, interview_time, interview_link || null]
        );

        return res.json({ message: "Interview scheduled successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error scheduling interview" });
    }
};

export const getInterviews = async (req, res) => {
    try {
        const [interviews] = await db.query(
            `SELECT i.*, a.id as application_id, s.roll_no, s.name as student_name, s.branch
             FROM interviews i
             JOIN applications a ON i.application_id = a.id
             JOIN students s ON a.student_id = s.user_id
             ORDER BY i.interview_date ASC`
        );

        return res.json(interviews);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching interviews" });
    }
};

export const deleteJob = async (req, res) => {
    const { jobId } = req.params;

    try {
        const [job] = await db.query("SELECT * FROM jobs WHERE id = ?", [jobId]);

        if (job.length === 0) {
            return res.status(404).json({ message: "Job not found" });
        }

        await db.query("DELETE FROM jobs WHERE id=?", [jobId]);
        return res.json({ message: "Job deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting job" });
    }
};

export const deleteCompany = async (req, res) => {
    const { companyId } = req.params;

    try {
        const [company] = await db.query("SELECT * FROM companies WHERE id = ?", [companyId]);

        if (company.length === 0) {
            return res.status(404).json({ message: "Company not found" });
        }

        await db.query("DELETE FROM companies WHERE id = ?", [companyId]);
        return res.json({ message: "Company deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting company" });
    }
};