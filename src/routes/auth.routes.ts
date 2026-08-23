import { Router } from 'express';

import {
  getMe,
  getMyPermissions,
} from '../controllers/auth.controller.js';

import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', authenticate, getMe);

router.get(
  '/permissions',
  authenticate,
  getMyPermissions
);

export default router;