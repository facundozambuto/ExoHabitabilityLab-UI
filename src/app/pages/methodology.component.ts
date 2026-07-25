import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Methodology } from '../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page container">
      <header class="head">
        <h1>🧪 How habitability scoring works</h1>
        <p class="muted lead">
          Each world is evaluated across 13 factors grouped into stellar, planetary, orbital and derived
          categories. Every factor returns a 0–1 sub-score with a scientific explanation; a weighted
          average produces the final habitability score.
        </p>
      </header>

      <div class="cats">
        <div class="cat panel" *ngFor="let c of categories">
          <span class="cat-ico">{{ c.icon }}</span>
          <h3>{{ c.title }}</h3>
          <ul>
            <li *ngFor="let f of c.factors">{{ f }}</li>
          </ul>
        </div>
      </div>

      <div class="scale panel">
        <h2>Score categories</h2>
        <div class="bands">
          <div class="band"><span class="dot" style="background:#34d399"></span>High (≥ 75%)</div>
          <div class="band"><span class="dot" style="background:#a3e635"></span>Promising (55–75%)</div>
          <div class="band"><span class="dot" style="background:#fbbf24"></span>Moderate (40–55%)</div>
          <div class="band"><span class="dot" style="background:#fb923c"></span>Low (25–40%)</div>
          <div class="band"><span class="dot" style="background:#f87171"></span>Poor (&lt; 25%)</div>
        </div>
      </div>

      <div class="panel two" *ngIf="method() as m">
        <div>
          <h2>📚 References</h2>
          <ul class="refs">
            <li *ngFor="let r of m.references">{{ r }}</li>
          </ul>
        </div>
        <div>
          <h2>⚠️ Limitations</h2>
          <ul class="refs">
            <li *ngFor="let l of m.limitations">{{ l }}</li>
          </ul>
        </div>
      </div>
      <div *ngIf="loading()" class="center-load"><div class="spinner"></div>Loading methodology…</div>

      <div class="callout panel">
        <strong>Not a life-detection tool.</strong>
        <p class="muted">
          A high score means conditions resemble what we associate with habitability — not that life exists.
          It's a way to prioritise worlds for further study.
        </p>
        <a routerLink="/top" class="btn btn-primary">See the ranking →</a>
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
        margin-bottom: 10px;
      }
      .lead {
        max-width: 720px;
        line-height: 1.6;
      }
      .cats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 20px;
      }
      .cat {
        padding: 22px;
      }
      .cat-ico {
        font-size: 1.6rem;
      }
      .cat h3 {
        font-size: 1.05rem;
        margin: 10px 0 12px;
      }
      .cat ul {
        margin: 0;
        padding-left: 18px;
        color: var(--muted);
        font-size: 0.85rem;
        line-height: 1.8;
      }
      .scale {
        padding: 22px;
        margin-bottom: 20px;
      }
      .scale h2 {
        font-size: 1.2rem;
        margin: 0 0 16px;
      }
      .bands {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
      }
      .band {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
      }
      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      .two {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        padding: 24px;
        margin-bottom: 20px;
      }
      .two h2 {
        font-size: 1.1rem;
      }
      .refs {
        padding-left: 18px;
        color: var(--muted);
        font-size: 0.85rem;
        line-height: 1.7;
      }
      .callout {
        padding: 26px;
        text-align: center;
      }
      .callout strong {
        font-size: 1.1rem;
      }
      .callout p {
        max-width: 560px;
        margin: 10px auto 18px;
        line-height: 1.6;
      }
      @media (max-width: 900px) {
        .cats {
          grid-template-columns: repeat(2, 1fr);
        }
        .two {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class MethodologyComponent {
  private api = inject(ApiService);
  method = signal<Methodology | null>(null);
  loading = signal(true);

  categories = [
    {
      icon: '⭐',
      title: 'Stellar',
      factors: ['Stellar type', 'Stellar luminosity', 'Stellar age', 'Habitable-zone position'],
    },
    {
      icon: '🪐',
      title: 'Planetary',
      factors: ['Planet radius', 'Planet mass', 'Planet density', 'Equilibrium temperature', 'Surface gravity'],
    },
    { icon: '🛰️', title: 'Orbital', factors: ['Orbital eccentricity', 'Tidal locking'] },
    { icon: '🧲', title: 'Derived', factors: ['Atmosphere retention', 'Magnetic field'] },
  ];

  constructor() {
    this.api.methodology().subscribe({
      next: (m) => {
        this.method.set(m);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
