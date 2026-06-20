import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { env } from '../../config';
import { AppError } from '../utils';

const uploadDir = path.resolve(process.cwd(), 'uploads', 'sections');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

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
