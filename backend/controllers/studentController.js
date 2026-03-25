import db from "../config/db.js";

export const getJobs = async (req, res) => {
    const [jobs] = await db.query("SELECT * FROM jobs");
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
    console.log(student);
    
    console.log(job);
    
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

export const updateUser = async(req, res) => {
    const {roll_no, name, cgpa, branch, skills, resume_url} = req.body;

    if(!roll_no || !name || !cgpa || !branch) {
        return res.status(400).json({message: "Missing required fields"});
    }

    const studentId = req.user.id;
    
    const result = await db.query(
        "UPDATE students SET roll_no=?, name=?, cgpa=?, branch=?, skills=?, resume_url=? WHERE user_id=?",
        [roll_no, name, cgpa, branch, skills, resume_url, studentId]
    );
    console.log(result);
    
    res.status(200).json({ message: "User updated successfully" });

}

export const getProfile = async(req, res) => {
    const studentId = req.user.id;
    const [rows] = await db.query(
        "SELECT * FROM students WHERE user_id=?",
        [studentId]
    );
    if(rows.length === 0) {
        return res.status(404).json({message: "Student not found"});
    }
    res.json(rows[0]);
}

export const getMyInterviews = async (req, res) => {
    const userId = req.user.id;

    const [rows] = await db.query(
        `SELECT i.id, i.interview_date, i.location, i.round_name, j.role
         FROM interviews i
         JOIN applications a ON i.application_id = a.id
         JOIN jobs j ON a.job_id = j.id
         WHERE a.student_id = ?`,
        [userId]
    );

    res.json(rows);
};