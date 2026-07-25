import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Exoplanet, HabitabilityScore } from '../core/models';
import { PlanetOrbComponent } from '../shared/planet-orb.component';
import { ScoreRingComponent } from '../shared/score-ring.component';
import { num, planetType, scoreColor } from '../shared/utils';

interface Slot {
  planet: Exoplanet;
  score: HabitabilityScore | null;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PlanetOrbComponent, ScoreRingComponent],
  template: `
    <div class="page container">
      <header class="head">
        <h1>⚖️ Compare worlds</h1>
        <p class="muted">Pick up to three planets and see their properties and habitability side by side.</p>
      </header>

      <!-- search / add -->
      <div class="picker panel" *ngIf="slots().length < 3">
        <input
          type="text"
          placeholder="Type a planet name and hit enter to search…"
          [(ngModel)]="query"
          (keyup.enter)="searchPlanets()"
        />
        <button class="btn btn-primary" (click)="searchPlanets()">Search</button>
      </div>
      <div class="results" *ngIf="results().length">
        <button *ngFor="let r of results()" class="chip add" (click)="addPlanet(r)">＋ {{ r.name }}</button>
      </div>

      <div class="empty muted" *ngIf="slots().length === 0">
        No planets selected yet. Search above, or
        <a routerLink="/top">start from the Top 10 →</a>
      </div>

      <!-- comparison -->
      <div class="board" *ngIf="slots().length" [style.grid-template-columns]="'repeat(' + slots().length + ', 1fr)'">
        <div class="col panel" *ngFor="let s of slots(); let i = index">
          <button class="remove" (click)="remove(i)" title="Remove">✕</button>
          <app-planet-orb [size]="110" [temp]="s.planet.equilibrium_temp_k" [radius]="s.planet.planet_radius_earth" />
          <a [routerLink]="['/planet', s.planet.id]" class="col-name">{{ s.planet.name }}</a>
          <span class="chip">{{ type(s.planet).emoji }} {{ type(s.planet).label }}</span>

          <div class="ring-wrap" *ngIf="s.score">
            <app-score-ring [score]="s.score.total_score" [size]="92" />
            <span class="cat" [style.color]="color(s.score.total_score)">{{ s.score.score_category }}</span>
          </div>
          <div class="ring-wrap" *ngIf="!s.score"><div class="spinner"></div></div>

          <table class="rows">
            <tr [class.best]="isBest('planet_radius_earth', s, false)">
              <td class="muted">Radius</td><td>{{ num(s.planet.planet_radius_earth, 2, ' R⊕') }}</td>
            </tr>
            <tr [class.best]="isBest('planet_mass_earth', s, false)">
              <td class="muted">Mass</td><td>{{ num(s.planet.planet_mass_earth, 2, ' M⊕') }}</td>
            </tr>
            <tr [class.best]="isClosestTemp(s)">
              <td class="muted">Temp</td><td>{{ num(s.planet.equilibrium_temp_k, 0, ' K') }}</td>
            </tr>
            <tr>
              <td class="muted">Star</td><td>{{ s.planet.stellar_type || '—' }}</td>
            </tr>
            <tr [class.best]="isBest('eccentricity', s, true)">
              <td class="muted">Eccentricity</td><td>{{ num(s.planet.eccentricity, 3) }}</td>
            </tr>
            <tr [class.best]="isBest('distance_pc', s, true)">
              <td class="muted">Distance</td><td>{{ num(s.planet.distance_pc, 0, ' pc') }}</td>
            </tr>
            <tr>
              <td class="muted">Discovered</td><td>{{ s.planet.discovery_year || '—' }}</td>
            </tr>
          </table>
        </div>
      </div>
      <p class="legend muted" *ngIf="slots().length > 1">✨ Highlighted cells mark the most favourable value for that metric.</p>
    </div>
  `,
  styles: [
    `
      .head {
        margin-bottom: 20px;
      }
      .head h1 {
        font-size: 2rem;
        margin-bottom: 6px;
      }
      .picker {
        display: flex;
        gap: 12px;
        padding: 16px;
      }
      .picker input {
        flex: 1;
      }
      .results {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 16px 0;
      }
      .add {
        cursor: pointer;
      }
      .add:hover {
        border-color: var(--cyan);
        color: var(--cyan);
      }
      .empty {
        text-align: center;
        padding: 40px;
      }
      .board {
        display: grid;
        gap: 16px;
        margin-top: 20px;
      }
      .col {
        position: relative;
        padding: 22px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 8px;
      }
      .remove {
        position: absolute;
        top: 10px;
        right: 12px;
        background: none;
        border: none;
        color: var(--muted);
        cursor: pointer;
        font-size: 1rem;
      }
      .remove:hover {
        color: #f87171;
      }
      .col-name {
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        color: var(--text);
        font-size: 1.05rem;
      }
      .ring-wrap {
        display: grid;
        place-items: center;
        gap: 4px;
        margin: 8px 0;
        min-height: 92px;
      }
      .cat {
        font-size: 0.78rem;
        font-weight: 600;
      }
      .rows {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.86rem;
      }
      .rows td {
        padding: 8px 6px;
        border-top: 1px solid var(--border);
        text-align: left;
      }
      .rows td:last-child {
        text-align: right;
        font-weight: 600;
      }
      .rows tr.best td {
        color: var(--cyan);
      }
      .rows tr.best {
        background: rgba(94, 234, 212, 0.06);
      }
      .legend {
        text-align: center;
        margin-top: 16px;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class CompareComponent {
  private api = inject(ApiService);
  slots = signal<Slot[]>([]);
  results = signal<Exoplanet[]>([]);
  query = '';

  searchPlanets(): void {
    const q = this.query.trim();
    if (!q) return;
    // Fetch a wide page and filter client-side by name (API has no name search).
    this.api.list({ page: 1, page_size: 100 }).subscribe((r) => {
      const ql = q.toLowerCase();
      this.results.set(r.items.filter((p) => p.name.toLowerCase().includes(ql)).slice(0, 12));
    });
  }

  addPlanet(p: Exoplanet): void {
    if (this.slots().length >= 3 || this.slots().some((s) => s.planet.id === p.id)) return;
    const slot: Slot = { planet: p, score: null };
    this.slots.update((s) => [...s, slot]);
    this.results.set([]);
    this.query = '';
    this.api.score(p.id).subscribe((sc) => {
      this.slots.update((slots) =>
        slots.map((s) => (s.planet.id === p.id ? { ...s, score: sc } : s)),
      );
    });
  }

  remove(i: number): void {
    this.slots.update((s) => s.filter((_, idx) => idx !== i));
  }

  /** best = min (lowerBetter) or max, across current slots for a numeric field */
  isBest(field: keyof Exoplanet, s: Slot, lowerBetter: boolean): boolean {
    const vals = this.slots()
      .map((x) => x.planet[field])
      .filter((v): v is number => typeof v === 'number');
    if (vals.length < 2) return false;
    const target = lowerBetter ? Math.min(...vals) : Math.max(...vals);
    return s.planet[field] === target;
  }

  /** closest equilibrium temp to Earth-like 288 K */
  isClosestTemp(s: Slot): boolean {
    const vals = this.slots()
      .map((x) => x.planet.equilibrium_temp_k)
      .filter((v): v is number => typeof v === 'number');
    if (vals.length < 2 || s.planet.equilibrium_temp_k == null) return false;
    const best = vals.reduce((a, b) => (Math.abs(b - 288) < Math.abs(a - 288) ? b : a));
    return s.planet.equilibrium_temp_k === best;
  }

  num = num;
  type = planetType;
  color = scoreColor;
}
