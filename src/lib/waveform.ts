/**
 * Pure waveform helpers for the generated-audio player (Feature 10). Kept in
 * a plain .ts module — no JSX, no browser APIs — so the node:test suite can
 * import them directly.
 */

/**
 * Reduce a mono channel to `barCount` normalised peaks (0..1), one max-abs
 * value per bucket, scaled by the global max so quiet clips still fill the
 * waveform.
 */
export function computePeaks(
  channelData: ArrayLike<number>,
  barCount: number,
): number[] {
  const peaks: number[] = new Array<number>(barCount).fill(0);
  const total = channelData.length;
  if (barCount <= 0 || total === 0) return peaks;

  const perBar = total / barCount;
  let globalMax = 0;
  for (let i = 0; i < barCount; i += 1) {
    const start = Math.floor(i * perBar);
    const end = Math.min(total, Math.floor((i + 1) * perBar));
    let max = 0;
    for (let j = start; j < end; j += 1) {
      const value = Math.abs(channelData[j]);
      if (value > max) max = value;
    }
    peaks[i] = max;
    if (max > globalMax) globalMax = max;
  }
  if (globalMax <= 0) return peaks;
  for (let i = 0; i < barCount; i += 1) peaks[i] /= globalMax;
  return peaks;
}
