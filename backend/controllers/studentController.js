import db from "../config/db.js";

export const getJobs = async (req, res) => {
    const [jobs] = await db.query("SELECT j.*, c.name as company_name FROM jobs j, companies c WHERE j.company_id = c.id;");
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

    // Check if student is already placed
    if (student.placed) {
        return res.status(400).json({ message: "You are already placed" });
    }

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
        `SELECT a.*, j.role, j.ctc, j.description, c.name as company_name, j.min_cgpa
         FROM applications a, companies c, jobs j
         WHERE a.student_id=? AND a.job_id=j.id AND j.company_id=c.id`,
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

    try {
        const [rows] = await db.query(
            `SELECT i.id, i.interview_date, i.interview_time, i.interview_round, i.interview_link, j.role, j.ctc, c.name as company_name, a.status as application_status
             FROM interviews i
             JOIN applications a ON i.application_id = a.id
             JOIN jobs j ON a.job_id = j.id
             JOIN companies c ON j.company_id = c.id
             WHERE a.student_id = ?
             ORDER BY i.interview_date ASC`,
            [userId]
        );

        res.json(rows);
    } catch (error) {
        console.error("Get interviews error:", error);
        res.status(500).json({ message: "Error fetching interviews" });
    }
};