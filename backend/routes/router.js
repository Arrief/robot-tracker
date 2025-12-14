import { Router } from "express";
import createRobot from "../controllers/createRobot.js";
import generateAdmin from "../controllers/generateAdmin.js";
import getRobots from "../controllers/getRobots.js";
import loginUser from "../controllers/loginUser.js";
import moveAllRobots from "../controllers/moveAllRobots.js";
import moveRobot from "../controllers/moveRobot.js";
import stopAllRobots from "../controllers/stopAllRobots.js";
import stopRobot from "../controllers/stopRobot.js";
import authenticateUser from "../middleware/authUser.js";

const router = new Router();

// One-time generation of admin user with pre-defined email & password
router.get("/admin-generation", generateAdmin);
// Login for registered users
router.post("/auth/login", loginUser);
// Get robots from database; protected route
router.get("/robots", authenticateUser, getRobots);
// Create a new robot; protected route
router.post("/robots", authenticateUser, createRobot);
// All robots move or stop; protected routes
router.post("/robots/move", authenticateUser, moveAllRobots);
router.post("/robots/stop", authenticateUser, stopAllRobots);
// Single robot move or stop; protected routes
router.post("/robots/:id/move", authenticateUser, moveRobot);
router.post("/robots/:id/stop", authenticateUser, stopRobot);

export default router;
