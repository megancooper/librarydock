import { db } from './db.service';
import type { Settings } from '../../generated/prisma';

export type UpdateSettingsInput = {
  syncthingUrl?: string;
  syncthingApiKey?: string;
  autoSync?: boolean;
  syncIntervalMinutes?: number;
  libraryPath?: string;
  theme?: string;
  defaultView?: string;
};

export type SyncConfig = {
  syncthingUrl: string;
  syncthingApiKey: string | null;
  autoSync: boolean;
  syncIntervalMinutes: number;
  libraryPath: string;
};

export const findSettingsByUserId = async (userId: string): Promise<Settings | null> =>
  db.settings.findUnique({ where: { userId } });

export const updateSettings = async (
  userId: string,
  input: UpdateSettingsInput
): Promise<Settings | null> => {
  try {
    return await db.settings.upsert({
      where: { userId },
      update: input,
      create: { userId, ...input },
    });
  } catch {
    return null;
  }
};

export const getSyncConfig = async (userId: string): Promise<SyncConfig | null> => {
  const settings = await findSettingsByUserId(userId);
  if (!settings) return null;

  return {
    syncthingUrl: settings.syncthingUrl,
    syncthingApiKey: settings.syncthingApiKey,
    autoSync: settings.autoSync,
    syncIntervalMinutes: settings.syncIntervalMinutes,
    libraryPath: settings.libraryPath,
  };
};
