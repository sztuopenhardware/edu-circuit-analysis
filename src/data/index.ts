import { CHAPTERS } from './chapters';
import { CASES_CH1_CH2 } from './cases_ch1_ch2';
import { CASES_CH3_CH4 } from './cases_ch3_ch4';
import { CASES_CH6_CH7_CH8 } from './cases_ch6_ch7_ch8';
import { CASES_CH9_TO_CH12 } from './cases_ch9_ch10_ch11_ch12';
import { CASES_LABS } from './cases_labs';
import type { CaseDefinition, ChapterDefinition } from '../types/circuit';

export const ALL_CHAPTERS: ChapterDefinition[] = CHAPTERS;

export const ALL_CASES: CaseDefinition[] = [
  ...CASES_CH1_CH2,
  ...CASES_CH3_CH4,
  ...CASES_CH6_CH7_CH8,
  ...CASES_CH9_TO_CH12,
  ...CASES_LABS,
];

export function getCasesByChapter(chapterId: string): CaseDefinition[] {
  return ALL_CASES.filter((c) => c.chapterId === chapterId);
}
