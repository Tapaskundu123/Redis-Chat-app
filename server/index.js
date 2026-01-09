
import express from "express";

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Express server is running");
});

// Sample API route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is healthy" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
