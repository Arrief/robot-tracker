import jwt from "jsonwebtoken";

async function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentifizierung fehlgeschlagen.",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const authorizedUser = jwt.verify(token, process.env.JWT_SECRET);
        req.user = authorizedUser;
        next();
    } catch (error) {
        console.error("Authentifizierung fehlgeschlagen: ", error);
        return res.status(403).json({
            message: "Authentifizierung fehlgeschlagen.",
        });
    }
}

export default authenticateUser;
