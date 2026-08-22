import { Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthenticatedRequest } from './auth.middleware.js';

export const requirePermission = (permissionCode: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { data, error } = await supabase.rpc('has_permission', {
        p_user_id: req.user.id,
        p_permission_code: permissionCode,
      });

      if (error) {
        console.error('Permission check error:', error);

        return res.status(500).json({
          success: false,
          message: 'Failed to check permission',
        });
      }

      if (data !== true) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
          permission: permissionCode,
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);

      return res.status(500).json({
        success: false,
        message: 'Authorization failed',
      });
    }
  };
};