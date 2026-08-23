import express from "express";
import cors from "cors";

import { authenticate } from "./middleware/auth.middleware.js";
import { requirePermission } from "./middleware/permission.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import countryRoutes from "./routes/country.routes.js";

import clientRoutes from "./routes/client.routes.js";
import demandRoutes from "./routes/demand.routes.js";

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/countries", countryRoutes);

app.use("/api/clients", clientRoutes);

app.use("/api/demands", demandRoutes);
// ==========================================
// PERMISSION TEST
// ==========================================

app.get(
  "/api/test/candidate-view",
  authenticate,
  requirePermission("candidate.view"),
  (_req, res) => {
    res.json({
      success: true,
      message: "You have candidate.view permission",
    });
  }
);

// ==========================================
// ROOT
// ==========================================

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Recruitment Management System API is running",
  });
});

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});