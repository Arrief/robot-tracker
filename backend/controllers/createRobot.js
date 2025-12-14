import db from "../database/db.js";
import redisClient from "../database/redis.js";

const ROBOTS_CACHE_KEY = "allMyRobots";

async function createRobot(req, res) {
    const io = req.app.get("io");

    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({
            message: "Roboter-Name ist erforderlich.",
        });
    }

    try {
        const createNewRobotQuery = await db.query(
            `
        INSERT INTO robots
            (name, status, lat, lon, robot_positions) 
            VALUES ($1, $2, $3, $4, $5) 
        RETURNING
            id, name, status, lat, lon, robot_positions, created_at, updated_at;`,
            [name.trim(), "idle", 51.340863, 12.375919, JSON.stringify([])]
        );

        const newRobot = createNewRobotQuery.rows[0];

        // Delete old Redis cache, get all robots again and broadcast update to the frontend
        await redisClient.del(ROBOTS_CACHE_KEY);
        console.log("Redis-Cache nach Roboter-Erstellung gelöscht.");

        const allRobotsQuery = await db.query(
            "SELECT * FROM robots ORDER BY id;"
        );
        const allRobots = allRobotsQuery.rows;

        io.emit("robots_update", allRobots);
        console.log("WebSocket-Update mit neu erstelltem Roboter.");

        return res.status(201).json({
            message: "Roboter wurde erfolgreich erstellt.",
            robot: newRobot,
        });
    } catch (error) {
        console.error("Fehler beim Erstellen des Roboters: ", error);
        return res.status(500).json({
            message: "Interner Serverfehler beim Erstellen des Roboters.",
            error,
        });
    }
}

export default createRobot;
