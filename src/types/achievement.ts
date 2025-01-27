export type AchievementType = 'academic' | 'behavior' | 'attendance' | 'special';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  points: number;
  icon: string;
  criteria?: string;
  earnedCount?: number;
}