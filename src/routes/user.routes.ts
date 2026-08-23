import { Router } from 'express';

import { getUsers } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';

const router = Router();

router.get(
  '/',
  authenticate,
  requirePermission('user.view'),
  getUsers
);

export default router;