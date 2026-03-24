import db from "../config/initDB.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    const { email, password, role } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.query(
        "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
        [email, hashed, role]
    );

    res.json({ message: "User registered", userId: result.insertId });
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