import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Exoplanet, HabitabilityScore, ArtResult } from '../core/models';
import { PlanetOrbComponent } from '../shared/planet-orb.component';
import { ScoreRingComponent } from '../shared/score-ring.component';
import { AstroLabComponent } from '../shared/astro-lab.component';
import { num, planetType, scoreColor } from '../shared/utils';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, PlanetOrbComponent, ScoreRingComponent, AstroLabComponent],
  template: `
    <div class="page container" *ngIf="planet() as p">
      <a routerLink="/explore" class="back muted">← Back to explore</a>

      <section class="hero panel">
        <div class="hero-visual">
          <app-planet-orb [size]="180" [temp]="p.equilibrium_temp_k" [radius]="p.planet_radius_earth" />
        </div>
        <div class="hero-body">
          <h1>{{ p.name }}</h1>
          <div class="tags">
            <span class="chip">{{ type(p).emoji }} {{ type(p).label }}</span>
            <span class="chip" *ngIf="p.host_star">⭐ {{ p.host_star }}</span>
            <span class="chip" *ngIf="p.discovery_method">🛰️ {{ p.discovery_method }}</span>
            <span class="chip" *ngIf="p.discovery_year">🗓️ {{ p.discovery_year }}</span>
          </div>
          <p class="muted summary">{{ narrative() }}</p>
        </div>
        <div class="hero-score" *ngIf="score() as s">
          <app-score-ring [score]="s.total_score" [size]="120" />
          <strong [style.color]="color(s.total_score)">{{ s.score_category }}</strong>
          <span class="muted">habitability</span>
        </div>
        <div class="hero-score" *ngIf="!score() && scoreLoading()">
          <div class="spinner"></div>
        </div>
      </section>

      <div class="cols">
        <!-- Left: data -->
        <section class="panel block">
          <h2>📊 Physical & orbital data</h2>
          <div class="data-grid">
            <div class="d"><span class="muted">Planet radius</span>{{ num(p.planet_radius_earth, 2, ' R⊕') }}</div>
            <div class="d"><span class="muted">Planet mass</span>{{ num(p.planet_mass_earth, 2, ' M⊕') }}</div>
            <div class="d"><span class="muted">Equilibrium temp</span>{{ num(p.equilibrium_temp_k, 0, ' K') }}</div>
            <div class="d"><span class="muted">Orbital period</span>{{ num(p.orbital_period_days, 2, ' d') }}</div>
            <div class="d"><span class="muted">Semi-major axis</span>{{ num(p.semi_major_axis_au, 3, ' AU') }}</div>
            <div class="d"><span class="muted">Eccentricity</span>{{ num(p.eccentricity, 3) }}</div>
            <div class="d"><span class="muted">Distance</span>{{ num(p.distance_pc, 1, ' pc') }}</div>
          </div>

          <h2 style="margin-top:26px">⭐ Host star</h2>
          <div class="data-grid">
            <div class="d"><span class="muted">Spectral type</span>{{ p.stellar_type || '—' }}</div>
            <div class="d"><span class="muted">Star mass</span>{{ num(p.stellar_mass_solar, 2, ' M☉') }}</div>
            <div class="d"><span class="muted">Star radius</span>{{ num(p.stellar_radius_solar, 2, ' R☉') }}</div>
            <div class="d"><span class="muted">Star temp</span>{{ num(p.stellar_temp_k, 0, ' K') }}</div>
          </div>
        </section>

        <!-- Right: AI art -->
        <section class="panel block art">
          <h2>🎨 AI visualization</h2>
          <p class="muted small">Generate an artistic render based on this world's real properties.</p>
          <div class="style-row">
            <button
              *ngFor="let st of styles"
              class="chip style-chip"
              [class.sel]="style === st"
              (click)="style = st"
            >
              {{ st }}
            </button>
          </div>
          <button class="btn btn-primary gen" (click)="generate(p.id)" [disabled]="artLoading()">
            {{ artLoading() ? 'Painting the cosmos…' : '✨ Generate image' }}
          </button>

          <div class="art-frame" *ngIf="artUrl()">
            <img [src]="artUrl()" [alt]="p.name" (load)="imgLoaded.set(true)" [class.show]="imgLoaded()" />
            <div class="art-loading" *ngIf="!imgLoaded()"><div class="spinner"></div><span class="muted">Rendering with Flux AI…</span></div>
          </div>
          <ul class="notes" *ngIf="art() as a">
            <li *ngFor="let n of a.scientific_notes" class="muted">• {{ n }}</li>
          </ul>
        </section>
      </div>

      <!-- Score breakdown -->
      <section class="panel block" *ngIf="score() as s">
        <div class="score-head">
          <h2>🧪 Habitability breakdown</h2>
          <span class="chip">Data completeness {{ (s.data_completeness * 100).toFixed(0) }}%</span>
        </div>
        <div class="factors">
          <div class="factor" *ngFor="let f of s.factors">
            <div class="f-top">
              <span class="f-name">{{ pretty(f.factor_name) }}</span>
              <span class="f-score" [style.color]="color(f.score)">{{ (f.score * 100).toFixed(0) }}%</span>
            </div>
            <div class="f-bar"><div class="f-fill" [style.width.%]="f.score * 100" [style.background]="color(f.score)"></div></div>
            <p class="f-exp muted">{{ f.explanation }}</p>
            <span class="f-meta muted">weight {{ (f.weight * 100).toFixed(0) }}% · {{ f.confidence }}</span>
          </div>
        </div>
        <p class="disclaimer muted">{{ s.scientific_disclaimer }}</p>
      </section>

      <!-- Astrophysics Lab (Astropy) -->
      <app-astro-lab [planetId]="p.id" />
    </div>

    <div class="page container" *ngIf="loading()"><div class="center-load"><div class="spinner"></div>Loading world…</div></div>
    <div class="page container" *ngIf="notFound()">
      <div class="panel block" style="text-align:center">
        <h2>Planet not found</h2>
        <a routerLink="/explore" class="btn">Back to explore</a>
      </div>
    </div>
  `,
  styles: [
    `
      .back {
        display: inline-block;
        margin-bottom: 18px;
      }
      .hero {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 30px;
        align-items: center;
        padding: 28px;
        margin-bottom: 20px;
      }
      .hero-body h1 {
        font-size: 2rem;
      }
      .tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 12px 0;
      }
      .summary {
        line-height: 1.6;
        max-width: 620px;
      }
      .hero-score {
        display: grid;
        place-items: center;
        gap: 4px;
        min-width: 130px;
      }
      .cols {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 20px;
        margin-bottom: 20px;
      }
      .block {
        padding: 24px;
      }
      .block h2 {
        font-size: 1.2rem;
        margin: 0 0 16px;
      }
      .data-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      .d {
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding: 10px 14px;
        background: rgba(6, 12, 28, 0.5);
        border-radius: 10px;
        border: 1px solid var(--border);
        font-weight: 600;
      }
      .d .muted {
        font-size: 0.72rem;
        font-weight: 500;
      }
      .small {
        font-size: 0.85rem;
        margin-top: -8px;
      }
      .style-row {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin: 14px 0;
      }
      .style-chip {
        cursor: pointer;
        text-transform: capitalize;
      }
      .style-chip.sel {
        border-color: var(--cyan);
        color: var(--cyan);
        background: rgba(94, 234, 212, 0.12);
      }
      .gen {
        width: 100%;
        justify-content: center;
      }
      .art-frame {
        position: relative;
        margin-top: 16px;
        border-radius: 12px;
        overflow: hidden;
        aspect-ratio: 16 / 9;
        background: rgba(6, 12, 28, 0.6);
        border: 1px solid var(--border);
      }
      .art-frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity 0.6s;
      }
      .art-frame img.show {
        opacity: 1;
      }
      .art-loading {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        gap: 10px;
        grid-auto-flow: row;
      }
      .notes {
        list-style: none;
        padding: 0;
        margin: 12px 0 0;
        font-size: 0.82rem;
        line-height: 1.6;
      }
      .score-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .factors {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      .factor {
        padding: 14px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: rgba(6, 12, 28, 0.4);
      }
      .f-top {
        display: flex;
        justify-content: space-between;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .f-score {
        font-family: 'Orbitron', sans-serif;
      }
      .f-bar {
        height: 6px;
        background: rgba(120, 160, 255, 0.12);
        border-radius: 999px;
        overflow: hidden;
      }
      .f-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.9s ease;
      }
      .f-exp {
        font-size: 0.8rem;
        line-height: 1.5;
        margin: 10px 0 6px;
      }
      .f-meta {
        font-size: 0.7rem;
      }
      .disclaimer {
        font-size: 0.78rem;
        margin-top: 18px;
        line-height: 1.5;
      }
      @media (max-width: 900px) {
        .hero {
          grid-template-columns: 1fr;
          text-align: center;
          justify-items: center;
        }
        .cols {
          grid-template-columns: 1fr;
        }
        .factors {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DetailComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  planet = signal<Exoplanet | null>(null);
  score = signal<HabitabilityScore | null>(null);
  art = signal<ArtResult | null>(null);
  loading = signal(true);
  scoreLoading = signal(true);
  artLoading = signal(false);
  notFound = signal(false);
  imgLoaded = signal(false);

  artUrl = computed(() => this.art()?.image_url ?? null);

  styles = ['realistic', 'artistic', 'cinematic', 'scientific', 'retro_scifi'];
  style = 'cinematic';

  constructor() {
    this.route.paramMap.subscribe((pm) => {
      const id = Number(pm.get('id'));
      this.load(id);
    });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.scoreLoading.set(true);
    this.planet.set(null);
    this.score.set(null);
    this.art.set(null);
    this.imgLoaded.set(false);

    this.api.get(id).subscribe({
      next: (p) => {
        this.planet.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
    this.api.score(id).subscribe({
      next: (s) => {
        this.score.set(s);
        this.scoreLoading.set(false);
      },
      error: () => this.scoreLoading.set(false),
    });
  }

  generate(id: number): void {
    this.artLoading.set(true);
    this.imgLoaded.set(false);
    this.api.generateArt(id, this.style).subscribe({
      next: (a) => {
        this.art.set(a);
        this.artLoading.set(false);
      },
      error: () => this.artLoading.set(false),
    });
  }

  narrative(): string {
    const p = this.planet();
    if (!p) return '';
    const t = this.type(p);
    const temp = p.equilibrium_temp_k;
    let climate = 'an unknown climate';
    if (temp != null) {
      if (temp > 1000) climate = 'a scorching, likely molten surface';
      else if (temp > 400) climate = 'a blistering hot environment';
      else if (temp >= 220 && temp <= 320) climate = 'temperatures that could allow liquid water';
      else if (temp < 180) climate = 'a frozen, frigid world';
      else climate = 'a cool climate';
    }
    const dist = p.distance_pc ? `${num(p.distance_pc, 0)} parsecs from Earth` : 'an unmeasured distance away';
    return `${p.name} is a ${t.label.toLowerCase()} orbiting ${p.host_star || 'its host star'}, ${dist}. It has ${climate}.`;
  }

  pretty(name: string): string {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  num = num;
  type = planetType;
  color = scoreColor;
}
