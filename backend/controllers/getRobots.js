import db from "../database/db.js";
import redisClient from "../database/redis.js";

const CACHE_TTL = 10;
const ROBOTS_CACHE_KEY = "allMyRobots";

async function getRobots(_req, res) {
    try {
        // Check if Redis has cached data to send to frontend
        const cachedData = await redisClient.get(ROBOTS_CACHE_KEY);

        if (cachedData) {
            console.log("Daten aus Redis-Cache geliefert.");
            return res.status(200).json({
                source: "cache",
                data: JSON.parse(cachedData),
            });
        }

        // Else query database, then save in Redis cache and send to frontend
        const robotsQuery = await db.query("SELECT * FROM robots ORDER BY id;");
        const robots = robotsQuery.rows;

        await redisClient.set(ROBOTS_CACHE_KEY, JSON.stringify(robots), {
            EX: CACHE_TTL,
        });

        console.log("Cache Miss: Daten aus PostgreSQL geliefert.");
        return res.status(200).json({
            source: "database",
            data: robots,
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der Roboter: ", error);
        return res.status(500).json({
            message: "Interner Serverfehler beim Abrufen der Roboter.",
            error,
        });
    }
}

export default getRobots;
