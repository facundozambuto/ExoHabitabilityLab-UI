import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { scoreColor, scorePercent } from './utils';

/** Circular progress ring showing a 0..1 habitability score. */
@Component({
  selector: 'app-score-ring',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ring" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" [attr.viewBox]="'0 0 ' + size + ' ' + size">
        <circle
          [attr.cx]="size / 2"
          [attr.cy]="size / 2"
          [attr.r]="r"
          fill="none"
          stroke="rgba(120,160,255,0.14)"
          [attr.stroke-width]="stroke"
        />
        <circle
          [attr.cx]="size / 2"
          [attr.cy]="size / 2"
          [attr.r]="r"
          fill="none"
          [attr.stroke]="color"
          [attr.stroke-width]="stroke"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circ"
          [attr.stroke-dashoffset]="offset"
          [attr.transform]="'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'"
          style="transition: stroke-dashoffset 1s ease"
        />
      </svg>
      <div class="label">
        <span class="pct" [style.color]="color">{{ percent }}</span>
        <span class="unit">%</span>
      </div>
    </div>
  `,
  styles: [
    `
      .ring {
        position: relative;
        display: inline-grid;
        place-items: center;
      }
      .label {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-family: 'Orbitron', sans-serif;
      }
      .pct {
        font-size: 1.5rem;
        font-weight: 700;
      }
      .unit {
        font-size: 0.7rem;
        color: var(--muted);
        margin-left: 1px;
      }
    `,
  ],
})
export class ScoreRingComponent {
  @Input({ required: true }) score = 0;
  @Input() size = 96;
  @Input() stroke = 8;

  get r() {
    return (this.size - this.stroke) / 2;
  }
  get circ() {
    return 2 * Math.PI * this.r;
  }
  get offset() {
    return this.circ * (1 - Math.max(0, Math.min(1, this.score)));
  }
  get color() {
    return scoreColor(this.score);
  }
  get percent() {
    return scorePercent(this.score);
  }
}
