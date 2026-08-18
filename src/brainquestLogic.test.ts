import { describe, expect, it } from 'vitest';
import {
  getCompletionPercent,
  getNextMilestoneLabel,
  getProgressStatus,
  getStudyFocusScore,
} from './brainquestLogic';

describe('BrainQuest learning logic', () => {
  it('calculates completion percentage correctly', () => {
    expect(getCompletionPercent(15, 30)).toBe(50);
    expect(getCompletionPercent(0, 0)).toBe(0);
  });

  it('gives a readable readiness state', () => {
    expect(getProgressStatus(30, 30)).toBe('Complete');
    expect(getProgressStatus(10, 30)).toBe('Getting started');
  });

  it('scores focus and reflection milestones', () => {
    expect(getStudyFocusScore(['lesson-1'], true, 3)).toBe(21);
    expect(getStudyFocusScore([], false, 1)).toBe(2);
  });

  it('provides milestone guidance', () => {
    expect(getNextMilestoneLabel(80)).toBe('Final stretch: finish the last lessons');
    expect(getNextMilestoneLabel(10)).toBe('Starter phase: complete the first mission');
  });
});
