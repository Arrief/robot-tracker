import { createClient } from "redis";

const redisClient = createClient({
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error("Redis Verbindunsversuche erschöpft.");
                return new Error(
                    "Redis Verbindung nach 10 Versuchen Fehlgeschlagen."
                );
            }
            console.log(`🔁 Redis Verbindungsversuch ${retries} von 10`);
            return 3000;
        },
    },
});

redisClient.on("error", (error) => {
    console.error("Redis Fehler: ", error);
});

async function connectRedis() {
    try {
        await redisClient.connect();
        console.log("Erfolgreich mit Redis verbunden.");
    } catch (error) {
        // Server läuft ohne Cache weiter
        console.error("Verbindung zu Redis fehlgeschlagen: ", error);
    }
}

await connectRedis();

export async function closeRedisConnection() {
    try {
        if (redisClient.isOpen) {
            await redisClient.quit();
            console.log("Redis-Verbindung erfolgreich beendet.");
        }
    } catch (error) {
        console.error("Fehler beim Beenden der Redis-Verbindung: ", error);
    }
}

export default redisClient;
