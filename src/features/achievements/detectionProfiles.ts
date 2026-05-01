import type { AchievementRarity } from "./types";

const STORAGE_KEY = "archivements:detection-profiles";

export type DetectionMatchType = "contains" | "regex";

export interface DetectionProfile {
  id: string;
  gameTitle: string;
  achievementTitle: string;
  description: string;
  rarity: AchievementRarity;
  fileNameIncludes: string;
  pattern: string;
  matchType: DetectionMatchType;
  createdAt: string;
  watchFolderPath: string;
}

export interface DetectionProfileDraft {
  fileNameIncludes: string;
  pattern: string;
  matchType?: DetectionMatchType;
  watchFolderPath: string;
}

export function getDetectionProfiles(): DetectionProfile[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return [];

  try {
    return JSON.parse(raw) as DetectionProfile[];
  } catch {
    return [];
  }
}

export function saveDetectionProfile(profile: DetectionProfile) {
  const profiles = getDetectionProfiles();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([profile, ...profiles])
  );
}

export function deleteDetectionProfile(id: string) {
  const profiles = getDetectionProfiles();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(profiles.filter((profile) => profile.id !== id))
  );
}
