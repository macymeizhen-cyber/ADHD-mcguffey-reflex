export type MissionProgress = 'Foundation' | 'Developing' | 'Expanding' | 'Complex' | 'Graduation';

export const levelOrder: MissionProgress[] = [
  'Foundation',
  'Developing',
  'Expanding',
  'Complex',
  'Graduation',
];

export function getCompletionPercent(completedCount: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completedCount / total) * 100);
}

export function getProgressStatus(completedCount: number, total: number): string {
  const percent = getCompletionPercent(completedCount, total);

  if (percent >= 100) {
    return 'Complete';
  }

  if (percent >= 75) {
    return 'Strong momentum';
  }

  if (percent >= 50) {
    return 'Steady progress';
  }

  if (percent >= 20) {
    return 'Getting started';
  }

  return 'Fresh start';
}

export function getStudyFocusScore(completedLessons: string[], shadowVerified: boolean, streak = 1): number {
  return completedLessons.length * 10 + (shadowVerified ? 5 : 0) + streak * 2;
}

export function getNextMilestoneLabel(percent: number): string {
  if (percent >= 100) {
    return 'Release candidate: complete curriculum';
  }

  if (percent >= 75) {
    return 'Final stretch: finish the last lessons';
  }

  if (percent >= 50) {
    return 'Middle phase: keep the rhythm going';
  }

  if (percent >= 25) {
    return 'Momentum phase: build the reading reflex';
  }

  return 'Starter phase: complete the first mission';
}
