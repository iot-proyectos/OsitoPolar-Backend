import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config';
import { AppError } from '../utils';

export const deviceAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-device-key'] as string | undefined;

    if (!apiKey) {
      throw AppError.unauthorized('Missing X-Device-Key header');
    }

    const device = await prisma.device.findUnique({
      where: { apiKey },
      select: {
        id: true,
        userId: true,
        serialNumber: true,
        deletedAt: true,
      },
    });

    if (!device || device.deletedAt !== null) {
      throw AppError.unauthorized('Invalid or deactivated device API key');
    }

    req.device = {
      id: device.id,
      userId: device.userId,
      serialNumber: device.serialNumber,
    };

    next();
  } catch (error) {
    next(error);
  }
};
