import { AppError } from '../../shared/utils';
import { UserRepository } from './user.repository';
import { UpdateUserInput } from './user.schema';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getProfile(userId: string): Promise<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(
    userId: string,
    input: UpdateUserInput
  ): Promise<{
    id: string;
    name: string;
    email: string;
    role: string;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (input.email && input.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(input.email);
      if (existingUser) {
        throw AppError.conflict('Email already in use');
      }
    }

    const updated = await this.userRepository.update(userId, input);

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    };
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    await this.userRepository.softDelete(userId);
  }
}
