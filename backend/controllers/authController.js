import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    const { email, password, role } = req.body;

    const hashed = await bcrypt.hash(password, 10);



    try {
        await db.beginTransaction();

        const [result] = await db.query(
            "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
            [email, hashed, role]
        );

        const userId = result.insertId;

        // 🔒 Safe role handling
        if (role === "student") {
            await db.query(
                "INSERT INTO students (user_id) VALUES (?)",
                [userId]
            );
        }

        await db.commit();

        res.json({ message: "User registered", userId });

    } catch (error) {
        await db.rollback();
        console.error("Register Error:", error);
        res.status(500).json({ message: "Error registering user" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

    if (rows.length === 0)
        return res.status(400).json({ message: "User not found" });

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
        return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET
    );

    res.json({ token });
};