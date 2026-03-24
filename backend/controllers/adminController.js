import db from "../config/initDB.js";

export const approveCompany = async (req, res) => {
    const { companyId } = req.body;

    await db.query(
        "UPDATE companies SET approved=1 WHERE id=?",
        [companyId]
    );

    res.json({ message: "Company approved" });
};

export const approveJob = async (req, res) => {
    const { jobId } = req.body;

    await db.query(
        "UPDATE jobs SET approved=1 WHERE id=?",
        [jobId]
    );

    res.json({ message: "Job approved" });
};