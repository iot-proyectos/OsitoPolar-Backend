import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response';

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, 'TOO_MANY_REQUESTS', 'Too many authentication attempts, please try again later');
  },
});

export const ingestLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  keyGenerator: (req) => {
    return (req.headers['x-device-key'] as string) || req.ip || 'unknown';
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, 'TOO_MANY_REQUESTS', 'Too many requests from this device');
  },
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, 'TOO_MANY_REQUESTS', 'Too many requests, please try again later');
  },
});
