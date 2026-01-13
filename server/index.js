import "dotenv/config";
import express from "express";
import UserRoutes from './routes/userRoutes.ts'
import cors from 'cors'
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { createServer } from "http";
import { setupSocket } from "./socket.ts";

const app = express();

const server = createServer(app);
const io= new Server(server,{
  cors:{
    origin:'*',
    methods:['GET','POST']
  }
});


setupSocket(io);
export {io};


const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
// Routes
app.use("/api", UserRoutes);



// Test route
app.get("/", (req, res) => {
  res.send("🚀 Express server is running");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is healthy" });
});

server.listen(PORT, () => {
  console.log('server running at http://localhost:5000');
});