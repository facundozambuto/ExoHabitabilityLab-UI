import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { RankedPlanet } from '../core/models';
import { PlanetOrbComponent } from '../shared/planet-orb.component';
import { scoreColor, scorePercent, num, planetType } from '../shared/utils';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, PlanetOrbComponent],
  template: `
    <div class="page container">
      <header class="head">
        <h1>🏆 Top habitable worlds</h1>
        <p class="muted">
          Every planet in the catalogue scored across 13 factors and ranked. The higher the score, the more
          Earth-like the conditions we currently know about.
        </p>
      </header>

      <div *ngIf="loading()" class="center-load"><div class="spinner"></div>Ranking the catalogue…</div>
      <div *ngIf="error()" class="panel err">Could not load the ranking. Please try again later.</div>

      <div class="board" *ngIf="!loading() && !error()">
        <a
          *ngFor="let p of planets(); let i = index"
          [routerLink]="['/planet', p.id]"
          class="row panel"
          [class.podium]="i < 3"
        >
          <div class="rank" [attr.data-rank]="i + 1">
            <span *ngIf="i === 0">🥇</span>
            <span *ngIf="i === 1">🥈</span>
            <span *ngIf="i === 2">🥉</span>
            <span *ngIf="i > 2">{{ i + 1 }}</span>
          </div>
          <app-planet-orb [size]="58" [temp]="p.equilibrium_temp_k" [radius]="p.planet_radius_earth" />
          <div class="info">
            <strong>{{ p.name }}</strong>
            <div class="tags">
              <span class="chip">{{ type(p).emoji }} {{ type(p).label }}</span>
              <span class="chip" *ngIf="p.host_star">⭐ {{ p.host_star }}</span>
              <span class="chip" *ngIf="p.equilibrium_temp_k">🌡️ {{ num(p.equilibrium_temp_k, 0, ' K') }}</span>
              <span class="chip" *ngIf="p.distance_pc">📏 {{ num(p.distance_pc, 0, ' pc') }}</span>
            </div>
          </div>
          <div class="score">
            <div class="bar">
              <div class="fill" [style.width.%]="pct(p.total_score)" [style.background]="color(p.total_score)"></div>
            </div>
            <span class="val" [style.color]="color(p.total_score)">{{ pct(p.total_score) }}%</span>
            <span class="cat muted">{{ p.score_category }}</span>
          </div>
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .head {
        margin-bottom: 26px;
      }
      .head h1 {
        font-size: 2rem;
        margin-bottom: 8px;
      }
      .head p {
        max-width: 620px;
        line-height: 1.6;
      }
      .board {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .row {
        display: grid;
        grid-template-columns: 48px 58px 1fr 200px;
        align-items: center;
        gap: 16px;
        padding: 14px 18px;
        transition: transform 0.18s, border-color 0.18s;
      }
      .row:hover {
        transform: translateX(4px);
        border-color: var(--border-strong);
      }
      .row.podium {
        border-color: rgba(251, 191, 36, 0.35);
        background: linear-gradient(90deg, rgba(251, 191, 36, 0.06), transparent 60%);
      }
      .rank {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.3rem;
        font-weight: 700;
        text-align: center;
        color: var(--muted);
      }
      .info {
        min-width: 0;
      }
      .info strong {
        font-size: 1.05rem;
      }
      .tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 6px;
      }
      .score {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 4px 10px;
      }
      .bar {
        grid-column: 1 / 2;
        height: 8px;
        background: rgba(120, 160, 255, 0.12);
        border-radius: 999px;
        overflow: hidden;
      }
      .fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.9s ease;
      }
      .val {
        grid-column: 2 / 3;
        grid-row: 1;
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
      }
      .cat {
        grid-column: 1 / 3;
        font-size: 0.75rem;
      }
      .err {
        padding: 20px;
        text-align: center;
      }
      @media (max-width: 720px) {
        .row {
          grid-template-columns: 38px 48px 1fr;
        }
        .score {
          grid-column: 1 / 4;
          grid-template-columns: 1fr auto;
          margin-top: 6px;
        }
      }
    `,
  ],
})
export class TopComponent {
  private api = inject(ApiService);
  loading = signal(true);
  error = signal(false);
  planets = signal<RankedPlanet[]>([]);

  constructor() {
    this.api.topHabitable(15).subscribe({
      next: (r) => {
        this.planets.set(r.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  color = scoreColor;
  pct = scorePercent;
  num = num;
  type = planetType;
}
