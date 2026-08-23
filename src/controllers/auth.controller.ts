import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';

export const getMe = (
  req: AuthenticatedRequest,
  res: Response
) => {
  res.json({
    success: true,
    user: req.user,
  });
};

export const getMyPermissions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles (
          role_permissions (
            permissions (
              code
            )
          )
        )
      `)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Permission fetch error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch permissions',
      });
    }

    const permissions = new Set<string>();

    for (const userRole of data ?? []) {
      const roles = userRole.roles;

      if (!roles) continue;

      const roleList = Array.isArray(roles)
        ? roles
        : [roles];

      for (const role of roleList) {
        if (!role?.role_permissions) continue;

        for (const rolePermission of role.role_permissions) {
          const permission = rolePermission.permissions;

          if (!permission) continue;

          const permissionList = Array.isArray(permission)
            ? permission
            : [permission];

          for (const item of permissionList) {
            if (item?.code) {
              permissions.add(item.code);
            }
          }
        }
      }
    }

    return res.json({
      success: true,
      permissions: Array.from(permissions),
    });
  } catch (error) {
    console.error('Get permissions error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions',
    });
  }
};