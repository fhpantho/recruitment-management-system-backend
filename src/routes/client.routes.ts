import { Router } from "express";

import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/client.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";

const router = Router();

// GET all clients
router.get(
  "/",
  authenticate,
  requirePermission("client.view"),
  getClients
);

// CREATE client
router.post(
  "/",
  authenticate,
  requirePermission("client.create"),
  createClient
);

// UPDATE client
router.put(
  "/:id",
  authenticate,
  requirePermission("client.update"),
  updateClient
);

// DELETE client
router.delete(
  "/:id",
  authenticate,
  requirePermission("client.delete"),
  deleteClient
);

export default router;