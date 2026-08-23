import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";

import {
  getClientDemands,
} from "../controllers/demand.controller.js";

const router = express.Router();

// ==========================================
// GET ALL DEMANDS FOR A CLIENT
// ==========================================

router.get(
  "/client/:clientId",
  authenticate,
  requirePermission("demand.view"),
  getClientDemands
);

export default router;