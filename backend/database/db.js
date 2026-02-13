import { Pool } from "pg";

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
});

/* Too strict for Docker, use docker compose healthcheck instead:
pool.connect((error, _client, release) => {
    if (error) {
        console.error("Verbindung zur Datenbank fehlgeschlagen: ", error);
        process.exit(1);
    } else {
        console.log("Erfolgreich mit der Datenbank verbunden.");
        release();
    }
});
 */

console.log("Erfolgreich mit der Datenbank verbunden.");

export async function closeDBConnection() {
    try {
        await pool.end();
        console.log("PostgreSQL-Verbindung erfolgreich beendet.");
    } catch (error) {
        console.error("Fehler beim Beenden der PostgreSQL-Verbindung: ", error);
    }
}

export default pool;
