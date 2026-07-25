import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { RankedPlanet } from '../core/models';
import { PlanetOrbComponent } from '../shared/planet-orb.component';
import { scoreColor, scorePercent } from '../shared/utils';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, PlanetOrbComponent],
  template: `
    <div class="page">
      <section class="hero container">
        <div class="hero-copy">
          <span class="chip">🛰️ NASA Exoplanet Archive · live data</span>
          <h1 class="title">
            Explore worlds where <span class="gradient-text">life could emerge</span>
          </h1>
          <p class="lead">
            ExoHabitabilityLab scores real exoplanets across <strong>13 scientific factors</strong> —
            from their star and orbit to temperature, gravity and atmosphere retention — to estimate how
            hospitable they might be. Dive in, search the catalogue, compare worlds and generate AI art
            of distant planets.
          </p>
          <div class="cta">
            <a routerLink="/top" class="btn btn-primary">🏆 Top 10 habitable</a>
            <a routerLink="/explore" class="btn">🔭 Explore all</a>
          </div>
          <p class="disclaimer muted">
            ⚠️ This is not a life-detection tool. Scores are probabilistic indicators for further study.
          </p>
        </div>
        <div class="hero-orb">
          <app-planet-orb [size]="260" [temp]="270" [radius]="1.1" />
          <div class="orbit"></div>
          <div class="orbit orbit-2"></div>
        </div>
      </section>

      <section class="container features">
        <a routerLink="/top" class="feature panel">
          <span class="fe-ico">🏆</span>
          <h3>Habitability leaderboard</h3>
          <p class="muted">The most promising worlds in the catalogue, ranked by our scoring engine.</p>
        </a>
        <a routerLink="/explore" class="feature panel">
          <span class="fe-ico">🔍</span>
          <h3>Search & filter</h3>
          <p class="muted">Browse every exoplanet, filter by star type, size and discovery year.</p>
        </a>
        <a routerLink="/compare" class="feature panel">
          <span class="fe-ico">⚖️</span>
          <h3>Compare worlds</h3>
          <p class="muted">Put planets side by side and see how their properties and scores stack up.</p>
        </a>
        <a routerLink="/methodology" class="feature panel">
          <span class="fe-ico">🧪</span>
          <h3>How scoring works</h3>
          <p class="muted">The science, the 13 factors, references and honest limitations.</p>
        </a>
      </section>

      <section class="container preview">
        <div class="preview-head">
          <h2>Featured worlds</h2>
          <a routerLink="/top" class="muted">View full ranking →</a>
        </div>

        <div *ngIf="loading()" class="center-load"><div class="spinner"></div>Scoring the catalogue…</div>

        <div class="preview-grid" *ngIf="!loading()">
          <a *ngFor="let p of featured()" [routerLink]="['/planet', p.id]" class="mini panel">
            <app-planet-orb [size]="72" [temp]="p.equilibrium_temp_k" [radius]="p.planet_radius_earth" />
            <div class="mini-info">
              <strong>{{ p.name }}</strong>
              <span class="muted">{{ p.host_star }}</span>
            </div>
            <span class="mini-score" [style.color]="color(p.total_score)">{{ pct(p.total_score) }}%</span>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .hero {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 40px;
        align-items: center;
        padding: 40px 20px 60px;
      }
      .title {
        font-size: clamp(2.1rem, 5vw, 3.5rem);
        line-height: 1.05;
        margin: 18px 0;
      }
      .lead {
        font-size: 1.05rem;
        color: #c3cde3;
        max-width: 560px;
        line-height: 1.6;
      }
      .cta {
        display: flex;
        gap: 12px;
        margin: 26px 0 14px;
        flex-wrap: wrap;
      }
      .disclaimer {
        font-size: 0.8rem;
      }
      .hero-orb {
        position: relative;
        display: grid;
        place-items: center;
        height: 340px;
      }
      .orbit {
        position: absolute;
        width: 320px;
        height: 320px;
        border: 1px solid rgba(120, 160, 255, 0.18);
        border-radius: 50%;
        animation: rot 18s linear infinite;
      }
      .orbit::before {
        content: '';
        position: absolute;
        top: -4px;
        left: 50%;
        width: 8px;
        height: 8px;
        background: var(--cyan);
        border-radius: 50%;
        box-shadow: 0 0 12px var(--cyan);
      }
      .orbit-2 {
        width: 400px;
        height: 400px;
        border-color: rgba(167, 139, 250, 0.14);
        animation-duration: 30s;
      }
      .orbit-2::before {
        background: var(--violet);
        box-shadow: 0 0 12px var(--violet);
      }
      @keyframes rot {
        to {
          transform: rotate(360deg);
        }
      }
      .features {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
        margin-bottom: 60px;
      }
      .feature {
        padding: 24px;
        transition: transform 0.2s, border-color 0.2s;
      }
      .feature:hover {
        transform: translateY(-4px);
        border-color: var(--border-strong);
      }
      .fe-ico {
        font-size: 1.8rem;
      }
      .feature h3 {
        font-size: 1.05rem;
        margin: 12px 0 8px;
        color: var(--text);
      }
      .feature p {
        font-size: 0.86rem;
        line-height: 1.5;
      }
      .preview-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .preview-head h2 {
        font-size: 1.5rem;
      }
      .preview-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }
      .mini {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 18px;
        transition: transform 0.2s, border-color 0.2s;
      }
      .mini:hover {
        transform: translateY(-3px);
        border-color: var(--border-strong);
      }
      .mini-info {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
      }
      .mini-info strong {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mini-info span {
        font-size: 0.8rem;
      }
      .mini-score {
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        font-size: 1.1rem;
      }
      @media (max-width: 900px) {
        .hero {
          grid-template-columns: 1fr;
        }
        .hero-orb {
          order: -1;
          height: 260px;
        }
        .features {
          grid-template-columns: repeat(2, 1fr);
        }
        .preview-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class HomeComponent {
  private api = inject(ApiService);
  loading = signal(true);
  featured = signal<RankedPlanet[]>([]);

  constructor() {
    this.api.topHabitable(30).subscribe({
      next: (r) => {
        this.featured.set(r.items.slice(0, 6));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  color = scoreColor;
  pct = scorePercent;
}
