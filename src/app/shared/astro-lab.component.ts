import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Astrophysics } from '../core/models';
import { ScoreRingComponent } from './score-ring.component';
import { num } from './utils';

const STAR_COLORS: Record<string, string> = {
  blue: '#9bb0ff',
  'blue-white': '#aabfff',
  white: '#f8f7ff',
  'yellow-white': '#fff4e8',
  yellow: '#fff2a1',
  orange: '#ffcf8b',
  red: '#ff9d6f',
};

@Component({
  selector: 'app-astro-lab',
  standalone: true,
  imports: [CommonModule, ScoreRingComponent],
  template: `
    <section class="panel block">
      <div class="lab-head">
        <h2>🔬 Astrophysics Lab <span class="chip">powered by Astropy</span></h2>
        <button *ngIf="!data() && !loading()" class="btn btn-primary" (click)="load()">Compute ⚛️</button>
      </div>
      <p class="muted small">
        Research-grade quantities derived from this system's parameters: Kopparapu (2014) habitable zone,
        instellation, Earth Similarity Index, galactic coordinates and more.
      </p>

      <div *ngIf="loading()" class="center-load">
        <div class="spinner"></div>
        Running the numbers through Astropy…
      </div>

      <div *ngIf="data() as d" class="lab">
        <!-- ESI + verdict -->
        <div class="row-2">
          <div class="mini-panel esi" *ngIf="d.earth_similarity_index.available">
            <app-score-ring [score]="d.earth_similarity_index.esi || 0" [size]="110" />
            <div>
              <h3>Earth Similarity Index</h3>
              <p class="muted">{{ esiVerdict(d.earth_similarity_index.esi || 0) }}</p>
              <div class="esi-comp">
                <span *ngFor="let c of esiComponents(d)" class="chip">{{ c.k }}: {{ (c.v * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>

          <div class="mini-panel star" *ngIf="d.stellar_light.available">
            <div class="star-orb" [style.background]="starColor(d)" [style.box-shadow]="'0 0 40px ' + starColor(d)"></div>
            <div>
              <h3>Host star light</h3>
              <p class="muted">
                {{ d.stellar_light.approx_color }} star · {{ num(d.stellar_light.effective_temp_k, 0, ' K') }}
              </p>
              <p class="muted small">Blackbody peak (Wien): <strong>{{ num(d.stellar_light.wien_peak_nm, 0, ' nm') }}</strong></p>
            </div>
          </div>
        </div>

        <!-- Habitable Zone diagram -->
        <div class="mini-panel" *ngIf="d.habitable_zone.available">
          <h3>🌡️ Habitable zone <span class="muted small">(Kopparapu 2014)</span></h3>
          <div class="hz" [class.dim]="false">
            <svg viewBox="0 0 100 22" preserveAspectRatio="none" class="hz-svg">
              <!-- optimistic band -->
              <rect [attr.x]="x(d.habitable_zone.optimistic_inner_au)" y="6" [attr.width]="w(d.habitable_zone.optimistic_inner_au, d.habitable_zone.optimistic_outer_au)" height="10" fill="rgba(52,211,153,0.18)" />
              <!-- conservative band -->
              <rect [attr.x]="x(d.habitable_zone.conservative_inner_au)" y="6" [attr.width]="w(d.habitable_zone.conservative_inner_au, d.habitable_zone.conservative_outer_au)" height="10" fill="rgba(52,211,153,0.4)" />
              <!-- star -->
              <circle cx="0.6" cy="11" r="1.6" [attr.fill]="starColor(d)" />
              <!-- planet -->
              <circle *ngIf="d.habitable_zone.planet_semi_major_axis_au" [attr.cx]="x(d.habitable_zone.planet_semi_major_axis_au)" cy="11" r="1.4" fill="#fff" stroke="#38bdf8" stroke-width="0.5" />
            </svg>
            <div class="hz-ticks">
              <span>★</span>
              <span>{{ num(d.habitable_zone.conservative_inner_au, 3) }}</span>
              <span class="hz-label">conservative HZ</span>
              <span>{{ num(d.habitable_zone.conservative_outer_au, 3) }} AU</span>
            </div>
          </div>
          <p class="verdict" [class.good]="d.habitable_zone.in_conservative_hz" [class.warn]="!d.habitable_zone.in_conservative_hz && d.habitable_zone.in_optimistic_hz">
            <ng-container *ngIf="d.habitable_zone.in_conservative_hz">✅ Inside the conservative habitable zone — liquid water plausible.</ng-container>
            <ng-container *ngIf="!d.habitable_zone.in_conservative_hz && d.habitable_zone.in_optimistic_hz">🟡 Inside the optimistic habitable zone only.</ng-container>
            <ng-container *ngIf="!d.habitable_zone.in_conservative_hz && !d.habitable_zone.in_optimistic_hz">
              {{ (d.habitable_zone.relative_position || 0) < 0 ? '🔥 Interior to the habitable zone (too hot).' : '❄️ Exterior to the habitable zone (too cold).' }}
            </ng-container>
          </p>
        </div>

        <!-- Data grids -->
        <div class="grids">
          <div class="mini-panel" *ngIf="d.energy_budget.available">
            <h3>☀️ Energy budget</h3>
            <div class="dl">
              <div><span class="muted">Instellation</span>{{ num(d.energy_budget.instellation_earth_flux, 2, ' S⊕') }}</div>
              <div><span class="muted">= flux</span>{{ num(d.energy_budget.instellation_w_m2, 0, ' W/m²') }}</div>
              <div><span class="muted">T_eq (A=0)</span>{{ num(d.energy_budget.equilibrium_temp_bond0_k, 0, ' K') }}</div>
              <div><span class="muted">T_eq (Earth A=0.3)</span>{{ num(d.energy_budget.equilibrium_temp_bond0_3_k, 0, ' K') }}</div>
              <div><span class="muted">T_eq (Venus A=0.7)</span>{{ num(d.energy_budget.equilibrium_temp_bond0_7_k, 0, ' K') }}</div>
              <div><span class="muted">Catalog T_eq</span>{{ num(d.energy_budget.catalog_equilibrium_temp_k, 0, ' K') }}</div>
            </div>
          </div>

          <div class="mini-panel">
            <h3>🪨 Planet physics</h3>
            <div class="dl">
              <div><span class="muted">Surface gravity</span>{{ num(d.planet_physics.surface_gravity_g, 2, ' g') }}</div>
              <div><span class="muted">= </span>{{ num(d.planet_physics.surface_gravity_ms2, 1, ' m/s²') }}</div>
              <div><span class="muted">Escape velocity</span>{{ num(d.planet_physics.escape_velocity_kms, 1, ' km/s') }}</div>
              <div><span class="muted">Bulk density</span>{{ num(d.planet_physics.density_g_cm3, 2, ' g/cm³') }}</div>
            </div>
          </div>

          <div class="mini-panel" *ngIf="d.observability.transit_depth_ppm || d.observability.rv_semi_amplitude_ms">
            <h3>🛰️ Detectability</h3>
            <div class="dl">
              <div><span class="muted">Transit depth</span>{{ num(d.observability.transit_depth_ppm, 0, ' ppm') }}</div>
              <div><span class="muted">RV semi-amplitude</span>{{ num(d.observability.rv_semi_amplitude_ms, 2, ' m/s') }}</div>
              <div><span class="muted">Orbital velocity</span>{{ num(d.observability.orbital_velocity_kms, 1, ' km/s') }}</div>
            </div>
          </div>

          <div class="mini-panel galaxy-panel" *ngIf="d.galactic_position.available">
            <h3>🌌 Galactic position</h3>
            <div class="galaxy">
              <div class="disk"></div>
              <div class="sun" title="Sun"></div>
              <div class="here" [style.transform]="galaxyMarker(d)" title="This system"></div>
            </div>
            <div class="dl compact">
              <div><span class="muted">Gal. longitude ℓ</span>{{ num(d.galactic_position.galactic_longitude_deg, 1, '°') }}</div>
              <div><span class="muted">Gal. latitude b</span>{{ num(d.galactic_position.galactic_latitude_deg, 1, '°') }}</div>
              <div><span class="muted">Distance</span>{{ num(d.galactic_position.distance_light_years, 0, ' ly') }}</div>
            </div>
          </div>
        </div>

        <p class="disclaimer muted">{{ d.disclaimer }}</p>
      </div>
    </section>
  `,
  styles: [
    `
      .block {
        padding: 24px;
      }
      .lab-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .lab-head h2 {
        font-size: 1.3rem;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .small {
        font-size: 0.85rem;
      }
      .lab {
        margin-top: 18px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .mini-panel {
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 18px;
        background: rgba(6, 12, 28, 0.4);
      }
      .mini-panel h3 {
        font-size: 1rem;
        margin: 0 0 12px;
      }
      .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .esi,
      .star {
        display: flex;
        align-items: center;
        gap: 18px;
      }
      .esi h3,
      .star h3 {
        margin-bottom: 4px;
      }
      .esi-comp {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 8px;
      }
      .star-orb {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .hz {
        margin: 6px 0 10px;
      }
      .hz-svg {
        width: 100%;
        height: 60px;
        background: linear-gradient(90deg, rgba(56, 189, 248, 0.05), transparent);
        border-radius: 8px;
      }
      .hz-ticks {
        display: flex;
        justify-content: space-between;
        font-size: 0.72rem;
        color: var(--muted);
        margin-top: 2px;
      }
      .hz-label {
        color: var(--cyan);
      }
      .verdict {
        font-size: 0.9rem;
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(120, 160, 255, 0.06);
        border: 1px solid var(--border);
      }
      .verdict.good {
        border-color: rgba(52, 211, 153, 0.5);
        background: rgba(52, 211, 153, 0.08);
      }
      .verdict.warn {
        border-color: rgba(251, 191, 36, 0.4);
        background: rgba(251, 191, 36, 0.06);
      }
      .grids {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      .dl {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .dl.compact {
        grid-template-columns: 1fr;
        gap: 6px;
        margin-top: 12px;
      }
      .dl > div {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .dl .muted {
        font-size: 0.7rem;
        font-weight: 500;
      }
      .galaxy-panel {
        grid-row: span 1;
      }
      .galaxy {
        position: relative;
        width: 100%;
        height: 130px;
        display: grid;
        place-items: center;
      }
      .disk {
        position: absolute;
        width: 130px;
        height: 130px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, rgba(56, 189, 248, 0.12) 40%, transparent 72%);
        box-shadow: inset 0 0 30px rgba(120, 160, 255, 0.2);
      }
      .sun {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #fde047;
        box-shadow: 0 0 10px #fde047;
      }
      .here {
        position: absolute;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #5eead4;
        box-shadow: 0 0 12px #5eead4;
        transform-origin: center;
      }
      .disclaimer {
        font-size: 0.76rem;
        line-height: 1.5;
      }
      @media (max-width: 820px) {
        .row-2,
        .grids,
        .dl {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AstroLabComponent {
  private api = inject(ApiService);
  @Input({ required: true }) planetId!: number;

  data = signal<Astrophysics | null>(null);
  loading = signal(false);

  load(): void {
    this.loading.set(true);
    this.api.astrophysics(this.planetId).subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  starColor(d: Astrophysics): string {
    return STAR_COLORS[d.stellar_light.approx_color || 'yellow'] || '#fff2a1';
  }

  esiVerdict(esi: number): string {
    if (esi >= 0.8) return 'Very Earth-like in these bulk properties.';
    if (esi >= 0.6) return 'Moderately Earth-like.';
    if (esi >= 0.4) return 'Weakly similar to Earth.';
    return 'Quite unlike Earth.';
  }

  esiComponents(d: Astrophysics): { k: string; v: number }[] {
    const c = d.earth_similarity_index.components || {};
    return Object.entries(c).map(([k, v]) => ({ k: k.replace(/_/g, ' '), v }));
  }

  // Map an AU distance to 0..100 x-coordinate on the HZ diagram.
  private scaleMax(): number {
    const d = this.data();
    const hz = d?.habitable_zone;
    if (!hz) return 1;
    const candidates = [hz.optimistic_outer_au || 0, hz.planet_semi_major_axis_au || 0];
    return Math.max(...candidates) * 1.15 || 1;
  }
  x(au?: number | null): number {
    if (au == null) return 0;
    return Math.min(100, (au / this.scaleMax()) * 100);
  }
  w(a?: number, b?: number): number {
    return Math.max(0, this.x(b) - this.x(a));
  }

  // Place the system in the galaxy mini-map using galactic longitude + distance.
  galaxyMarker(d: Astrophysics): string {
    const l = ((d.galactic_position.galactic_longitude_deg || 0) * Math.PI) / 180;
    const dist = Math.min((d.galactic_position.distance_light_years || 0) / 4000, 1); // cap
    const radius = 8 + dist * 55;
    const dx = Math.cos(l) * radius;
    const dy = Math.sin(l) * radius;
    return `translate(${dx}px, ${dy}px)`;
  }

  num = num;
}
