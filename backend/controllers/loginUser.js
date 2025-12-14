import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../database/db.js";

async function loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "E-Mail und Passwort sind erforderlich.",
        });
    }

    try {
        // Get data for user with login email address
        const queryResult = await db.query(
            "SELECT id, email, password_hash, created_at FROM users WHERE email = $1;",
            [email]
        );
        const user = queryResult.rows[0];
        if (!user) {
            return res.status(401).json({ message: "Login Daten ungültig." });
        }

        // Check if password is correct
        const isValidPassword = await bcrypt.compare(
            password,
            user.password_hash
        );
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Das Passwort ist nicht korrekt.",
            });
        }

        const userData = {
            id: user.id,
            email: user.email,
            createdAt: user.created_at,
        };

        // Create token for authentication
        const token = jwt.sign(userData, process.env.JWT_SECRET);

        return res.status(200).json({
            message: "Erfolgreiche Anmeldung.",
            user: userData,
            token,
        });
    } catch (error) {
        console.error("Fehler beim Login: ", error);
        return res
            .status(500)
            .json({ message: "Interner Serverfehler beim Login.", error });
    }
}

export default loginUser;
