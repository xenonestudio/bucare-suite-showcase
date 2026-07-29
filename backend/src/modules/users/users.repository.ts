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
  private usersStore: Map<string, IUser> = new Map();

  public async findByEmail(email: string): Promise<IUser | null> {
    for (const user of this.usersStore.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  public async findById(id: string): Promise<IUser | null> {
    return this.usersStore.get(id) || null;
  }

  public async findByRole(role: UserRole): Promise<IUser[]> {
    const results: IUser[] = [];
    for (const user of this.usersStore.values()) {
      if (user.role === role) {
        results.push(user);
      }
    }
    return results;
  }

  public async create(data: ICreateUserDTO & { passwordHash: string }): Promise<IUser> {
    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const user: IUser = {
      id: newId,
      email: data.email,
      fullName: data.fullName,
      birthDate: data.birthDate,
      phoneNumber: data.phoneNumber,
      passwordHash: data.passwordHash,
      role: data.role || 'USUARIO',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    this.usersStore.set(newId, user);
    return user;
  }

  public async update(id: string, data: IUpdateUserDTO): Promise<IUser | null> {
    const existing = this.usersStore.get(id);
    if (!existing) return null;

    const updatedUser: IUser = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    this.usersStore.set(id, updatedUser);
    return updatedUser;
  }

  public async findAll(): Promise<IUser[]> {
    return Array.from(this.usersStore.values());
  }
}
