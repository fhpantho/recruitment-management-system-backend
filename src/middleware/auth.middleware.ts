import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    full_name: string;
    status: boolean;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const authHeader = req.headers.authorization;
    console.log("AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    const token = authHeader.substring(7);

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
      });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, status')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (!user.status) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};