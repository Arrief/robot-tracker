import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { closeDBConnection } from "./database/db.js";
import { closeRedisConnection } from "./database/redis.js";
import router from "./routes/router.js";

let isShuttingDown = false;
const port = process.env.PORT || 3000;

const app = express();
const httpServer = http.createServer(app); // for Websocket connection

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Global access to Socket.IO server for all controllers
app.set("io", io);

// Websocket connection handler
io.on("connection", (socket) => {
    console.log(`Neuer Client verbunden: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`Client getrennt: ${socket.id}`);
    });
});

app.use(cors());
app.use(express.json());

app.use(router);

async function shutdown() {
    // Prevent function from being called repeatedly e.g. from nodemon or node --watch
    if (isShuttingDown) return;

    isShuttingDown = true;
    console.log("[SHUTDOWN] Server wird heruntergefahren...");

    // 1. Closing HTTP/WebSocket-Server
    httpServer.close(async (error) => {
        if (error) {
            console.error("Fehler beim Schließen des HTTP-Servers:", error);
        } else {
            console.log("HTTP- und WebSocket-Server beendet.");
        }

        // Closing connections to database & Redis
        await closeDBConnection();
        await closeRedisConnection();

        // Closing the process
        console.log("[SHUTDOWN] Prozess beendet.");
        process.exit(0);
    });

    // Timeout as final fallback if server is unresponsive for 10 seconds
    setTimeout(() => {
        console.error("[SHUTDOWN] Timeout! Erzwinge das Beenden.");
        process.exit(1);
    }, 10000);
}

// Listeners for shutdown signals
process.on("SIGINT", shutdown); // Ctrl+C
process.on("SIGTERM", shutdown); // Kubernetes, Docker, etc.

httpServer.listen(port, (error) => {
    if (error) console.error("Verbindung zu Server fehlgeschlagen...", error);
    console.log(`Die Robot-Tracker Schnittstelle ist aktiv auf Port ${port}.`);
    console.log("WebSocket-Server ist aktiv.");
});
