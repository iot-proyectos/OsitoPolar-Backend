import multer from 'multer';
import { env } from '../../config';
import { AppError } from '../utils';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PNG, JPEG, and WebP images are allowed', 400, 'INVALID_FILE_TYPE'));
  }
};

export const uploadSectionImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxSize,
  },
});
