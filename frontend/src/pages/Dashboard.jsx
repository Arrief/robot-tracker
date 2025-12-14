import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FadeLoader } from "react-spinners";
import { io } from "socket.io-client";
import CityMap from "../components/CityMap";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSimulationActive, setIsSimulationActive] = useState(false);
    const [robots, setRobots] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token-robot-tracker");

    async function handleLogout() {
        localStorage.removeItem("token-robot-tracker");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    }

    async function handleStartAllRobots() {
        setIsSimulationActive(true);
        try {
            const response = await fetch(`${API_URL}/robots/move`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Alle Roboter starten fehlgeschlagen."
                );
            }

            console.log("All robots gestartet.");
        } catch (error) {
            console.error("Error starting robots:", error);
            setErrorMessage(error.message);
            setIsSimulationActive(false);
        }
    }

    async function handleStopAllRobots() {
        setIsSimulationActive(false);
        try {
            const response = await fetch(`${API_URL}/robots/stop`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Alle Roboter stoppen fehlgeschlagen."
                );
            }

            console.log("Alle Roboter gestoppt.");
        } catch (error) {
            console.error("Error stopping robots:", error);
            setErrorMessage(error.message);
            setIsSimulationActive(true);
        }
    }

    async function handleSingleRobot(event, robotId, robotStatus) {
        const isRobotMoving = robotStatus === "moving";
        const button = event.currentTarget;
        button.disabled = true; // prevent spamming

        try {
            setTimeout(() => {
                button.disabled = false;
            }, 1000);

            const response = await fetch(
                `${API_URL}/robots/${robotId}/${
                    isRobotMoving ? "stop" : "move"
                }`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `Roboter ID ${robotId} ${
                            isRobotMoving ? "stoppen" : "starten"
                        } fehlgeschlagen.`
                );
            }

            console.log(
                `Roboter ID ${robotId} ${
                    isRobotMoving ? "gestoppt" : "gestartet"
                }.`
            );
        } catch (error) {
            console.error(
                `Error ${isRobotMoving ? "stopping" : "starting"} robot: `,
                error
            );
            setErrorMessage(error.message);
            setIsSimulationActive(false);
        }
    }

    useEffect(() => {
        if (!token || token === "undefined" || token === "null") {
            navigate("/login");
            return;
        }

        // Request robot data from backend
        async function fetchRobots() {
            try {
                setIsLoading(true);

                const response = await fetch(`${API_URL}/robots`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message ||
                            `Fehler beim Robot-Request: ${response.status}`
                    );
                }

                const data = await response.json();
                setRobots(data.data);
            } catch (error) {
                console.error("Fehler beim Abrufen der Roboter:", error);
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRobots();

        // Establish WebSocket connection to backend
        const socket = io(API_URL);

        // Listen for real-time robot updates
        socket.on("robots_update", (updatedRobots) => {
            setRobots(updatedRobots);
        });

        // Cleanup when component unmounts
        return () => {
            socket.disconnect();
        };
    }, [token, navigate]);

    return isLoading ? (
        <FadeLoader />
    ) : (
        <div className="dashboard-page">
            <CityMap robots={robots} />
            <Header user={user} logout={handleLogout} />
            <Sidebar
                activeSimulation={isSimulationActive}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                token={token}
                robots={robots}
                onStartAllRobots={handleStartAllRobots}
                onStopAllRobots={handleStopAllRobots}
                onSingleRobot={handleSingleRobot}
            />
        </div>
    );
}

export default Dashboard;
