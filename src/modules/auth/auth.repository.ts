import { prisma } from '../../config';
import { User, RefreshToken } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
  }
}
