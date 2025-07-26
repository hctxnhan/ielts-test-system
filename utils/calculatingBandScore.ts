type BandRange = {
  band: number;
  min: number;
  max: number;
};

type IELTSBandData = {
  testType: string;
  bands: BandRange[];
};

import bandData from './ieltsBandRanges.json';

// 'listening' | 'general_reading' | 'academic_reading',
export function getIeltsBandScore(
  testType: string,
  score: number
): number | null {
  const test = (bandData as IELTSBandData[]).find(t => t.testType === testType);
  if (!test) return null;

  const band = test.bands.find(range => score >= range.min && score <= range.max);
  return band ? band.band : null;
}
