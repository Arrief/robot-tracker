import db from "../database/db.js";
import redisClient from "../database/redis.js";

const CACHE_TTL = 10;
const ROBOTS_CACHE_KEY = "allMyRobots";

// Coordinates for the boundaries of the frontend map
const LEIPZIG_AREA = {
    WEST: 12.22,
    SOUTH: 51.26,
    EAST: 12.54,
    NORTH: 51.44,
};

const LEIPZIG_CENTER = {
    LAT: 51.340863,
    LON: 12.375919,
};

const SIMULATION_INTERVAL_MS = 2000;

// IDs of moving robots
const movingRobots = new Set();

// Global simulation timer
let simulationTimer = null;

/*
    MOVEMENT FUNCTION
    generate random position within Leipzig based on current position
*/

function generateRandomPosition(currentLat, currentLon) {
    // 0.0005 degrees ca. 50-70 meters
    const deltaLat = (Math.random() - 0.5) * 0.0005;
    const deltaLon = (Math.random() - 0.5) * 0.0005;

    let newLat = parseFloat(currentLat) + deltaLat;
    let newLon = parseFloat(currentLon) + deltaLon;

    // Check if robot's new position would be outside of Leipzig, if yes set back to center
    const outsideLatBoundary =
        newLat < LEIPZIG_AREA.SOUTH || newLat > LEIPZIG_AREA.NORTH;
    const outsideLonBoundary =
        newLon < LEIPZIG_AREA.WEST || newLon > LEIPZIG_AREA.EAST;

    if (outsideLatBoundary || outsideLonBoundary) {
        newLat = LEIPZIG_CENTER.LAT;
        newLon = LEIPZIG_CENTER.LON;
    }

    return {
        lat: newLat.toFixed(7),
        lon: newLon.toFixed(7),
    };
}

/*
    MAIN FUNCTION:
    move a robot, update database, websocket broadcast
*/

async function updateRobotPositions(io) {
    let client;
    try {
        client = await db.connect();

        let allRobots;
        const cachedRobots = await redisClient.get(ROBOTS_CACHE_KEY);

        if (cachedRobots) {
            allRobots = JSON.parse(cachedRobots);
        } else {
            const allRobotsQuery = await client.query(
                "SELECT * FROM robots ORDER BY id;",
            );
            const allRobots = allRobotsQuery.rows;
        }

        // Update database
        await client.query("BEGIN");
        const updatedRobots = [];

        for (const robot of allRobots) {
            // If not moving, keep position & set idle
            if (!movingRobots.has(robot.id)) {
                if (robot.status === "moving") {
                    const idleQuery = await client.query(
                        `
                        UPDATE robots
                        SET status = 'idle',
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = $1
                        RETURNING *;
                        `,
                        [robot.id],
                    );
                    updatedRobots.push(idleQuery.rows[0]);
                } else {
                    updatedRobots.push(robot);
                }
                continue;
            }

            // If moving, assign new position and add previous to log
            const newPos = generateRandomPosition(robot.lat, robot.lon);

            const previousPositionsLog = robot.robot_positions || [];
            previousPositionsLog.push({ lat: robot.lat, lon: robot.lon });

            // Limit log to 10 entries, remove oldest when more
            if (previousPositionsLog.length > 10) {
                previousPositionsLog.shift();
            }

            const updateQuery = await client.query(
                `
                UPDATE robots
                SET 
                    lat = $1,
                    lon = $2,
                    status = 'moving',
                    robot_positions = $3::jsonb,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING *;
                `,
                [
                    newPos.lat,
                    newPos.lon,
                    JSON.stringify(previousPositionsLog),
                    robot.id,
                ],
            );

            updatedRobots.push(updateQuery.rows[0]);
        }

        await client.query("COMMIT");

        await redisClient.set(ROBOTS_CACHE_KEY, JSON.stringify(updatedRobots), {
            EX: movingRobots.size === 0 ? CACHE_TTL : undefined,
        });

        // Websocket broadcast, make sure robots stay in correct order
        updatedRobots.sort((a, b) => a.id - b.id);
        io.emit("robots_update", updatedRobots);

        // Check if this was the final update, setting all to idle with no more robots moving
        if (movingRobots.size === 0) {
            if (simulationTimer) {
                clearInterval(simulationTimer);
                simulationTimer = null;
            }
        }
    } catch (error) {
        console.error("Fehler im globalen Simulationstimer: ", error);
        if (client) await client.query("ROLLBACK");

        // Stop simulation on error
        if (simulationTimer) {
            clearInterval(simulationTimer);
            simulationTimer = null;
        }
    } finally {
        if (client) client.release();
    }
}

/*
    SIMULATION FUNCTION
    Runs the simulation by repeating the main function in intervals
*/

async function startSimulation(io) {
    if (simulationTimer) return; // Already running

    // Immediate execution right away without delay
    await updateRobotPositions(io);

    // Then interval for subsequent updates
    simulationTimer = setInterval(async () => {
        await updateRobotPositions(io);
    }, SIMULATION_INTERVAL_MS);
}

/*
    PUBLIC CONTROLLER FUNCTIONS:
    start or stop movement of one or all robots
*/

export async function setRobotMoving(io, robotId) {
    movingRobots.add(Number(robotId));
    await startSimulation(io);

    return {
        message: `Roboter ID ${robotId} startet Bewegung.`,
        status: "moving",
    };
}

export async function setRobotIdle(robotId) {
    movingRobots.delete(Number(robotId));

    return {
        message: `Roboter ID ${robotId} gestoppt.`,
        status: "idle",
    };
}

export async function setAllRobotsMoving(io) {
    const allRobotsQuery = await db.query("SELECT id FROM robots;");
    allRobotsQuery.rows.forEach((robot) => movingRobots.add(robot.id));

    await startSimulation(io);

    return {
        message: "Alle Roboter starten Bewegung.",
    };
}

export async function setAllRobotsIdle() {
    movingRobots.clear();
    return {
        message: "Alle Roboter gestoppt.",
    };
}
