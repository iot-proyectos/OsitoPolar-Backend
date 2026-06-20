import { JwtPayload, DevicePayload } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      device?: DevicePayload;
    }
  }
}
