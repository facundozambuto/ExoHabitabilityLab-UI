import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';

interface Star {
  x: number;
  y: number;
  z: number; // depth for parallax / size
  tw: number; // twinkle phase
}

/**
 * Animated starfield rendered on a full-screen canvas that sits behind all
 * content. Includes slow-drifting stars, twinkling, and the occasional
 * shooting star for a bit of life.
 */
@Component({
  selector: 'app-starfield',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="starfield"></canvas>`,
  styles: [
    `
      .starfield {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        display: block;
        background:
          radial-gradient(ellipse at 20% 10%, rgba(56, 189, 248, 0.08), transparent 55%),
          radial-gradient(ellipse at 80% 80%, rgba(167, 139, 250, 0.1), transparent 50%),
          radial-gradient(ellipse at 50% 50%, #060913 0%, #02030a 70%, #010208 100%);
      }
    `,
  ],
})
export class StarfieldComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private stars: Star[] = [];
  private raf = 0;
  private w = 0;
  private h = 0;
  private shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
  private nextShoot = 0;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', this.resize);
    this.loop(0);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
  }

  private resize = () => {
    const canvas = this.canvasRef.nativeElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    canvas.width = this.w * dpr;
    canvas.height = this.h * dpr;
    canvas.style.width = this.w + 'px';
    canvas.style.height = this.h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.floor((this.w * this.h) / 5000);
    this.stars = Array.from({ length: count }, () => ({
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      z: Math.random() * 1.6 + 0.3,
      tw: Math.random() * Math.PI * 2,
    }));
  };

  private loop = (t: number) => {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    for (const s of this.stars) {
      s.tw += 0.02;
      const twinkle = 0.5 + 0.5 * Math.sin(s.tw);
      const size = s.z * (0.6 + twinkle * 0.6);
      const alpha = 0.35 + twinkle * 0.55 * Math.min(s.z, 1);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${200 + s.z * 30}, ${220 + s.z * 15}, 255, ${alpha})`;
      ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
      ctx.fill();

      // slow drift
      s.y += 0.02 * s.z;
      if (s.y > this.h) {
        s.y = 0;
        s.x = Math.random() * this.w;
      }
    }

    // occasional shooting star
    if (t > this.nextShoot && !this.shooting) {
      this.nextShoot = t + 4000 + Math.random() * 8000;
      const startX = Math.random() * this.w;
      this.shooting = { x: startX, y: -20, vx: -2 - Math.random() * 2, vy: 4 + Math.random() * 3, life: 1 };
    }
    if (this.shooting) {
      const s = this.shooting;
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
      grad.addColorStop(0, `rgba(180, 230, 255, ${s.life})`);
      grad.addColorStop(1, 'rgba(180, 230, 255, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 12, s.y - s.vy * 12);
      ctx.stroke();
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.012;
      if (s.life <= 0 || s.y > this.h) this.shooting = null;
    }

    this.raf = requestAnimationFrame(this.loop);
  };
}
