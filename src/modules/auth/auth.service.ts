import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config';
import { AppError } from '../../shared/utils';
import { JwtPayload } from '../../shared/types';
import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.schema';

const SALT_ROUNDS = 12;

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(input: RegisterInput): Promise<{
    user: { id: string; name: string; email: string };
    accessToken: string;
    refreshToken: string;
  }> {
    const existingUser = await this.authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw AppError.conflict('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await this.authRepository.createUser({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput): Promise<{
    user: { id: string; name: string; email: string };
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const storedToken = await this.authRepository.findRefreshToken(refreshToken);

    if (!storedToken) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.authRepository.deleteRefreshToken(refreshToken);
      throw AppError.unauthorized('Refresh token expired');
    }

    const user = await this.authRepository.findUserById(storedToken.userId);
    if (!user) {
      throw AppError.unauthorized('User not found');
    }

    // Delete old refresh token
    await this.authRepository.deleteRefreshToken(refreshToken);

    // Generate new tokens
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(refreshToken);
  }

  private generateAccessToken(user: { id: string; email: string; role: string }): string {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role as JwtPayload['role'],
    };

    return jwt.sign(payload, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessExpiration as string,
    } as jwt.SignOptions);
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = this.calculateRefreshExpiration();

    await this.authRepository.createRefreshToken({
      token,
      userId,
      expiresAt,
    });

    return token;
  }

  private calculateRefreshExpiration(): Date {
    const expiration = env.jwt.refreshExpiration;
    const match = expiration.match(/^(\d+)([dhms])$/);

    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * (multipliers[unit] || multipliers.d));
  }
}
