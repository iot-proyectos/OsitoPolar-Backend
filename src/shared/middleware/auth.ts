import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config';
import { JwtPayload } from '../types';
import { AppError } from '../utils';

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw AppError.unauthorized('Token not provided');
    }

    const decoded = jwt.verify(token, env.jwt.accessSecret) as JwtPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(AppError.unauthorized('Access token expired'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(AppError.unauthorized('Invalid access token'));
      return;
    }
    next(error);
  }
};
