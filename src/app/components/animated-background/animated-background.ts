import { Component } from '@angular/core';
import { NgParticlesModule } from 'ng-particles';
import { Engine, ISourceOptions } from 'tsparticles-engine';
import { loadFull } from 'tsparticles';

@Component({
  selector: 'app-animated-background',
  standalone: true,
  imports: [NgParticlesModule],
  template: `
    <div class="bg-layer"></div>
    <ng-particles
      id="tsparticles"
      [options]="particlesOptions"
      (particlesLoaded)="particlesLoaded($event)"
      (particlesInit)="particlesInit($event)">
    </ng-particles>
  `,
  styles: [
    `:host{position:fixed;inset:0;z-index:0;display:block}`,
    `.bg-layer{position:absolute;inset:0;background: radial-gradient(1200px 800px at 10% 10%, rgba(59,130,246,0.18), transparent 60%),
      radial-gradient(1000px 700px at 90% 30%, rgba(236,72,153,0.14), transparent 60%),
      radial-gradient(900px 900px at 50% 120%, rgba(16,185,129,0.14), transparent 60%),
      linear-gradient(135deg, #0f172a 0%, #111827 100%);
      filter: saturate(120%) contrast(105%);
    }`,
    `#tsparticles{position:absolute;inset:0}`
  ]
})
export class AnimatedBackgroundComponent {
  particlesOptions: ISourceOptions = {
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    detectRetina: true,
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'repulse' },
        onClick: { enable: true, mode: 'push' },
        resize: true
      },
      modes: {
        repulse: { distance: 120, duration: 0.4 },
        push: { quantity: 3 }
      }
    },
    particles: {
      color: {
        value: ['#60a5fa', '#a78bfa', '#34d399', '#f472b6']
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: { default: 'out' },
        random: false,
        speed: 1.2,
        straight: false
      },
      number: {
        density: { enable: true, area: 900 },
        value: 60
      },
      opacity: { value: 0.35 },
      shape: { type: 'circle' },
      size: { value: { min: 1, max: 3 } },
      links: {
        enable: true,
        color: '#ffffff',
        opacity: 0.15,
        distance: 130,
        width: 1
      }
    }
  } as ISourceOptions;

  async particlesInit(engine: any): Promise<void> {
    await loadFull(engine as Engine);
  }

  particlesLoaded(_container: any): void {}
}
