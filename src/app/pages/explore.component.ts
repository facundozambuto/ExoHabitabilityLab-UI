import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, ListFilters } from '../core/api.service';
import { Exoplanet } from '../core/models';
import { PlanetOrbComponent } from '../shared/planet-orb.component';
import { num, planetType } from '../shared/utils';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PlanetOrbComponent],
  template: `
    <div class="page container">
      <header class="head">
        <h1>🔭 Explore the catalogue</h1>
        <p class="muted">{{ total() }} exoplanets from the NASA archive. Search and filter to find your world.</p>
      </header>

      <div class="filters panel">
        <input
          type="text"
          placeholder="Search by name…"
          [(ngModel)]="search"
          (keyup.enter)="applySearch()"
        />
        <select [(ngModel)]="stellarType" (change)="reload(1)">
          <option value="">All star types</option>
          <option value="O">O — blue</option>
          <option value="B">B — blue-white</option>
          <option value="A">A — white</option>
          <option value="F">F — yellow-white</option>
          <option value="G">G — sun-like</option>
          <option value="K">K — orange</option>
          <option value="M">M — red dwarf</option>
        </select>
        <select [(ngModel)]="sizeBand" (change)="reload(1)">
          <option value="">Any size</option>
          <option value="terr">Terrestrial (&lt; 1.25 R⊕)</option>
          <option value="super">Super-Earth (1.25–2)</option>
          <option value="nept">Neptune-like (2–6)</option>
          <option value="giant">Gas giant (&gt; 6)</option>
        </select>
        <button class="btn btn-primary" (click)="applySearch()">Search</button>
        <button class="btn" (click)="resetFilters()">Reset</button>
      </div>

      <div *ngIf="loading()" class="center-load"><div class="spinner"></div>Scanning the sky…</div>

      <div class="grid" *ngIf="!loading()">
        <a *ngFor="let p of items()" [routerLink]="['/planet', p.id]" class="card panel">
          <div class="card-top">
            <app-planet-orb [size]="88" [temp]="p.equilibrium_temp_k" [radius]="p.planet_radius_earth" />
          </div>
          <strong class="name">{{ p.name }}</strong>
          <span class="muted host">⭐ {{ p.host_star || 'Unknown star' }}</span>
          <div class="tags">
            <span class="chip">{{ type(p).emoji }} {{ type(p).label }}</span>
            <span class="chip" *ngIf="p.discovery_year">🗓️ {{ p.discovery_year }}</span>
          </div>
          <div class="stats">
            <div><span class="muted">Radius</span>{{ num(p.planet_radius_earth, 2, ' R⊕') }}</div>
            <div><span class="muted">Temp</span>{{ num(p.equilibrium_temp_k, 0, ' K') }}</div>
            <div><span class="muted">Distance</span>{{ num(p.distance_pc, 0, ' pc') }}</div>
          </div>
        </a>
      </div>

      <div class="empty muted" *ngIf="!loading() && items().length === 0">
        No planets match your filters. Try widening the search.
      </div>

      <div class="pager" *ngIf="!loading() && totalPages() > 1">
        <button class="btn" (click)="reload(page() - 1)" [disabled]="page() <= 1">← Prev</button>
        <span class="muted">Page {{ page() }} / {{ totalPages() }}</span>
        <button class="btn" (click)="reload(page() + 1)" [disabled]="page() >= totalPages()">Next →</button>
      </div>
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
      .filters {
        display: flex;
        gap: 12px;
        padding: 16px;
        margin-bottom: 26px;
        flex-wrap: wrap;
      }
      .filters input {
        flex: 1;
        min-width: 200px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }
      .card {
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: transform 0.2s, border-color 0.2s;
      }
      .card:hover {
        transform: translateY(-5px);
        border-color: var(--border-strong);
      }
      .card-top {
        margin-bottom: 8px;
      }
      .name {
        font-size: 1.05rem;
      }
      .host {
        font-size: 0.82rem;
        margin: 2px 0 10px;
      }
      .tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: center;
        margin-bottom: 12px;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        width: 100%;
        border-top: 1px solid var(--border);
        padding-top: 12px;
        font-size: 0.82rem;
        font-weight: 600;
      }
      .stats div {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .stats .muted {
        font-size: 0.68rem;
        font-weight: 500;
      }
      .empty {
        text-align: center;
        padding: 50px;
      }
      .pager {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        margin-top: 30px;
      }
    `,
  ],
})
export class ExploreComponent {
  private api = inject(ApiService);
  loading = signal(true);
  items = signal<Exoplanet[]>([]);
  total = signal(0);
  totalPages = signal(1);
  page = signal(1);

  search = '';
  stellarType = '';
  sizeBand = '';

  constructor() {
    this.reload(1);
  }

  private sizeRange(): { min?: number; max?: number } {
    switch (this.sizeBand) {
      case 'terr':
        return { max: 1.25 };
      case 'super':
        return { min: 1.25, max: 2 };
      case 'nept':
        return { min: 2, max: 6 };
      case 'giant':
        return { min: 6 };
      default:
        return {};
    }
  }

  reload(page: number): void {
    if (page < 1) return;
    this.loading.set(true);
    const { min, max } = this.sizeRange();
    const filters: ListFilters = {
      page,
      page_size: 24,
      stellar_type: this.stellarType || undefined,
      min_radius: min,
      max_radius: max,
    };
    this.api.list(filters).subscribe({
      next: (r) => {
        // client-side name search on top of server paging
        let items = r.items;
        if (this.search.trim()) {
          const q = this.search.trim().toLowerCase();
          items = items.filter((p) => p.name.toLowerCase().includes(q));
        }
        this.items.set(items);
        this.total.set(r.total);
        this.totalPages.set(r.total_pages);
        this.page.set(r.page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applySearch(): void {
    this.reload(1);
  }

  resetFilters(): void {
    this.search = '';
    this.stellarType = '';
    this.sizeBand = '';
    this.reload(1);
  }

  num = num;
  type = planetType;
}
