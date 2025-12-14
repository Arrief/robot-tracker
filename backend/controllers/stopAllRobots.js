import { setAllRobotsIdle } from "../simulation/robotMovementSimulator.js";

async function stopAllRobots(_req, res) {
    try {
        const result = await setAllRobotsIdle();
        return res.status(200).json(result);
    } catch (error) {
        console.error("Fehler beim Stoppen aller Roboter:", error);
        return res.status(500).json({
            message:
                "Interner Serverfehler beim Stoppen aller Roboterbewegungen.",
        });
    }
}

export default stopAllRobots;
