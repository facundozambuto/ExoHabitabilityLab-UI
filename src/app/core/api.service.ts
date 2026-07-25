import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { API_BASE } from './config';
import {
  Exoplanet,
  ExoplanetListResponse,
  HabitabilityScore,
  RankingResponse,
  ArtResult,
  Methodology,
} from './models';

export interface ListFilters {
  page?: number;
  page_size?: number;
  stellar_type?: string;
  min_radius?: number;
  max_radius?: number;
  discovery_year?: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Simple in-memory caches so navigating around the app stays snappy.
  private scoreCache = new Map<number, Observable<HabitabilityScore>>();
  private ranking$?: Observable<RankingResponse>;
  private methodology$?: Observable<Methodology>;

  list(filters: ListFilters = {}): Observable<ExoplanetListResponse> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    }
    return this.http.get<ExoplanetListResponse>(`${API_BASE}/exoplanets`, { params });
  }

  get(id: number): Observable<Exoplanet> {
    return this.http.get<Exoplanet>(`${API_BASE}/exoplanets/${id}`);
  }

  score(id: number): Observable<HabitabilityScore> {
    if (!this.scoreCache.has(id)) {
      this.scoreCache.set(
        id,
        this.http.get<HabitabilityScore>(`${API_BASE}/exoplanets/${id}/score`).pipe(shareReplay(1)),
      );
    }
    return this.scoreCache.get(id)!;
  }

  topHabitable(limit = 10): Observable<RankingResponse> {
    if (!this.ranking$) {
      this.ranking$ = this.http
        .get<RankingResponse>(`${API_BASE}/exoplanets/ranking/top`, {
          params: new HttpParams().set('limit', String(limit)),
        })
        .pipe(shareReplay(1));
    }
    return this.ranking$;
  }

  methodology(): Observable<Methodology> {
    if (!this.methodology$) {
      this.methodology$ = this.http
        .get<Methodology>(`${API_BASE}/exoplanets/scoring/methodology`)
        .pipe(shareReplay(1));
    }
    return this.methodology$;
  }

  generateArt(id: number, style: string, format = 'landscape'): Observable<ArtResult> {
    const params = new HttpParams().set('style', style).set('format', format);
    return this.http.post<ArtResult>(`${API_BASE}/exoplanets/${id}/generate-art`, null, { params });
  }
}
