import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';

export const getUsers = async (
  _req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        employee_id,
        full_name,
        email,
        phone,
        job_title,
        profile_image,
        status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get users error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
      });
    }

    return res.json({
      success: true,
      users: data,
    });
  } catch (error) {
    console.error('Get users error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};