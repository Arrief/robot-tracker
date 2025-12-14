import { useState } from "react";
import "../styles/Button.css";
import "../styles/Sidebar.css";

const API_URL = import.meta.env.VITE_API_URL;

function Sidebar({
    activeSimulation,
    errorMessage,
    setErrorMessage,
    token,
    robots,
    onStartAllRobots,
    onStopAllRobots,
    onSingleRobot,
}) {
    const [expandedRobots, setExpandedRobots] = useState({});
    const [isAddingRobot, setIsAddingRobot] = useState(false);
    const [newRobotName, setNewRobotName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function toggleRobotHistory(robotId) {
        setExpandedRobots((prev) => ({
            ...prev,
            [robotId]: !prev[robotId],
        }));
    }

    function handleAddClick() {
        setIsAddingRobot(true);
        setNewRobotName("");
        setErrorMessage(null);
    }

    function handleCancel() {
        setIsAddingRobot(false);
        setNewRobotName("");
        setErrorMessage(null);
    }

    async function handleSubmit() {
        if (!newRobotName.trim()) {
            setErrorMessage("Bitte geben Sie einen Namen ein.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await fetch(`${API_URL}/robots`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: newRobotName.trim() }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `Fehler beim Erstellen des Roboters: ${response.status}`
                );
            }

            const data = await response.json();
            console.log("Roboter erfolgreich erstellt: ", data);

            // Reset form and close input field
            setNewRobotName("");
            setIsAddingRobot(false);
        } catch (error) {
            console.error("Error adding robot:", error);
            setErrorMessage(
                error.message || "Fehler beim Hinzufügen des Roboters."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleInputChange(event) {
        setNewRobotName(event.target.value);
        if (errorMessage) {
            setErrorMessage(null);
        }
    }

    return (
        <div className="sidebar">
            <div className="sidebar-robots-header">
                <h2>Deine Roboter</h2>
                <button
                    className="btn btn-add-robot"
                    onClick={handleAddClick}
                    disabled={isAddingRobot}
                >
                    + Neu
                </button>
            </div>

            {isAddingRobot && (
                <div className="add-robot-form">
                    <input
                        type="text"
                        placeholder="Roboter-Name..."
                        value={newRobotName}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        autoFocus
                    />
                    <div className="add-robot-actions">
                        <button
                            className="btn btn-start"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Erstellen..." : "Erstellen"}
                        </button>
                        <button
                            className="btn btn-stop"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Abbrechen
                        </button>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="error-message">{errorMessage}</div>
            )}

            <div className="simulation-actions">
                <button
                    className="btn btn-start"
                    onClick={onStartAllRobots}
                    disabled={activeSimulation}
                >
                    Simulation starten
                </button>

                <button
                    className="btn btn-stop"
                    onClick={onStopAllRobots}
                    disabled={!activeSimulation}
                >
                    Simulation stoppen
                </button>
            </div>

            <ul className="sidebar-robot-list">
                {robots.map((robot) => {
                    const isExpanded = expandedRobots[robot.id];

                    return (
                        <li key={robot.id}>
                            <p className="robot-name">{robot.name}</p>
                            <button
                                className={`btn btn-single-robot btn-${
                                    robot.status === "idle" ? "start" : "stop"
                                }`}
                                onClick={(event) =>
                                    onSingleRobot(event, robot.id, robot.status)
                                }
                            >
                                {robot.status === "idle" ? "MOVE" : "STOP"}
                            </button>

                            <p>
                                Status:{" "}
                                <span
                                    className={`robot-status-${robot.status}`}
                                >
                                    {robot.status}
                                </span>
                            </p>

                            <p className="robot-coordinates-label">Position:</p>
                            <ul className="robot-coordinates">
                                <li>Lat: {robot.lat}</li>
                                <li>Lon: {robot.lon}</li>
                            </ul>

                            <button
                                className="btn btn-robot-history-toggle"
                                onClick={() => toggleRobotHistory(robot.id)}
                                aria-expanded={isExpanded}
                            >
                                Positionsverlauf
                                <span
                                    className={`arrow ${
                                        isExpanded ? "open" : ""
                                    }`}
                                >
                                    ▾
                                </span>
                            </button>

                            <div
                                className={`robot-history ${
                                    isExpanded ? "expanded" : ""
                                }`}
                            >
                                <ul>
                                    {robot.robot_positions?.length ? (
                                        robot.robot_positions.map(
                                            (pos, index) => (
                                                <li key={index}>
                                                    {`Lat: ${pos.lat}, Lon: ${pos.lon}`}
                                                </li>
                                            )
                                        )
                                    ) : (
                                        <li className="robot-history-empty">
                                            Keine Positionsdaten
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default Sidebar;
