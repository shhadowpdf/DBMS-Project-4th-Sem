import db from "../config/initDB.js";

export const getJobs = async (req, res) => {
    const [jobs] = await db.query("SELECT * FROM jobs WHERE approved=1");
    res.json(jobs);
};

export const applyJob = async (req, res) => {
    const studentId = req.user.id;
    const { jobId } = req.body;

    const [existing] = await db.query(
        "SELECT * FROM applications WHERE student_id=? AND job_id=?",
        [studentId, jobId]
    );

    if (existing.length > 0)
        return res.status(400).json({ message: "Already applied" });

    const [[student]] = await db.query(
        "SELECT * FROM students WHERE user_id=?",
        [studentId]
    );

    const [[job]] = await db.query(
        "SELECT * FROM jobs WHERE id=?",
        [jobId]
    );

    if (student.cgpa < job.min_cgpa)
        return res.status(400).json({ message: "Not eligible (CGPA)" });

    if (!job.eligible_branches.includes(student.branch))
        return res.status(400).json({ message: "Not eligible (Branch)" });

    await db.query(
        "INSERT INTO applications (student_id, job_id) VALUES (?, ?)",
        [studentId, jobId]
    );

    res.json({ message: "Applied successfully" });
};

export const myApplications = async (req, res) => {
    const studentId = req.user.id;

    const [apps] = await db.query(
        `SELECT a.*, j.role, j.ctc 
         FROM applications a 
         JOIN jobs j ON a.job_id = j.id 
         WHERE a.student_id=?`,
        [studentId]
    );

    res.json(apps);
};