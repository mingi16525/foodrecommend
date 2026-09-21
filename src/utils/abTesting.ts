import crypto from 'crypto';

export type ExperimentGroup = 'A' | 'B';

/**
 * Hash a user ID and return an experiment group based on modulo.
 * Uses a simple MD5 hash for consistent bucketing.
 */
export function getExperimentGroup(userId: string, experimentName: string): ExperimentGroup {
  const hash = crypto.createHash('md5').update(`${userId}:${experimentName}`).digest('hex');
  // Use first 8 characters to parse as int
  const intVal = parseInt(hash.substring(0, 8), 16);
  return intVal % 2 === 0 ? 'A' : 'B';
}
