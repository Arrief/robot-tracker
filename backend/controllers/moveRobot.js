import { setRobotMoving } from "../simulation/robotMovementSimulator.js";

async function moveRobot(req, res) {
    const io = req.app.get("io");

    const robotId = req.params.id;
    if (!robotId || isNaN(robotId)) {
        return res.status(400).json({ message: "Ungültige Roboter ID." });
    }

    try {
        const result = await setRobotMoving(io, robotId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(`Fehler beim Start von Roboter ID ${robotId}: `, error);
        return res.status(500).json({
            message: `Interner Serverfehler beim Start von Roboter ID ${robotId}.`,
        });
    }
}

export default moveRobot;
