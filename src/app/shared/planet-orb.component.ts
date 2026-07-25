import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Procedurally-tinted CSS planet orb. Colour & atmosphere are derived from the
 * equilibrium temperature and radius so every world looks a bit different.
 */
@Component({
  selector: 'app-planet-orb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="orb-wrap" [style.width.px]="size" [style.height.px]="size">
      <div class="orb" [style.background]="gradient" [style.box-shadow]="glow"></div>
      <div class="ring" *ngIf="hasRing" [style.border-color]="ringColor"></div>
    </div>
  `,
  styles: [
    `
      .orb-wrap {
        position: relative;
        display: inline-grid;
        place-items: center;
      }
      .orb {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: relative;
        animation: spin-orb 26s linear infinite;
      }
      .orb::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: radial-gradient(circle at 68% 68%, transparent 55%, rgba(0, 0, 0, 0.55) 100%);
      }
      .ring {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 150%;
        height: 40%;
        border: 2px solid;
        border-radius: 50%;
        transform: translate(-50%, -50%) rotate(-18deg);
        opacity: 0.55;
      }
      @keyframes spin-orb {
        from {
          background-position: 0 0;
        }
        to {
          background-position: 200px 0;
        }
      }
    `,
  ],
  imports: [CommonModule],
})
export class PlanetOrbComponent {
  @Input() size = 120;
  @Input() temp?: number | null;
  @Input() radius?: number | null;

  private get hue(): { c1: string; c2: string; c3: string } {
    const t = this.temp ?? 280;
    if (t > 1200) return { c1: '#fff3b0', c2: '#f97316', c3: '#7c2d12' }; // lava
    if (t > 600) return { c1: '#fca5a5', c2: '#dc2626', c3: '#450a0a' }; // hot
    if (t > 350) return { c1: '#fcd34d', c2: '#d97706', c3: '#78350f' }; // warm
    if (t >= 220) return { c1: '#a7f3d0', c2: '#0ea5e9', c3: '#0c4a6e' }; // temperate / water
    if (t >= 150) return { c1: '#e0e7ff', c2: '#818cf8', c3: '#312e81' }; // cool
    return { c1: '#ffffff', c2: '#93c5fd', c3: '#1e3a8a' }; // frozen
  }

  get gradient(): string {
    const { c1, c2, c3 } = this.hue;
    return `radial-gradient(circle at 32% 30%, ${c1} 0%, ${c2} 45%, ${c3} 100%),
            repeating-linear-gradient(100deg, rgba(255,255,255,0.05) 0 8px, transparent 8px 20px)`;
  }

  get glow(): string {
    const { c2 } = this.hue;
    return `0 0 ${this.size / 2}px ${c2}55, inset -6px -8px 20px rgba(0,0,0,0.5)`;
  }

  get hasRing(): boolean {
    return (this.radius ?? 0) >= 6; // gas giants get rings
  }

  get ringColor(): string {
    return this.hue.c1;
  }
}
