import express from "express";
import UserRoutes from './routes/userRoutes.ts'
import cors from 'cors'
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: "http://localhost:3000",
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

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
