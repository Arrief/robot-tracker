import { setAllRobotsMoving } from "../simulation/robotMovementSimulator.js";

async function moveAllRobots(req, res) {
    const io = req.app.get("io");

    try {
        const result = await setAllRobotsMoving(io);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Fehler beim Start aller Roboterbewegungen:", error);
        return res.status(500).json({
            message:
                "Interner Serverfehler beim Start aller Roboterbewegungen.",
        });
    }
}

export default moveAllRobots;
