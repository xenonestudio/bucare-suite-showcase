import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/database.config.js';
import { IUser, ICreateUserDTO, IUpdateUserDTO, UserRole } from './users.types.js';

export interface IUsersRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findByRole(role: UserRole): Promise<IUser[]>;
  create(data: ICreateUserDTO & { passwordHash: string }): Promise<IUser>;
  update(id: string, data: IUpdateUserDTO): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
}

export class UsersRepository implements IUsersRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return user as unknown as IUser;
  }

  public async findById(id: string): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return user as unknown as IUser;
  }

  public async findByRole(role: UserRole): Promise<IUser[]> {
    const users = await this.prisma.user.findMany({ where: { role } });
    return users as unknown as IUser[];
  }

  public async create(data: ICreateUserDTO & { passwordHash: string }): Promise<IUser> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        birthDate: data.birthDate,
        phoneNumber: data.phoneNumber,
        role: data.role || 'CLIENTE',
        isActive: true,
      }
    });
    return user as unknown as IUser;
  }

  public async update(id: string, data: IUpdateUserDTO): Promise<IUser | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });
      return user as unknown as IUser;
    } catch (e) {
      return null;
    }
  }

  public async findAll(): Promise<IUser[]> {
    const users = await this.prisma.user.findMany();
    return users as unknown as IUser[];
  }
}
