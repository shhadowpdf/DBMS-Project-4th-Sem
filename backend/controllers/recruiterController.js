import db from "../config/initDB.js";

export const createJob = async (req, res) => {
    const { company_id, role, ctc, min_cgpa, eligible_branches } = req.body;

    await db.query(
        "INSERT INTO jobs (company_id, role, ctc, min_cgpa, eligible_branches) VALUES (?, ?, ?, ?, ?)",
        [company_id, role, ctc, min_cgpa, eligible_branches]
    );

    res.json({ message: "Job created (pending approval)" });
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

    await db.query(
        "UPDATE applications SET status=? WHERE id=?",
        [status, applicationId]
    );

    res.json({ message: "Status updated" });
};