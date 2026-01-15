import { Router } from "express";
import { Chatgroup } from "../src/controllers/ChatGroupController";
import { AuthLogin } from "../src/controllers/AuthController";
import AuthMiddleware from "../src/middleware/AuthMiddleware";

import { ChatController } from "../src/controllers/ChatController";
import { getChatExistsController } from './../src/controllers/chatExistsController';

const router = Router();

// Auth
router.post("/auth/login", AuthLogin);

// Chat Group routes
router.post("/chat-group", AuthMiddleware, Chatgroup.post);
router.get("/chat-group", AuthMiddleware, Chatgroup.get);
router.put("/chat-group/:id", AuthMiddleware, Chatgroup.update);

// Chat routes
router.get("/chats/:groupId", AuthMiddleware, ChatController.getChats);
router.get("/chats/exists/:id", AuthMiddleware,getChatExistsController.getChatExists);
export default router;
