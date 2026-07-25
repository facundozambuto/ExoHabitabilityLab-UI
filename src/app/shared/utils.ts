import { Exoplanet } from '../core/models';

/** Colour ramp for a 0..1 habitability score. */
export function scoreColor(score: number): string {
  if (score >= 0.75) return '#34d399'; // emerald
  if (score >= 0.55) return '#a3e635'; // lime
  if (score >= 0.4) return '#fbbf24'; // amber
  if (score >= 0.25) return '#fb923c'; // orange
  return '#f87171'; // red
}

export function scorePercent(score: number): number {
  return Math.round(score * 100);
}

export function num(v: number | undefined | null, digits = 2, suffix = ''): string {
  if (v === undefined || v === null || Number.isNaN(v)) return '—';
  return `${Number(v.toFixed(digits))}${suffix}`;
}

/** Rough qualitative planet class used for the emoji / label. */
export function planetType(p: Partial<Exoplanet>): { label: string; emoji: string } {
  const r = p.planet_radius_earth;
  const t = p.equilibrium_temp_k;
  if (r == null) return { label: 'Unknown', emoji: '🪐' };
  let label: string;
  if (r < 1.25) label = 'Terrestrial';
  else if (r < 2) label = 'Super-Earth';
  else if (r < 6) label = 'Neptune-like';
  else label = 'Gas Giant';

  let emoji = '🪐';
  if (t != null) {
    if (t > 1000) emoji = '🌋';
    else if (t > 400) emoji = '🔥';
    else if (t >= 220 && t <= 320) emoji = '🌍';
    else if (t < 180) emoji = '❄️';
    else emoji = '🪐';
  }
  return { label, emoji };
}

/** Temperature relative to Earth-like comfort, for tinting. */
export function tempTint(t: number | undefined | null): string {
  if (t == null) return '#64748b';
  if (t > 1000) return '#ef4444';
  if (t > 400) return '#f97316';
  if (t >= 220 && t <= 320) return '#22c55e';
  if (t < 180) return '#38bdf8';
  return '#eab308';
}
