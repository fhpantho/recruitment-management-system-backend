import { Router } from "express";

import {
  getCountries,
  createCountry,
  updateCountry,
  deleteCountry,
} from "../controllers/country.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";

const router = Router();

// ==========================================
// GET ALL COUNTRIES
// ==========================================

router.get(
  "/",
  authenticate,
  requirePermission("country.view"),
  getCountries
);

// ==========================================
// CREATE COUNTRY
// ==========================================

router.post(
  "/",
  authenticate,
  requirePermission("country.create"),
  createCountry
);

// ==========================================
// UPDATE COUNTRY
// ==========================================

router.put(
  "/:id",
  authenticate,
  requirePermission("country.update"),
  updateCountry
);

// ==========================================
// DELETE COUNTRY
// ==========================================

router.delete(
  "/:id",
  authenticate,
  requirePermission("country.delete"),
  deleteCountry
);

export default router;