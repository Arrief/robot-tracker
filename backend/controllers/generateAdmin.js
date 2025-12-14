import bcrypt from "bcrypt";
import db from "../database/db.js";

/*
    One-time function to generate an admin user with specific email & password in the DB
    Reason: hash the password with bcrypt for future authentication
*/
async function generateAdmin(_req, res) {
    const adminMail = "admin@test.com";
    const adminPass = "test123";

    try {
        const hashedPassword = await bcrypt.hash(adminPass, 10);

        const adminCreation = await db.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at;",
            [adminMail, hashedPassword]
        );

        return res.status(201).json({
            message: "Admin wurde erfolgreich erstellt.",
            admin: adminCreation.rows[0],
        });
    } catch (error) {
        // 23505 = SQL status for UNIQUE-Constraint error, already exists
        if (error.code === "23505") {
            console.error("Fehler beim Erstellen des Admins: ", error);
            return res.status(409).json({
                message: "Admin existiert bereits.",
                error,
            });
        }

        console.error("Fehler beim Erstellen des Admins: ", error);
        return res.status(500).json({
            message: "Interner Serverfehler beim Erstellen des Admins.",
            error,
        });
    }
}

export default generateAdmin;
