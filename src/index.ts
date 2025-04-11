import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createConnection } from "typeorm";
import "reflect-metadata";

// Import routes
import userRoutes from "./routes/user.routes";
import eventRoutes from "./routes/event.routes";
import taskRoutes from "./routes/task.routes";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const initializeDatabase = async () => {
  try {
    await createConnection({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "kaku",
      entities: [__dirname + "/entities/*.ts"],
      synchronize: true, // Set to false in production
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
};

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tasks", taskRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Kaku API" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`Server is running on port ${PORT}`);
});
