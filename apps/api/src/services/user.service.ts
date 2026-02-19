import { db } from './db.service';
import type { User } from '../../generated/prisma';

export type CreateUserInput = {
  email: string;
  name?: string;
  password: string;
};

export type UpdateUserInput = {
  email?: string;
  name?: string;
  password?: string;
};

export type SafeUser = Omit<User, 'password'>;

// Helper to remove password from user
const omitPassword = <T extends User>(user: T): Omit<T, 'password'> => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const findAllUsers = async (): Promise<User[]> =>
  db.user.findMany({
    include: { settings: true },
  });

export const findUserById = async (id: string): Promise<User | null> =>
  db.user.findUnique({
    where: { id },
    include: { settings: true },
  });

export const findUserByEmail = async (email: string): Promise<User | null> =>
  db.user.findUnique({
    where: { email },
    include: { settings: true },
  });

export const createUser = async (input: CreateUserInput): Promise<User> =>
  db.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: input.password, // Note: Hash password in production!
      settings: {
        create: {}, // Creates with default values
      },
    },
    include: { settings: true },
  });

export const updateUser = async (id: string, input: UpdateUserInput): Promise<User | null> => {
  try {
    return await db.user.update({
      where: { id },
      data: input,
      include: { settings: true },
    });
  } catch {
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await db.user.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};

export const toSafeUser = omitPassword;
