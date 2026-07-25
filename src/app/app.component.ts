import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StarfieldComponent } from './shared/starfield.component';
import { AudioService } from './core/audio.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, StarfieldComponent, CommonModule],
  template: `
    <app-starfield />

    <header class="nav">
      <div class="container nav-inner">
        <a routerLink="/" class="brand">
          <span class="brand-mark">🪐</span>
          <span class="brand-name">Exo<span class="gradient-text">Habitability</span>Lab</span>
        </a>

        <nav class="links" [class.open]="menuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="menuOpen = false">Home</a>
          <a routerLink="/top" routerLinkActive="active" (click)="menuOpen = false">Top 10</a>
          <a routerLink="/explore" routerLinkActive="active" (click)="menuOpen = false">Explore</a>
          <a routerLink="/compare" routerLinkActive="active" (click)="menuOpen = false">Compare</a>
          <a routerLink="/methodology" routerLinkActive="active" (click)="menuOpen = false">Method</a>
        </nav>

        <div class="nav-actions">
          <button
            class="sound-btn"
            (click)="audio.toggle()"
            [class.on]="audio.playing()"
            [title]="audio.playing() ? 'Pause ambient sound' : 'Play ambient sound'"
          >
            <span class="eq" [class.animate]="audio.playing()"><i></i><i></i><i></i><i></i></span>
          </button>
          <button class="burger" (click)="menuOpen = !menuOpen" aria-label="Menu">☰</button>
        </div>
      </div>
    </header>

    <main>
      <router-outlet />
    </main>

    <footer class="footer">
      <div class="container">
        <p class="muted">
          Data: NASA Exoplanet Archive · Habitability is a probabilistic indicator, not a detection of life.
        </p>
      </div>
    </footer>
  `,
  styles: [
    `
      .nav {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(4, 6, 16, 0.72);
        backdrop-filter: blur(14px);
        border-bottom: 1px solid var(--border);
      }
      .nav-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 66px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text);
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        font-size: 1.05rem;
      }
      .brand-mark {
        font-size: 1.5rem;
        filter: drop-shadow(0 0 8px rgba(94, 234, 212, 0.6));
      }
      .links {
        display: flex;
        gap: 6px;
      }
      .links a {
        color: var(--muted);
        padding: 8px 14px;
        border-radius: 999px;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.2s;
      }
      .links a:hover {
        color: var(--text);
        background: rgba(120, 160, 255, 0.08);
      }
      .links a.active {
        color: #041016;
        background: linear-gradient(120deg, var(--cyan), var(--blue));
      }
      .nav-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .sound-btn {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 1px solid var(--border-strong);
        background: rgba(120, 160, 255, 0.06);
        cursor: pointer;
        display: grid;
        place-items: center;
        transition: all 0.2s;
      }
      .sound-btn.on {
        border-color: var(--cyan);
        box-shadow: 0 0 16px rgba(94, 234, 212, 0.35);
      }
      .eq {
        display: flex;
        align-items: flex-end;
        gap: 2px;
        height: 16px;
      }
      .eq i {
        width: 3px;
        height: 5px;
        background: var(--muted);
        border-radius: 2px;
      }
      .sound-btn.on .eq i {
        background: var(--cyan);
      }
      .eq.animate i {
        animation: eq 0.9s ease-in-out infinite;
      }
      .eq.animate i:nth-child(2) {
        animation-delay: 0.15s;
      }
      .eq.animate i:nth-child(3) {
        animation-delay: 0.3s;
      }
      .eq.animate i:nth-child(4) {
        animation-delay: 0.45s;
      }
      @keyframes eq {
        0%,
        100% {
          height: 4px;
        }
        50% {
          height: 15px;
        }
      }
      .burger {
        display: none;
        background: none;
        border: none;
        color: var(--text);
        font-size: 1.4rem;
        cursor: pointer;
      }
      .footer {
        position: relative;
        z-index: 1;
        border-top: 1px solid var(--border);
        padding: 24px 0;
        text-align: center;
        font-size: 0.82rem;
      }
      @media (max-width: 760px) {
        .burger {
          display: block;
        }
        .links {
          position: absolute;
          top: 66px;
          left: 0;
          right: 0;
          flex-direction: column;
          background: rgba(4, 6, 16, 0.96);
          padding: 12px;
          border-bottom: 1px solid var(--border);
          transform: translateY(-140%);
          transition: transform 0.3s ease;
        }
        .links.open {
          transform: none;
        }
      }
    `,
  ],
})
export class AppComponent {
  audio = inject(AudioService);
  menuOpen = false;
}
