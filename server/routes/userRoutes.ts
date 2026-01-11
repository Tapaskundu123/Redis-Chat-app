import { Router } from "express";
import { Chatgroup } from "../src/controllers/ChatGroupController";
import { AuthLogin } from "../src/controllers/AuthController";
import AuthMiddleware from "../src/middleware/AuthMiddleware";

const router = Router();

// Auth
router.post("/auth/login", AuthLogin);

// Chat Group routes
router.post("/chat-group", AuthMiddleware, Chatgroup.post);
router.get("/chat-group", AuthMiddleware, Chatgroup.get);
router.put("/chat-group/:id", AuthMiddleware, Chatgroup.update);

export default router;
